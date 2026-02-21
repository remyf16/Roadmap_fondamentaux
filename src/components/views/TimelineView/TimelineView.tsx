// src/components/views/TimelineView/TimelineView.tsx
import React, { useMemo, useRef, useCallback, useState, useEffect } from "react";
import { useAppStore } from "@/store";
import { useFilteredTasks } from "@/hooks/useFilteredTasks";
import { useGroupedTasks } from "@/hooks/useGroupedTasks";
import type { GroupedRow } from "@/hooks/useGroupedTasks";
import { GroupBySelector } from "./GroupBySelector";
import { TimelineGroupHeader, GROUP_HEADER_HEIGHT } from "./TimelineGroupHeader";

import {
  differenceInDays,
  parseISO,
  format,
  eachMonthOfInterval,
  eachDayOfInterval,
  endOfMonth,
  isValid,
  addDays,
  isWeekend,
  isToday,
  getDate,
  startOfDay,
} from "date-fns";
import { fr } from "date-fns/locale";

import {
  Diamond,
  Flag,
  Star,
  AlertCircle,
  Info,
  Target,
  Zap,
  Clock,
  HelpCircle,
  ZoomIn,
  ZoomOut,
  ListTree,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import type { TaskStep } from "@/types/models";

// --- Configuration ---
const ROW_HEIGHT = 36;
const MONTH_ROW_HEIGHT = 32;
const SPRINT_ROW_HEIGHT = 28;
const DAY_ROW_HEIGHT = 24;
const SIDEBAR_WIDTH = 200;

// Niveaux de zoom (pixels par jour)
const ZOOM_LEVELS = [2, 4, 6, 12, 24, 48, 96];

const ICON_MAP: Record<string, React.ElementType> = {
  Flag,
  Star,
  AlertCircle,
  Info,
  Target,
  Zap,
  Clock,
};

// --- Steps under bar layout ---
const STEP_LINE_HEIGHT = 22;
const STEP_LINE_GAP = 8;
const STEP_ROW_PITCH = STEP_LINE_HEIGHT + STEP_LINE_GAP;

const STEP_TOP_PADDING = 8;
const STEP_BOTTOM_PADDING = 10;

const STEP_ICON_SIZE = 14;
const STEP_ICON_GAP = 6;
const STEP_LABEL_MAX_W = 200;
const STEP_MIN_GAP_PX = 10;

// Today line
const TODAY_LINE_WIDTH = 3;

function toISODateOnly(d: Date) {
  return d.toISOString().split("T")[0];
}

// Estimation simple de largeur (évite DOM measure)
function estimateLabelWidthPx(text: string) {
  const w = 60 + (text?.length ?? 0) * 6;
  return Math.min(Math.max(w, 90), STEP_LABEL_MAX_W);
}

type StepLaneLayout = {
  laneByStepId: Record<string, number>;
  lanesCount: number;
};

function computeStepLanes(opts: {
  steps: TaskStep[];
  startDate: Date;
  dayWidth: number;
}): StepLaneLayout {
  const { steps, startDate, dayWidth } = opts;
  if (!steps || steps.length === 0) return { laneByStepId: {}, lanesCount: 0 };

  const items = steps
    .map((s) => {
      const d = parseISO(s.date);
      const x = isValid(d)
        ? differenceInDays(d, startDate) * dayWidth + dayWidth / 2
        : 0;

      const labelW = estimateLabelWidthPx(s.text ?? "");
      const labelStart = x + STEP_ICON_SIZE / 2 + STEP_ICON_GAP;
      const labelEnd = labelStart + labelW;

      return { id: s.id, x, labelStart, labelEnd };
    })
    .sort((a, b) => a.labelStart - b.labelStart);

  const laneEnds: number[] = [];
  const laneByStepId: Record<string, number> = {};

  for (const it of items) {
    let lane = 0;
    while (lane < laneEnds.length) {
      if (it.labelStart >= laneEnds[lane] + STEP_MIN_GAP_PX) break;
      lane++;
    }
    if (lane === laneEnds.length) laneEnds.push(it.labelEnd);
    else laneEnds[lane] = it.labelEnd;

    laneByStepId[it.id] = lane;
  }

  return { laneByStepId, lanesCount: laneEnds.length };
}

export function TimelineView() {
  const tasks = useFilteredTasks();
  const teams = useAppStore((s) => s.teams);
  const sprints = useAppStore((s) => s.sprints);
  const topics = useAppStore((s) => s.topics);
  const milestones = useAppStore((s) => s.milestones);

  const openDetailPanel = useAppStore((s) => s.openDetailPanel);
  const openStepModal = useAppStore((s) => s.openStepModal);
  const groupByLevels = useAppStore((s) => s.groupByLevels);
  const updateTask = useAppStore((s) => s.updateTask);

  const expandedTaskIds = useAppStore((s) => s.expandedTaskIds);
  const toggleTaskStepsExpanded = useAppStore((s) => s.toggleTaskStepsExpanded);

  const zoomLevel = useAppStore((s) => s.zoomLevel);
  const increaseZoom = useAppStore((s) => s.increaseZoom);
  const decreaseZoom = useAppStore((s) => s.decreaseZoom);

  const dayWidth = ZOOM_LEVELS[zoomLevel];
  const showDays = zoomLevel >= 2;
  const headerHeight =
    SPRINT_ROW_HEIGHT + MONTH_ROW_HEIGHT + (showDays ? DAY_ROW_HEIGHT : 0);

  const scrollRef = useRef<HTMLDivElement>(null);

  // --- DRAG & DROP STATE (ref: données non-reactives) ---
  const dragRef = useRef<{
    isDragging: boolean;
    taskId: string | null;
    startX: number;
    currentX: number;
    initialStartDate: string;
    initialEndDate: string;
  }>({
    isDragging: false,
    taskId: null,
    startX: 0,
    currentX: 0,
    initialStartDate: "",
    initialEndDate: "",
  });

  // --- PANNING STATE (ref: données non-reactives) ---
  const panRef = useRef<{
    isPanning: boolean;
    startX: number;
    startY: number;
    scrollLeft: number;
    scrollTop: number;
  }>({
    isPanning: false,
    startX: 0,
    startY: 0,
    scrollLeft: 0,
    scrollTop: 0,
  });

  // ✅ États réactifs (interdiction d’accéder aux refs pendant render)
  const [isDragging, setIsDragging] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [dragSnapshot, setDragSnapshot] = useState<{
    taskId: string | null;
    deltaX: number;
  }>({ taskId: null, deltaX: 0 });

  // --- PROGRESSION AUTOMATIQUE ---
  const getAutomaticProgress = useCallback(
    (startDateStr: string, endDateStr: string) => {
      const start = parseISO(startDateStr);
      const end = parseISO(endDateStr);
      const today = startOfDay(new Date());

      if (!isValid(start) || !isValid(end)) return 0;
      if (today < start) return 0;
      if (today > end) return 100;

      const totalDuration = differenceInDays(end, start) + 1;
      const elapsed = differenceInDays(today, start) + 1;

      const progress = Math.round((elapsed / totalDuration) * 100);
      return Math.min(Math.max(progress, 0), 100);
    },
    [],
  );

  const topLevelTasks = useMemo(
    () =>
      tasks
        .filter((t) => !t.parentTaskId)
        .sort((a, b) => a.order - b.order),
    [tasks],
  );

  const groupedRows = useGroupedTasks(topLevelTasks, groupByLevels, topics);

  // --- WINDOW INTERVAL ---
  const { startDate, endDate, totalDays } = useMemo(() => {
    const today = startOfDay(new Date());

    const allDates = [
      today.toISOString(),
      ...topLevelTasks.flatMap((t) => [t.startDate, t.endDate]),
      ...sprints.flatMap((s) => [s.startDate, s.endDate]),
    ].filter(Boolean);

    if (allDates.length === 0) {
      const now = startOfDay(new Date());
      return { startDate: now, endDate: now, totalDays: 1 };
    }

    const sorted = allDates
      .map((d) => parseISO(d))
      .filter((d) => isValid(d))
      .sort((a, b) => a.getTime() - b.getTime());

    const start = sorted[0] ?? today;
    const end = sorted[sorted.length - 1] ?? today;

    const finalStart = addDays(start, -7);
    const finalEnd = addDays(end, 7);

    return {
      startDate: finalStart,
      endDate: finalEnd,
      totalDays: differenceInDays(finalEnd, finalStart) + 1,
    };
  }, [topLevelTasks, sprints]);

  const months = useMemo(
    () => eachMonthOfInterval({ start: startDate, end: endDate }),
    [startDate, endDate],
  );

  const days = useMemo(() => {
    if (!showDays) return [];
    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [startDate, endDate, showDays]);

  const getX = useCallback(
    (date: string) => {
      if (!date) return 0;
      const d = parseISO(date);
      if (!isValid(d)) return 0;
      return differenceInDays(d, startDate) * dayWidth;
    },
    [startDate, dayWidth],
  );

  const getWidth = useCallback(
    (start: string, end: string) => {
      if (!start || !end) return 4;
      const s = parseISO(start);
      const e = parseISO(end);
      if (!isValid(s) || !isValid(e)) return 4;
      return Math.max((differenceInDays(e, s) + 1) * dayWidth, 4);
    },
    [dayWidth],
  );

  const getStepPosition = useCallback(
    (stepDate: string, taskStart: string, taskEnd: string) => {
      const start = parseISO(taskStart).getTime();
      const end = parseISO(taskEnd).getTime();
      const current = parseISO(stepDate).getTime();
      const totalDuration = end - start;
      if (!Number.isFinite(totalDuration) || totalDuration <= 0) return 0;
      const position = ((current - start) / totalDuration) * 100;
      return Math.min(Math.max(position, 0), 100);
    },
    [],
  );

  // --- Today computed ONCE, shared by header + body ---
  const todayDate = startOfDay(new Date());
  const todayX = differenceInDays(todayDate, startDate) * dayWidth;
  const isTodayVisible =
    differenceInDays(todayDate, startDate) >= 0 &&
    differenceInDays(todayDate, endDate) <= 0;

  const todayCenterX = todayX + dayWidth / 2;
  const todayLineLeftInHeader = todayCenterX - TODAY_LINE_WIDTH / 2;
  const todayLineLeftInBody =
    SIDEBAR_WIDTH + todayCenterX - TODAY_LINE_WIDTH / 2;

  // --- Compute per-task expanded layout (lanes + dynamic height) ---
  const expandedSet = useMemo(() => new Set(expandedTaskIds), [expandedTaskIds]);

  const expandedMetrics = useMemo(() => {
    const laneByTaskId = new Map<string, StepLaneLayout>();
    const heightByTaskId = new Map<string, number>();

    for (const row of groupedRows) {
      if (row.type !== "task" || !row.task) continue;
      const t = row.task;
      if (!expandedSet.has(t.id)) continue;

      const layout = computeStepLanes({
        steps: t.steps ?? [],
        startDate,
        dayWidth,
      });

      laneByTaskId.set(t.id, layout);

      const lanes = Math.max(layout.lanesCount, 1);
      const h =
        STEP_TOP_PADDING +
        lanes * STEP_ROW_PITCH -
        STEP_LINE_GAP +
        STEP_BOTTOM_PADDING;

      heightByTaskId.set(t.id, h);
    }

    return { laneByTaskId, heightByTaskId };
  }, [expandedSet, groupedRows, startDate, dayWidth]);

  // --- rows positioning with dynamic heights ---
  const { positionedRows, totalContentHeight } = useMemo(() => {
    const positioned: { row: GroupedRow; y: number }[] = [];
    let currentY = 0;

    for (const row of groupedRows) {
      positioned.push({ row, y: currentY });

      if (row.type === "header") {
        currentY += GROUP_HEADER_HEIGHT;
      } else {
        const taskId = row.task?.id;
        const extra = taskId ? expandedMetrics.heightByTaskId.get(taskId) ?? 0 : 0;
        currentY += ROW_HEIGHT + extra;
      }
    }

    return { positionedRows: positioned, totalContentHeight: currentY };
  }, [groupedRows, expandedMetrics]);

  // --- AUTO-SCROLL SUR AUJOURD'HUI ---
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const containerWidth = el.clientWidth;
    const scrollPos =
      todayX - containerWidth / 2 + dayWidth / 2 + SIDEBAR_WIDTH / 2;

    el.scrollTo({ left: Math.max(0, scrollPos), behavior: "smooth" });
  }, [dayWidth, startDate, todayX]);

  // --- HANDLERS ---
  const handleTaskMouseDown = useCallback(
    (e: React.MouseEvent, taskId: string, tStartDate: string, tEndDate: string) => {
      if (e.button !== 0) return;
      e.stopPropagation();
      e.preventDefault();

      dragRef.current = {
        isDragging: true,
        taskId,
        startX: e.clientX,
        currentX: e.clientX,
        initialStartDate: tStartDate,
        initialEndDate: tEndDate,
      };

      setIsDragging(true);
      setDragSnapshot({ taskId, deltaX: 0 });
    },
    [],
  );

  const handleContainerMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 2 || e.button === 1) {
      e.preventDefault();
      panRef.current = {
        isPanning: true,
        startX: e.clientX,
        startY: e.clientY,
        scrollLeft: scrollRef.current?.scrollLeft || 0,
        scrollTop: scrollRef.current?.scrollTop || 0,
      };
      setIsPanning(true);
    }
  }, []);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  useEffect(() => {
    let rafId: number | null = null;

    const handleWindowMouseMove = (e: MouseEvent) => {
      if (dragRef.current.isDragging) {
        dragRef.current.currentX = e.clientX;

        // throttle via rAF (fluidité + évite spam setState)
        if (rafId != null) return;
        rafId = window.requestAnimationFrame(() => {
          rafId = null;
          const deltaX = dragRef.current.currentX - dragRef.current.startX;
          setDragSnapshot({ taskId: dragRef.current.taskId, deltaX });
        });
      }

      if (panRef.current.isPanning && scrollRef.current) {
        const deltaX = e.clientX - panRef.current.startX;
        const deltaY = e.clientY - panRef.current.startY;

        scrollRef.current.scrollLeft = panRef.current.scrollLeft - deltaX;
        scrollRef.current.scrollTop = panRef.current.scrollTop - deltaY;
      }
    };

    const handleWindowMouseUp = () => {
      if (dragRef.current.isDragging) {
        const { startX, currentX, taskId, initialStartDate, initialEndDate } =
          dragRef.current;

        const deltaPixels = currentX - startX;

        if (Math.abs(deltaPixels) < 5) {
          if (taskId) openDetailPanel(taskId, "task");
        } else if (taskId) {
          const deltaDays = Math.round(deltaPixels / dayWidth);
          if (deltaDays !== 0) {
            const newStart = addDays(parseISO(initialStartDate), deltaDays);
            const newEnd = addDays(parseISO(initialEndDate), deltaDays);

            updateTask(taskId, {
              startDate: toISODateOnly(newStart),
              endDate: toISODateOnly(newEnd),
            });
          }
        }

        dragRef.current.isDragging = false;
        setIsDragging(false);
        setDragSnapshot({ taskId: null, deltaX: 0 });
      }

      if (panRef.current.isPanning) {
        panRef.current.isPanning = false;
        setIsPanning(false);
      }
    };

    window.addEventListener("mousemove", handleWindowMouseMove);
    window.addEventListener("mouseup", handleWindowMouseUp);

    return () => {
      if (rafId != null) window.cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", handleWindowMouseMove);
      window.removeEventListener("mouseup", handleWindowMouseUp);
    };
  }, [dayWidth, openDetailPanel, updateTask]);

  const totalWidth = totalDays * dayWidth + SIDEBAR_WIDTH;

  const containerCursor =
    isPanning || isDragging ? "cursor-grabbing" : "cursor-default";

  return (
    <div className={`relative flex h-full flex-col select-none ${containerCursor}`}>
      <GroupBySelector />

      <div
        ref={scrollRef}
        className="flex-1 overflow-auto"
        onMouseDown={handleContainerMouseDown}
        onContextMenu={handleContextMenu}
      >
        <div
          className="relative"
          style={{
            width: totalWidth,
            minHeight: "100%",
            transition: "width 0.2s ease-out",
          }}
        >
          {/* --- STICKY HEADER --- */}
          <div
            className="sticky top-0 z-30 flex flex-col border-b border-gray-200 bg-white shadow-sm transition-[height] duration-200"
            style={{ height: headerHeight }}
          >
            {/* 1) Sprint row */}
            <div className="flex bg-gray-50/50" style={{ height: SPRINT_ROW_HEIGHT }}>
              <div className="sticky left-0 z-20 w-[200px] border-r border-gray-200 bg-white" />
              <div className="relative flex-1">
                {sprints.map((sprint, i) => {
                  const x = getX(sprint.startDate);
                  const w = getWidth(sprint.startDate, sprint.endDate);
                  const bgColors = [
                    "bg-blue-100 text-blue-700",
                    "bg-indigo-100 text-indigo-700",
                    "bg-violet-100 text-violet-700",
                  ];
                  return (
                    <div
                      key={sprint.id}
                      className={`absolute top-1 flex items-center justify-center overflow-hidden rounded-md px-2 text-[10px] font-bold uppercase tracking-wide shadow-sm ${
                        bgColors[i % bgColors.length]
                      }`}
                      style={{
                        left: x,
                        width: Math.max(0, w - 2),
                        height: SPRINT_ROW_HEIGHT - 8,
                        transition: "left 0.2s ease-out, width 0.2s ease-out",
                      }}
                    >
                      <span className="truncate">S{sprint.number}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2) Month row */}
            <div className="flex border-t border-gray-100" style={{ height: MONTH_ROW_HEIGHT }}>
              <div className="sticky left-0 z-20 flex w-[200px] items-center border-r border-gray-200 bg-white px-3 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                <span className="text-xs font-bold text-gray-400 tracking-widest uppercase">
                  PLANNING
                </span>
              </div>

              <div className="relative flex-1 bg-white">
                {months.map((month) => {
                  const monthStart = month < startDate ? startDate : month;
                  const monthEnd =
                    endOfMonth(month) > endDate ? endDate : endOfMonth(month);
                  const x = differenceInDays(monthStart, startDate) * dayWidth;
                  const w = (differenceInDays(monthEnd, monthStart) + 1) * dayWidth;

                  return (
                    <div
                      key={month.toISOString()}
                      className="absolute top-0 flex h-full flex-col items-center justify-center border-r border-gray-100"
                      style={{
                        left: x,
                        width: w,
                        transition: "left 0.2s ease-out, width 0.2s ease-out",
                      }}
                    >
                      <span className="text-xs font-bold capitalize text-gray-600">
                        {format(month, "MMMM yyyy", { locale: fr })}
                      </span>
                    </div>
                  );
                })}

                {isTodayVisible && !showDays && (
                  <div
                    className="absolute bottom-0 z-[60] flex flex-col items-center pointer-events-none"
                    style={{
                      left: todayLineLeftInHeader,
                      transition: "left 0.2s ease-out",
                    }}
                  >
                    <div className="mb-1 whitespace-nowrap rounded bg-green-600 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-sm">
                      Aujourd&apos;hui
                    </div>
                    <div className="h-0 w-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-green-600" />
                  </div>
                )}

                {!showDays &&
                  milestones.map((ms) => {
                    const x = getX(ms.date);
                    return (
                      <div
                        key={`head-${ms.id}`}
                        className="group absolute bottom-0 z-50 flex cursor-pointer flex-col items-center hover:z-[60]"
                        style={{ left: x - 9, transition: "left 0.2s ease-out" }}
                        onClick={() => openDetailPanel(ms.id, "milestone")}
                        onMouseDown={(e) => e.stopPropagation()}
                      >
                        <div className="pointer-events-none absolute bottom-6 mb-1 whitespace-nowrap rounded border border-red-100 bg-white px-2 py-1 opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                          <span className="text-xs font-bold text-red-600">{ms.name}</span>
                        </div>
                        <div className="relative top-3">
                          <div className="rotate-45 rounded-sm bg-red-500 p-1.5 shadow-md ring-2 ring-white transition-transform group-hover:scale-110">
                            <Diamond
                              size={8}
                              className="-rotate-45 text-white"
                              fill="currentColor"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* 3) Day row */}
            {showDays && (
              <div
                className="flex border-t border-gray-100 bg-gray-50/30"
                style={{ height: DAY_ROW_HEIGHT }}
              >
                <div className="sticky left-0 z-20 flex w-[200px] items-center border-r border-gray-200 bg-white/95 px-3 backdrop-blur-sm shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]" />
                <div className="relative flex-1">
                  {days.map((day, index) => {
                    const x = differenceInDays(day, startDate) * dayWidth;
                    const isWE = isWeekend(day);
                    const isTodayDate = isToday(day);
                    const dayNumber = getDate(day);

                    let showDayLabel = false;
                    if (zoomLevel > 3) showDayLabel = true;
                    else if (zoomLevel === 3) showDayLabel = index % 2 === 0;
                    else if (zoomLevel === 2) showDayLabel = dayNumber % 5 === 0;

                    return (
                      <div
                        key={day.toISOString()}
                        className={`absolute top-0 flex h-full items-center justify-center border-r border-gray-100/50 text-[10px] font-medium ${
                          isWE ? "bg-gray-100/50 text-gray-400" : "text-gray-600"
                        } ${isTodayDate ? "bg-green-50 font-black text-green-700" : ""}`}
                        style={{
                          left: x,
                          width: dayWidth,
                          transition: "left 0.2s ease-out, width 0.2s ease-out",
                        }}
                      >
                        {showDayLabel ? dayNumber : ""}
                      </div>
                    );
                  })}

                  {isTodayVisible && (
                    <div
                      className="absolute bottom-0 z-[60] flex flex-col items-center pointer-events-none"
                      style={{
                        left: todayCenterX,
                        transition: "left 0.2s ease-out",
                        transform: "translateX(-50%)",
                      }}
                    >
                      <div className="mb-0.5 whitespace-nowrap rounded bg-green-600 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-sm">
                        {format(todayDate, "dd MMM", { locale: fr })}
                      </div>
                      <div className="h-0 w-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-green-600" />
                    </div>
                  )}

                  {milestones.map((ms) => {
                    const x = getX(ms.date);
                    return (
                      <div
                        key={`head-day-${ms.id}`}
                        className="group absolute bottom-0 z-50 flex cursor-pointer flex-col items-center hover:z-[60]"
                        style={{ left: x - 9, transition: "left 0.2s ease-out" }}
                        onClick={() => openDetailPanel(ms.id, "milestone")}
                        onMouseDown={(e) => e.stopPropagation()}
                      >
                        <div className="pointer-events-none absolute bottom-6 mb-1 whitespace-nowrap rounded border border-red-100 bg-white px-2 py-1 opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                          <span className="text-xs font-bold text-red-600">{ms.name}</span>
                        </div>
                        <div className="relative top-3">
                          <div className="rotate-45 rounded-sm bg-red-500 p-1.5 shadow-md ring-2 ring-white transition-transform group-hover:scale-110">
                            <Diamond
                              size={8}
                              className="-rotate-45 text-white"
                              fill="currentColor"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* --- BODY GRID / LINES --- */}
          {isTodayVisible && (
            <div
              className="absolute z-10 pointer-events-none"
              style={{
                left: todayLineLeftInBody,
                top: headerHeight,
                height: totalContentHeight,
                width: `${TODAY_LINE_WIDTH}px`,
                backgroundColor: "#16a34a",
                transition: "left 0.2s ease-out",
              }}
            />
          )}

          {showDays &&
            days.map((day) => {
              const x = differenceInDays(day, startDate) * dayWidth;
              const isWE = isWeekend(day);
              return (
                <div
                  key={`vline-${day.toISOString()}`}
                  className={`absolute top-0 pointer-events-none ${isWE ? "bg-gray-100/30" : ""}`}
                  style={{
                    left: SIDEBAR_WIDTH + x,
                    width: dayWidth,
                    top: headerHeight,
                    height: totalContentHeight,
                    borderRight: "1px solid rgba(0,0,0,0.02)",
                    transition: "left 0.2s ease-out, width 0.2s ease-out",
                  }}
                />
              );
            })}

          {sprints.map((sprint, i) => {
            const x = getX(sprint.startDate);
            const w = getWidth(sprint.startDate, sprint.endDate);
            return (
              <div
                key={`sprint-band-${sprint.id}`}
                className="absolute pointer-events-none"
                style={{
                  top: headerHeight,
                  left: SIDEBAR_WIDTH + x,
                  width: w,
                  height: totalContentHeight,
                  backgroundColor: i % 2 === 0 ? "rgba(0,0,0,0.015)" : "transparent",
                  borderRight: "1px dashed rgba(0,0,0,0.05)",
                  transition: "left 0.2s ease-out, width 0.2s ease-out",
                }}
              />
            );
          })}

          {/* Rows */}
          {positionedRows.map(({ row, y }, i) => {
            if (row.type === "header") {
              const group = row.group!;
              return (
                <div
                  key={`group-${row.depth}-${group.key}-${i}`}
                  className="absolute z-10"
                  style={{ top: headerHeight + y, left: 0, width: "100%" }}
                >
                  <TimelineGroupHeader
                    label={group.label}
                    count={group.tasks.length}
                    color={group.color}
                    width={totalWidth}
                    depth={row.depth}
                  />
                </div>
              );
            }

            const task = row.task!;
            const team = teams.find((t) => t.id === task.teamId);
            const x = getX(task.startDate);
            const w = getWidth(task.startDate, task.endDate);

            const isDraggingThis = isDragging && dragSnapshot.taskId === task.id;
            const deltaX = isDraggingThis ? dragSnapshot.deltaX : 0;

            const autoProgress = getAutomaticProgress(task.startDate, task.endDate);

            const isExpanded = expandedSet.has(task.id);
            const layout = expandedMetrics.laneByTaskId.get(task.id);
            const expandedExtraH = expandedMetrics.heightByTaskId.get(task.id) ?? 0;
            const rowHeight = ROW_HEIGHT + expandedExtraH;

            return (
              <div
                key={task.id}
                className="absolute flex flex-col group hover:bg-gray-50/80 transition-colors"
                style={{ top: headerHeight + y, left: 0, height: rowHeight, width: "100%" }}
              >
                {/* MAIN LINE */}
                <div className="flex" style={{ height: ROW_HEIGHT }}>
                  <div className="sticky left-0 z-20 flex w-[200px] items-center border-b border-r border-gray-100 bg-white px-4 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                    <span
                      className="mr-3 h-2.5 w-2.5 rounded-full ring-2 ring-white shadow-sm"
                      style={{ backgroundColor: team?.color }}
                    />
                    <span
                      className="cursor-pointer truncate text-sm font-medium text-gray-700 transition-colors hover:text-blue-600"
                      onClick={() => openDetailPanel(task.id, "task")}
                      title={task.title}
                    >
                      {task.title}
                    </span>
                  </div>

                  <div className="relative flex-1 border-b border-gray-50/50">
                    <div
                      className={`absolute top-2 rounded-lg shadow-sm transition-shadow group/bar select-none ${
                        isDraggingThis
                          ? "z-50 opacity-90 cursor-grabbing shadow-xl ring-2 ring-blue-400"
                          : "cursor-grab hover:shadow-md hover:-translate-y-[1px]"
                      }`}
                      style={{
                        left: x,
                        width: w,
                        height: ROW_HEIGHT - 16,
                        backgroundColor: team?.color ?? "#94A3B8",
                        transform: isDraggingThis ? `translateX(${deltaX}px)` : "none",
                        transition: isDraggingThis
                          ? "none"
                          : "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                      }}
                      onMouseDown={(e) =>
                        handleTaskMouseDown(e, task.id, task.startDate, task.endDate)
                      }
                    >
                      {/* Progress fill */}
                      <div
                        className="h-full rounded-l-lg bg-black/15 pointer-events-none transition-all duration-500"
                        style={{
                          width: `${autoProgress}%`,
                          borderRadius:
                            autoProgress === 100 ? "0.5rem" : "0.5rem 0 0 0.5rem",
                        }}
                      />

                      {/* Steps markers on bar */}
                      {!isDraggingThis &&
                        task.steps?.map((step) => {
                          const Icon = ICON_MAP[step.icon] || HelpCircle;
                          const leftPos = getStepPosition(step.date, task.startDate, task.endDate);

                          return (
                            <div
                              key={step.id}
                              className="group/step absolute top-1/2 z-20 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md ring-1 ring-black/5 transition-transform hover:scale-125"
                              style={{ left: `calc(${leftPos}% - 10px)` }}
                              onMouseDown={(e) => e.stopPropagation()}
                              onClick={(e) => {
                                e.stopPropagation();
                                openStepModal(task.id);
                              }}
                              title={step.text}
                            >
                              <Icon size={10} className="text-gray-700" />
                            </div>
                          );
                        })}

                      {/* Toolbar */}
                      {!isDraggingThis && (
                        <div
                          className="absolute right-1.5 top-1/2 z-30 -translate-y-1/2 opacity-0 group-hover/bar:opacity-100 transition-opacity"
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center gap-1 rounded-full bg-black/25 backdrop-blur px-1.5 py-1 ring-1 ring-white/20 shadow-sm">
                            <button
                              className="h-6 w-6 grid place-items-center rounded-full text-white/90 hover:text-white hover:bg-white/15 transition-colors"
                              title={
                                isExpanded
                                  ? "Masquer les étapes sous la barre"
                                  : "Afficher les étapes sous la barre"
                              }
                              onClick={() => toggleTaskStepsExpanded(task.id)}
                            >
                              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>

                            <button
                              className="h-6 w-6 grid place-items-center rounded-full text-white/90 hover:text-white hover:bg-white/15 transition-colors"
                              title="Étapes de planning"
                              onClick={() => openStepModal(task.id)}
                            >
                              <ListTree size={14} />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Title inside bar */}
                      {w > 90 && (
                        <span className="pointer-events-none absolute inset-0 flex select-none items-center px-2 pr-14 text-[10px] font-bold text-white/90 drop-shadow-sm">
                          {task.title}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* EXPANDED STEPS */}
                {isExpanded && (
                  <div className="flex" style={{ height: expandedExtraH }}>
                    <div className="sticky left-0 z-20 w-[200px] border-b border-r border-gray-100 bg-white shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]" />

                    <div className="relative flex-1 border-b border-gray-50/50 bg-white/70">
                      {(task.steps ?? []).map((step) => {
                        const Icon = ICON_MAP[step.icon] || HelpCircle;

                        const d = parseISO(step.date);
                        const stepCenterX = isValid(d)
                          ? differenceInDays(d, startDate) * dayWidth + dayWidth / 2
                          : 0;

                        const lane = layout?.laneByStepId?.[step.id] ?? 0;
                        const top = STEP_TOP_PADDING + lane * STEP_ROW_PITCH;

                        return (
                          <div
                            key={`expanded-step-${task.id}-${step.id}`}
                            className="absolute"
                            style={{ left: stepCenterX, top }}
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={(e) => {
                              e.stopPropagation();
                              openStepModal(task.id);
                            }}
                            title={step.text}
                          >
                            <div className="flex items-center">
                              <div className="h-5 w-5 rounded-full bg-white shadow-sm ring-1 ring-black/5 grid place-items-center">
                                <Icon size={12} className="text-gray-700" />
                              </div>

                              <div
                                className="ml-2 rounded-lg bg-white/95 px-2 py-1 text-[10px] font-semibold text-gray-800 shadow-sm ring-1 ring-black/5"
                                style={{ maxWidth: STEP_LABEL_MAX_W }}
                              >
                                <span
                                  className="truncate inline-block align-bottom"
                                  style={{ maxWidth: STEP_LABEL_MAX_W - 48 }}
                                >
                                  {step.text}
                                </span>
                                <span className="ml-1 whitespace-nowrap text-[9px] font-medium text-gray-400">
                                  {format(parseISO(step.date), "dd MMM", { locale: fr })}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {(task.steps ?? []).length === 0 && (
                        <div
                          className="absolute text-[11px] text-gray-400 italic"
                          style={{
                            left: x + 8,
                            top: STEP_TOP_PADDING + 2,
                            maxWidth: Math.max(120, w - 16),
                          }}
                        >
                          Aucune étape — utilisez l’icône liste dans la barre.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Milestones dotted lines */}
          {milestones.map((ms) => {
            const x = getX(ms.date);
            return (
              <div
                key={`milestone-line-${ms.id}`}
                className="absolute z-0 pointer-events-none"
                style={{
                  left: SIDEBAR_WIDTH + x,
                  top: headerHeight,
                  height: totalContentHeight,
                  transition: "left 0.2s ease-out",
                }}
              >
                <div className="h-full w-[2px] border-l-2 border-dotted border-red-300/70" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Zoom controls */}
      <div className="absolute bottom-8 right-8 z-40 flex flex-col gap-2 rounded-xl border border-gray-100 bg-white p-1.5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)]">
        <button
          onClick={increaseZoom}
          disabled={zoomLevel >= ZOOM_LEVELS.length - 1}
          className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-white"
          title="Zoom avant"
        >
          <ZoomIn size={20} />
        </button>
        <div className="h-[1px] w-full bg-gray-100" />
        <button
          onClick={decreaseZoom}
          disabled={zoomLevel <= 0}
          className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-white"
          title="Zoom arrière"
        >
          <ZoomOut size={20} />
        </button>
      </div>
    </div>
  );
}
