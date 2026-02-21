// src/components/views/TimelineView/TimelineExportRenderer.tsx
import React, { useMemo } from "react";
import type { Team, Sprint, Milestone, TaskStep } from "@/types/models";
import type { GroupedRow } from "@/hooks/useGroupedTasks";
import {
  format,
  parseISO,
  isValid,
  differenceInDays,
  startOfDay,
  addDays,
  endOfMonth,
  eachMonthOfInterval,
  eachDayOfInterval,
  getDate,
} from "date-fns";
import { fr } from "date-fns/locale";

const SIDEBAR_WIDTH = 240;
const ROW_HEIGHT = 36;
const HEADER_H = 90;
const ZOOM_LEVELS = [2, 4, 6, 12, 24, 48, 96];

const C = {
  text: "#111827",
  textLight: "#6B7280",
  textLighter: "#9CA3AF",
  border: "#E5E7EB",
  bgHeader: "#F9FAFB",
  white: "#FFFFFF",
  blue: "#2563EB",
  green: "#16A34A",
  red: "#EF4444",
};

const DiamondIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill={C.red}>
    <path d="M6 0L12 6L6 12L0 6L6 0Z" />
  </svg>
);

const StepIcon = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill={C.text}>
    <circle cx="5" cy="5" r="4" />
  </svg>
);

function estimateLabelWidthPx(text: string) {
  const w = 60 + (text?.length ?? 0) * 6;
  return Math.min(Math.max(w, 90), 220);
}

function computeStepLanes(steps: TaskStep[], startDate: Date, dayWidth: number) {
  const items = (steps ?? [])
    .map((s) => {
      const d = parseISO(s.date);
      const x = isValid(d) ? differenceInDays(d, startDate) * dayWidth + dayWidth / 2 : 0;
      const labelW = estimateLabelWidthPx(s.text ?? "");
      const labelStart = x + 7 + 6;
      const labelEnd = labelStart + labelW;
      return { id: s.id, x, labelStart, labelEnd };
    })
    .sort((a, b) => a.labelStart - b.labelStart);

  const laneEnds: number[] = [];
  const laneById: Record<string, number> = {};
  const GAP = 10;

  for (const it of items) {
    let lane = 0;
    while (lane < laneEnds.length && it.labelStart < laneEnds[lane] + GAP) lane++;
    if (lane === laneEnds.length) laneEnds.push(it.labelEnd);
    else laneEnds[lane] = it.labelEnd;
    laneById[it.id] = lane;
  }

  return { laneById, lanes: laneEnds.length };
}

export function TimelineExportRenderer(props: {
  teams: Team[];
  sprints: Sprint[];
  milestones: Milestone[];
  groupedRows: GroupedRow[];
  includeSteps: boolean;
  includeFilters: boolean;
  includeGrouping: boolean;
  filters: any;
  groupByLevels: any[];
  zoomLevel: number;
  customStartDate?: string;
  customEndDate?: string;
}) {
  const dayWidth = ZOOM_LEVELS[props.zoomLevel] ?? 6;
  const showDays = props.zoomLevel >= 2;

  const { startDate, endDate, totalDays } = useMemo(() => {
    if (props.customStartDate && props.customEndDate) {
      const s = parseISO(props.customStartDate);
      const e = parseISO(props.customEndDate);
      if (isValid(s) && isValid(e)) {
        return { startDate: s, endDate: e, totalDays: differenceInDays(e, s) + 1 };
      }
    }

    const today = startOfDay(new Date());
    const allDates: string[] = [today.toISOString()];

    for (const row of props.groupedRows) {
      if (row.type === "task" && row.task) {
        allDates.push(row.task.startDate, row.task.endDate);
      }
    }
    for (const s of props.sprints) allDates.push(s.startDate, s.endDate);

    const sorted = allDates
      .filter(Boolean)
      .map((d) => parseISO(d))
      .filter((d) => isValid(d))
      .sort((a, b) => a.getTime() - b.getTime());

    const s = sorted[0] ?? today;
    const e = sorted[sorted.length - 1] ?? today;

    const s2 = addDays(s, -7);
    const e2 = addDays(e, 7);

    return {
      startDate: s2,
      endDate: e2,
      totalDays: differenceInDays(e2, s2) + 1,
    };
  }, [props.groupedRows, props.sprints, props.customStartDate, props.customEndDate]);

  const months = useMemo(
    () => eachMonthOfInterval({ start: startDate, end: endDate }),
    [startDate, endDate],
  );
  const days = useMemo(
    () => (showDays ? eachDayOfInterval({ start: startDate, end: endDate }) : []),
    [startDate, endDate, showDays],
  );

  const getX = (date: string) => {
    const d = parseISO(date);
    return !isValid(d) ? 0 : differenceInDays(d, startDate) * dayWidth;
  };

  const getW = (start: string, end: string) => {
    const s = parseISO(start);
    const e = parseISO(end);
    if (!isValid(s) || !isValid(e)) return 4;
    return Math.max((differenceInDays(e, s) + 1) * dayWidth, 4);
  };

  const today = startOfDay(new Date());
  const isTodayVisible = today >= startDate && today <= endDate;
  const todayX = differenceInDays(today, startDate) * dayWidth + dayWidth / 2;
  const todayLineLeft = SIDEBAR_WIDTH + todayX - 1.5;

  const positioned = useMemo(() => {
    let y = 0;
    const out: { row: GroupedRow; y: number; h: number }[] = [];
    for (const r of props.groupedRows) {
      if (r.type === "header") {
        out.push({ row: r, y, h: 34 });
        y += 34;
      } else {
        const base = ROW_HEIGHT;
        if (!props.includeSteps || !(r.task?.steps?.length)) {
          out.push({ row: r, y, h: base });
          y += base;
        } else {
          const layout = computeStepLanes(r.task.steps ?? [], startDate, dayWidth);
          const extra = 10 + Math.max(layout.lanes, 1) * 26;
          out.push({ row: r, y, h: base + extra });
          y += base + extra;
        }
      }
    }
    return { out, totalH: y };
  }, [props.groupedRows, props.includeSteps, startDate, dayWidth]);

  const totalW = SIDEBAR_WIDTH + totalDays * dayWidth;

  return (
    <div
      id="timeline-export-root"
      style={{
        width: totalW,
        fontFamily: "Arial, sans-serif",
        backgroundColor: C.white,
        color: C.text,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: "bold", color: C.text }}>Timeline</div>
          <div style={{ fontSize: 12, color: C.textLight, marginTop: 4 }}>
            Généré le {format(new Date(), "dd MMM yyyy HH:mm", { locale: fr })}
          </div>
        </div>
        <div style={{ textAlign: "right", fontSize: 12, color: C.textLight }}>
          <div>
            {format(startDate, "dd MMM yyyy", { locale: fr })} →{" "}
            {format(endDate, "dd MMM yyyy", { locale: fr })}
          </div>
          {props.includeFilters && (
            <div style={{ marginTop: 4 }}>
              Filtres actifs : {Object.values(props.filters).flat().length > 0 ? "Oui" : "Non"}
            </div>
          )}
        </div>
      </div>

      {/* Calendar Header */}
      <div
        style={{
          height: HEADER_H,
          border: `1px solid ${C.border}`,
          borderRadius: 8,
          overflow: "hidden",
          backgroundColor: C.white,
          position: "relative",
        }}
      >
        <div style={{ display: "flex", height: "100%" }}>
          <div style={{ width: SIDEBAR_WIDTH, borderRight: `1px solid ${C.border}` }} />
          <div style={{ position: "relative", flex: 1 }}>
            {/* Months */}
            {months.map((m) => {
              const ms = m < startDate ? startDate : m;
              const me = endOfMonth(m) > endDate ? endDate : endOfMonth(m);
              const x = differenceInDays(ms, startDate) * dayWidth;
              const w = (differenceInDays(me, ms) + 1) * dayWidth;
              return (
                <div
                  key={m.toISOString()}
                  style={{
                    position: "absolute",
                    left: x,
                    width: w,
                    height: 44,
                    top: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: "bold",
                    color: C.text,
                    borderRight: `1px solid ${C.border}`,
                    textTransform: "capitalize",
                  }}
                >
                  {format(m, "MMMM yyyy", { locale: fr })}
                </div>
              );
            })}

            {/* Days */}
            {showDays && (
              <div
                style={{
                  position: "absolute",
                  top: 44,
                  left: 0,
                  right: 0,
                  height: 46,
                  backgroundColor: "#F9FAFB",
                }}
              >
                {days.map((d, index) => {
                  const x = differenceInDays(d, startDate) * dayWidth;
                  const dayNumber = getDate(d);

                  let showLabel = false;
                  if (props.zoomLevel > 3) showLabel = true;
                  else if (props.zoomLevel === 3) showLabel = index % 2 === 0;
                  else if (props.zoomLevel === 2) showLabel = dayNumber % 5 === 0;

                  return (
                    <div
                      key={d.toISOString()}
                      style={{
                        position: "absolute",
                        left: x,
                        width: dayWidth,
                        top: 0,
                        bottom: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 10,
                        color: C.textLighter,
                        borderRight: "1px solid rgba(0,0,0,0.03)",
                      }}
                    >
                      {showLabel ? dayNumber : ""}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Today Marker */}
            {isTodayVisible && (
              <div
                style={{
                  position: "absolute",
                  left: todayX,
                  top: 55,
                  transform: "translateX(-50%)",
                  zIndex: 10,
                }}
              >
                <div
                  style={{
                    backgroundColor: C.green,
                    color: "white",
                    padding: "2px 6px",
                    borderRadius: 4,
                    fontSize: 10,
                    fontWeight: "bold",
                  }}
                >
                  {format(today, "dd MMM", { locale: fr })}
                </div>
              </div>
            )}

            {/* Milestones Heads */}
            {props.milestones.map((ms) => {
              const mx = getX(ms.date);
              const topPos = showDays ? 65 : 30;
              return (
                <div
                  key={ms.id}
                  style={{
                    position: "absolute",
                    left: mx,
                    top: topPos,
                    transform: "translateX(-50%)",
                    zIndex: 20,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      backgroundColor: C.white,
                      border: `1px solid ${C.red}`,
                      color: C.red,
                      fontSize: 9,
                      fontWeight: "bold",
                      padding: "1px 4px",
                      borderRadius: 4,
                      marginBottom: 2,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {ms.name}
                  </div>
                  <DiamondIcon />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Body */}
      <div
        style={{
          position: "relative",
          marginTop: 10,
          border: `1px solid ${C.border}`,
          borderRadius: 8,
          backgroundColor: C.white,
          height: positioned.totalH,
        }}
      >
        {/* Today Line */}
        {isTodayVisible && (
          <div
            style={{
              position: "absolute",
              left: todayLineLeft,
              top: 0,
              bottom: 0,
              width: 2,
              backgroundColor: C.green,
              zIndex: 5,
              opacity: 0.5,
            }}
          />
        )}

        {/* Milestones lines */}
        {props.milestones.map((ms) => {
          const mx = getX(ms.date);
          return (
            <div
              key={`line-${ms.id}`}
              style={{
                position: "absolute",
                left: SIDEBAR_WIDTH + mx,
                top: 0,
                bottom: 0,
                borderLeft: `2px dotted ${C.red}`,
                opacity: 0.4,
                zIndex: 4,
              }}
            />
          );
        })}

        {positioned.out.map(({ row, y, h }, idx) => {
          if (row.type === "header") {
            return (
              <div
                key={`hdr-${idx}`}
                style={{
                  position: "absolute",
                  top: y,
                  height: h,
                  width: "100%",
                  backgroundColor: "#F3F4F6",
                  borderBottom: `1px solid ${C.border}`,
                  display: "flex",
                  alignItems: "center",
                  paddingLeft: 12,
                  fontSize: 12,
                  fontWeight: "bold",
                  color: C.text,
                }}
              >
                {row.group?.label} ({row.group?.tasks.length})
              </div>
            );
          }

          const task = row.task!;
          const team = props.teams.find((t) => t.id === task.teamId);
          const x = getX(task.startDate);
          const w = getW(task.startDate, task.endDate);

          const steps = task.steps ?? [];
          const layout = computeStepLanes(steps, startDate, dayWidth);

          return (
            <div
              key={task.id}
              style={{
                position: "absolute",
                top: y,
                height: h,
                width: "100%",
                borderBottom: `1px solid ${C.border}`,
              }}
            >
              {/* Sidebar */}
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  width: SIDEBAR_WIDTH,
                  height: "100%",
                  borderRight: `1px solid ${C.border}`,
                  display: "flex",
                  alignItems: "center",
                  padding: "0 12px",
                }}
              >
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    backgroundColor: team?.color ?? C.textLighter,
                    marginRight: 10,
                  }}
                />
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: C.text,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {task.title}
                </div>
              </div>

              {/* Task Bar */}
              <div
                data-export="task-bar"
                style={{
                  position: "absolute",
                  left: SIDEBAR_WIDTH + x,
                  width: w,
                  top: 8,
                  height: 20,
                  borderRadius: 4,
                  backgroundColor: team?.color ?? C.textLighter,
                  overflow: "hidden",
                }}
              >
                {w > 60 && (
                  <span
                    data-export="task-label"
                    style={{
                      fontSize: 10,
                      fontWeight: "bold",
                      color: "rgba(255,255,255,0.95)",
                      whiteSpace: "nowrap",
                      paddingLeft: 8,
                      display: "inline-block",
                      lineHeight: "20px",
                    }}
                  >
                    {task.title}
                  </span>
                )}
              </div>

              {/* Steps */}
              {props.includeSteps &&
                steps.map((s) => {
                  const d = parseISO(s.date);
                  const sx = isValid(d)
                    ? SIDEBAR_WIDTH + differenceInDays(d, startDate) * dayWidth + dayWidth / 2
                    : SIDEBAR_WIDTH;

                  const lane = layout.laneById[s.id] ?? 0;
                  const top = ROW_HEIGHT + 8 + lane * 26;

                  return (
                    <div
                      key={s.id}
                      style={{
                        position: "absolute",
                        left: sx,
                        top,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <div
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: "50%",
                          backgroundColor: C.white,
                          border: `1px solid ${C.border}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                        }}
                      >
                        <StepIcon />
                      </div>

                      <div
                        style={{
                          backgroundColor: "rgba(255,255,255,0.95)",
                          border: `1px solid ${C.border}`,
                          padding: "2px 8px",
                          borderRadius: 4,
                          display: "flex",
                          alignItems: "center",
                          height: 18,
                          lineHeight: "normal",
                        }}
                      >
                        <span style={{ fontWeight: "bold", color: C.text, fontSize: 10, marginRight: 4 }}>
                          {s.text}
                        </span>
                        <span style={{ color: C.textLight, fontSize: 9 }}>
                          {format(parseISO(s.date), "dd/MM")}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
