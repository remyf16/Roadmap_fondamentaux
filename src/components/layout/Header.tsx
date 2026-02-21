// src/components/layout/Header.tsx
import { useAppStore } from "@/store";
import { Plus, Search, Filter, Calendar } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { TimelineExportButton } from "@/components/views/TimelineView/TimelineExportButton";

export function Header() {
  const {
    setActiveView,
    filters,
    setFilter,
    openCreatePanel,
    sidebarOpen,
    toggleSidebar,
  } = useAppStore(
    useShallow((s) => ({
      activeView: s.activeView,
      setActiveView: s.setActiveView,
      filters: s.filters,
      setFilter: s.setFilter,
      openCreatePanel: s.openCreatePanel,
      sidebarOpen: s.sidebarOpen,
      toggleSidebar: s.toggleSidebar,
    })),
  );

  const hasActiveFilters =
    filters.statuses.length > 0 ||
    filters.teamIds.length > 0 ||
    filters.sprintIds.length > 0 ||
    filters.roles.length > 0 ||
    filters.topicIds.length > 0;

  return (
    <div className="flex flex-col border-b border-gray-200 bg-white shrink-0 z-30">
      <header className="h-16 px-8 flex items-center justify-between">
        {/* Zone Gauche : Toggle Sidebar (Filtres) + Barre de recherche + Export */}
        <div className="flex items-center gap-4 flex-1 max-w-xl">
          {/* 1. Bouton Filtres */}
          <button
            onClick={toggleSidebar}
            className={`relative p-2 rounded-lg transition-all border ${
              sidebarOpen
                ? "bg-blue-50 text-blue-600 border-blue-200"
                : "bg-white text-gray-500 border-gray-200 hover:bg-gray-100"
            }`}
            title={sidebarOpen ? "Masquer les filtres" : "Afficher les filtres"}
          >
            <Filter size={18} />
            {hasActiveFilters && !sidebarOpen && (
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white" />
            )}
          </button>

          {/* 2. Barre de Recherche */}
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Rechercher une tâche..."
              value={filters?.searchQuery || ""}
              onChange={(e) => setFilter("searchQuery", e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          {/* 3. Bouton Export (à côté du champ de recherche) */}
          <TimelineExportButton />
        </div>

        {/* Zone Droite : Vue + Ajouter */}
        <div className="flex items-center gap-6">
          <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200 shadow-inner">
            <button
              onClick={() => setActiveView("timeline")}
              title="Vue Timeline"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all bg-white text-blue-600 shadow-sm ring-1 ring-black/5 cursor-default"
            >
              <Calendar size={16} />
              <span>Timeline</span>
            </button>
          </div>

          <button
            onClick={() => openCreatePanel("task")}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-100 active:scale-95"
          >
            <Plus size={18} strokeWidth={3} />
            <span>Ajouter</span>
          </button>
        </div>
      </header>
    </div>
  );
}
