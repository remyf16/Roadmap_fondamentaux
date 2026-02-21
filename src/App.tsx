import { lazy, Suspense } from "react";
import { useAppStore } from "@/store";
import { usePersistence } from "@/hooks/usePersistence";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { TaskDetailPanel } from "@/components/tasks/TaskDetailPanel";
import { TaskStepModal } from "@/components/tasks/TaskStepModal"; // <--- Import ajouté

const KanbanView = lazy(() =>
  import("@/components/views/KanbanView/KanbanView").then((m) => ({
    default: m.KanbanView,
  })),
);
const TimelineView = lazy(() =>
  import("@/components/views/TimelineView/TimelineView").then((m) => ({
    default: m.TimelineView,
  })),
);
const GraphView = lazy(() =>
  import("@/components/views/GraphView/GraphView").then((m) => ({
    default: m.GraphView,
  })),
);

function LoadingFallback() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
    </div>
  );
}

function App() {
  usePersistence();
  const activeView = useAppStore((s) => s.activeView);
  const tasks = useAppStore((s) => s.tasks);

  // Note : J'ai assoupli la condition de chargement pour éviter de bloquer
  // l'interface si la liste de tâches est vide au démarrage
  if (!tasks) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
          <p className="text-sm text-gray-500">Chargement de la roadmap...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-hidden">
          <Suspense fallback={<LoadingFallback />}>
            {activeView === "kanban" && <KanbanView />}
            {activeView === "timeline" && <TimelineView />}
            {activeView === "graph" && <GraphView />}
          </Suspense>
        </main>
      </div>
      
      {/* Panneaux et Modales */}
      <TaskDetailPanel />
      <TaskStepModal /> {/* <--- Le composant est maintenant rendu ici */}
    </div>
  );
}

export default App;