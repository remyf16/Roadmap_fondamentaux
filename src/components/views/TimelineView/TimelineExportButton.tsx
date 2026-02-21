import { useMemo, useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Download, FileText, Image as ImageIcon, X, CalendarRange, CheckCircle2 } from "lucide-react";
import { useAppStore } from "@/store";
import { useFilteredTasks } from "@/hooks/useFilteredTasks";
import { useGroupedTasks } from "@/hooks/useGroupedTasks";
import type { GroupedRow } from "@/hooks/useGroupedTasks";
import type { GroupByType } from "@/types/models";
import { TimelineExportRenderer } from "./TimelineExportRenderer";
import { exportElementToPDF, exportElementToImage } from "./exportUtils";
import { startOfMonth, endOfMonth, addMonths, format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

type ExportFormat = "pdf" | "png" | "jpg";

export function TimelineExportButton() {
  const [open, setOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>("pdf");
  const [isExporting, setIsExporting] = useState(false);

  const [useCustomDates, setUseCustomDates] = useState(false);
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(endOfMonth(addMonths(new Date(), 2)), "yyyy-MM-dd"));

  const [includeSteps, setIncludeSteps] = useState(true);
  const includeFilters = true;
  const includeGrouping = true;
  const tasks = useFilteredTasks();
  const topics = useAppStore((s) => s.topics);
  const teams = useAppStore((s) => s.teams);
  const sprints = useAppStore((s) => s.sprints);
  const milestones = useAppStore((s) => s.milestones);
  const filters = useAppStore((s) => s.filters);
  const groupByLevels = useAppStore((s) => s.groupByLevels);
  const zoomLevel = useAppStore((s) => s.zoomLevel);

  const topLevelTasks = useMemo(
    () => tasks.filter((t) => !t.parentTaskId).sort((a, b) => a.order - b.order),
    [tasks]
  );

  const groupedRows: GroupedRow[] = useGroupedTasks(topLevelTasks, groupByLevels as GroupByType[], topics);

  const dateRangeSummary = useMemo(() => {
    if (topLevelTasks.length === 0) return "Aucune tâche";
    const dates = topLevelTasks.flatMap(t => [t.startDate, t.endDate]).filter(Boolean).sort();
    if (dates.length === 0) return "Pas de dates";
    return `${format(parseISO(dates[0]), "dd MMM", { locale: fr })} - ${format(parseISO(dates[dates.length-1]), "dd MMM yyyy", { locale: fr })}`;
  }, [topLevelTasks]);

  const exportRef = useRef<HTMLDivElement>(null);

  const doExport = async () => {
    const el = exportRef.current;
    if (!el) return;
    
    setIsExporting(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    el.style.backgroundColor = "white"; 
    
    const filenameBase = `timeline-export-${new Date().toISOString().slice(0, 10)}`;

    try {
      if (exportFormat === "pdf") {
        await exportElementToPDF(el, `${filenameBase}.pdf`);
      } else {
        await exportElementToImage(el, `${filenameBase}.${exportFormat}`, exportFormat);
      }
      setOpen(false); 
    } catch (e) {
      console.error("Export failed", e);
      alert("Erreur export: " + e);
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [open]);

  return (
    <>
      <button
        className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
        onClick={() => setOpen(true)}
        title="Exporter la vue actuelle"
      >
        <Download size={16} />
        Export
      </button>

      {open && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 font-sans">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => !isExporting && setOpen(false)} />
          
          <div className="relative w-[600px] max-w-full rounded-2xl bg-white shadow-2xl border border-gray-100 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
              <div>
                <h3 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                  <Download className="text-blue-600" size={20} /> 
                  Exporter la vue actuelle
                </h3>
              </div>
              <button className="p-2 rounded-full hover:bg-gray-100 transition-colors" onClick={() => setOpen(false)} disabled={isExporting}>
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
                <CheckCircle2 className="text-blue-600 shrink-0 mt-0.5" size={18} />
                <div className="text-sm text-blue-900">
                  <p className="font-bold mb-1">Résumé de la vue :</p>
                  <ul className="list-disc list-inside space-y-0.5 text-blue-800/80">
                    <li><strong>{topLevelTasks.length}</strong> tâches visibles</li>
                    <li>Période détectée : {dateRangeSummary}</li>
                    <li>Niveau de Zoom : {zoomLevel}</li>
                  </ul>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 block">Format</label>
                  <div className="flex flex-col gap-2">
                    {(["pdf", "png", "jpg"] as const).map((fmt) => (
                      <button key={fmt} onClick={() => setExportFormat(fmt)} className={`flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-bold transition-all ${exportFormat === fmt ? "bg-gray-900 border-gray-900 text-white shadow-md" : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                        <span className="flex items-center gap-2">
                          {fmt === 'pdf' ? <FileText size={16}/> : <ImageIcon size={16}/>}
                          {fmt.toUpperCase()}
                        </span>
                        {exportFormat === fmt && <div className="h-2 w-2 rounded-full bg-white" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 block">Options</label>
                  <div className="p-3 border border-gray-200 rounded-xl bg-gray-50/50">
                    <label className="flex items-center justify-between cursor-pointer mb-3">
                      <span className="text-sm font-bold text-gray-700 flex items-center gap-2">
                        <CalendarRange size={14} /> Forcer la période
                      </span>
                      <div className={`relative w-9 h-5 rounded-full transition-colors ${useCustomDates ? 'bg-blue-600' : 'bg-gray-300'}`}>
                        <input type="checkbox" className="sr-only" checked={useCustomDates} onChange={e => setUseCustomDates(e.target.checked)} />
                        <span className={`absolute left-1 top-1 bg-white w-3 h-3 rounded-full transition-transform ${useCustomDates ? 'translate-x-4' : ''}`} />
                      </div>
                    </label>
                    <div className={`space-y-2 transition-all ${!useCustomDates ? "opacity-40 pointer-events-none" : ""}`}>
                      <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full text-xs p-2 border rounded-lg" />
                      <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full text-xs p-2 border rounded-lg" />
                    </div>
                  </div>
                  
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={includeSteps} onChange={e => setIncludeSteps(e.target.checked)} className="rounded border-gray-300 text-blue-600" />
                    <span className="text-sm text-gray-600">Afficher les étapes</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="px-6 py-5 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end gap-3 shrink-0">
              <button onClick={() => setOpen(false)} disabled={isExporting} className="px-5 py-2.5 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50">
                Annuler
              </button>
              <button onClick={doExport} disabled={isExporting} className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-wait">
                {isExporting ? "Génération..." : "Télécharger"}
              </button>
            </div>
          </div>

          {/* Rendu INVISIBLE (hors-champ) pour html2canvas */}
          {/* Correction : width fit-content pour éviter le clipping + zIndex négatif */}
          <div style={{ position: "fixed", left: -20000, top: 0, width: "fit-content", padding: 24, backgroundColor: "white", zIndex: -1000 }}>
            <div ref={exportRef}>
              <TimelineExportRenderer
                teams={teams}
                sprints={sprints}
                milestones={milestones}
                groupedRows={groupedRows}
                includeSteps={includeSteps}
                includeFilters={includeFilters}
                includeGrouping={includeGrouping}
                filters={filters}
                groupByLevels={groupByLevels}
                zoomLevel={zoomLevel}
                customStartDate={useCustomDates ? startDate : undefined}
                customEndDate={useCustomDates ? endDate : undefined}
              />
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
