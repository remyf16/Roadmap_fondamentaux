import { useAppStore } from "@/store";
import { TopicSelector } from "@/components/tasks/TopicSelector";
import { SprintSelector } from "@/components/tasks/SprintSelector";
import { X, Trash2, StretchHorizontal, Flag, Plus, GitBranch } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import type { TaskStatus, Role } from "@/types/models";

const statusOptions: { value: TaskStatus; label: string }[] = [
  { value: "backlog", label: "Backlog" },
  { value: "todo", label: "À faire" },
  { value: "in_progress", label: "En cours" },
  { value: "review", label: "Revue" },
  { value: "done", label: "Terminé" },
];

const roleOptions: { value: Role; label: string }[] = [
  { value: "product_owner", label: "Product owner" },
  { value: "product_manager", label: "Product manager" },
  { value: "product_designer", label: "Product designer" },
  { value: "product_marketing_manager", label: "Product marketing manager" },
  { value: "direction", label: "Direction" },
  { value: "e_learning", label: "E-learning" },
  { value: "developer", label: "Développeur" },
];

function TaskPanel({ taskId }: { taskId: string }) {
  const store = useAppStore();
  const task = store.tasks.find((t) => t.id === taskId);
  const teams = store.teams;
  const updateTask = store.updateTask;

  const taskDeps = useAppStore(
    useShallow((s) =>
      s.dependencies.filter(
        (d) => d.sourceTaskId === taskId || d.targetTaskId === taskId,
      ),
    ),
  );

  if (!task)
    return (
      <div className="p-4 text-center text-gray-500 italic">Tâche introuvable</div>
    );


  const toggleRole = (role: Role) => {
    const currentRoles = task.roles ?? [];
    const newRoles = currentRoles.includes(role)
      ? currentRoles.filter((r) => r !== role)
      : [...currentRoles, role];

    updateTask(task.id, { roles: newRoles });
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-5">
      {/* Titre */}
      <div>
        <label className="mb-1 block text-xs font-bold text-gray-400 uppercase tracking-widest">
          Titre
        </label>
        <input
          type="text"
          value={task.title}
          onChange={(e) => updateTask(task.id, { title: e.target.value })}
          className="w-full rounded-xl border border-gray-200 bg-gray-50/30 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {/* Description */}
      <div>
        <label className="mb-1 block text-xs font-bold text-gray-400 uppercase tracking-widest">
          Description
        </label>
        <textarea
          value={task.description ?? ""}
          onChange={(e) => updateTask(task.id, { description: e.target.value })}
          rows={3}
          className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50/30 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {/* Statut & Équipe */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-xs font-bold text-gray-400 uppercase tracking-widest">
            Statut
          </label>
          <select
            value={task.status}
            onChange={(e) =>
              updateTask(task.id, { status: e.target.value as TaskStatus })
            }
            className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-sm"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold text-gray-400 uppercase tracking-widest">
            Équipe
          </label>
          <select
            value={task.teamId}
            onChange={(e) => updateTask(task.id, { teamId: e.target.value })}
            className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-sm"
          >
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Rôles */}
      <div>
        <label className="mb-2 block text-xs font-bold text-gray-400 uppercase tracking-widest">
          Métiers impliqués
        </label>
        <div className="grid grid-cols-1 gap-1.5 rounded-2xl border border-gray-100 bg-gray-50/50 p-4">
          {roleOptions.map((role) => (
            <label
              key={role.value}
              className="group flex cursor-pointer items-center gap-3 rounded-lg p-1.5 text-sm transition-colors hover:bg-white"
            >
              <input
                type="checkbox"
                checked={task.roles?.includes(role.value) ?? false}
                onChange={() => toggleRole(role.value)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-600 group-hover:text-gray-900">
                {role.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Topics & Sprints */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-xs font-bold text-gray-400 uppercase tracking-widest">
            Thématique
          </label>
          <TopicSelector taskId={task.id} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold text-gray-400 uppercase tracking-widest">
            Sprint
          </label>
          <SprintSelector taskId={task.id} />
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-xs font-bold text-gray-400 uppercase tracking-widest">
            Début
          </label>
          <input
            type="date"
            value={task.startDate}
            onChange={(e) => updateTask(task.id, { startDate: e.target.value })}
            className="w-full rounded-xl border border-gray-200 bg-white p-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold text-gray-400 uppercase tracking-widest">
            Fin
          </label>
          <input
            type="date"
            value={task.endDate}
            onChange={(e) => updateTask(task.id, { endDate: e.target.value })}
            className="w-full rounded-xl border border-gray-200 bg-white p-2 text-sm"
          />
        </div>
      </div>

      {/* Dépendances */}
      {taskDeps.length > 0 && (
        <div className="border-t border-gray-100 pt-4">
          <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase text-gray-400">
            <GitBranch size={12} /> Dépendances
          </h3>
          <div className="space-y-1">
            {taskDeps.map((dep) => (
              <div
                key={`${dep.sourceTaskId}-${dep.targetTaskId}`}
                className="rounded border border-gray-100 bg-gray-50 p-2 text-xs"
              >
                {dep.sourceTaskId === taskId ? "Sortante" : "Entrante"} : {dep.type}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* (Optionnel) Subtasks si tu veux les afficher plus tard :
          {subtasks.length > 0 && (...)} */}
    </div>
  );
}

function MilestonePanel({ milestoneId }: { milestoneId: string }) {
  const store = useAppStore();
  const milestone = store.milestones.find((m) => m.id === milestoneId);
  if (!milestone) return null;

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
      <div>
        <label className="mb-1 block text-xs font-bold text-gray-400 uppercase tracking-widest">
          Nom du jalon
        </label>
        <input
          type="text"
          value={milestone.name}
          onChange={(e) =>
            store.updateMilestone(milestone.id, { name: e.target.value })
          }
          className="w-full rounded-xl border border-gray-200 bg-gray-50/30 p-2.5 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-bold text-gray-400 uppercase tracking-widest">
          Date
        </label>
        <input
          type="date"
          value={milestone.date}
          onChange={(e) =>
            store.updateMilestone(milestone.id, { date: e.target.value })
          }
          className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-sm"
        />
      </div>
    </div>
  );
}

function LandingView({
  type,
  onConfirm,
}: {
  type: "task" | "milestone";
  onConfirm: () => void;
}) {
  const isTask = type === "task";
  return (
    <div className="flex h-full flex-col items-center justify-center space-y-8 animate-in zoom-in-95 duration-500">
      <div
        className={`rounded-[2.5rem] p-10 shadow-inner ${
          isTask ? "bg-blue-50 text-blue-600" : "bg-red-50 text-red-600"
        }`}
      >
        {isTask ? <StretchHorizontal size={72} /> : <Flag size={72} />}
      </div>
      <div className="text-center">
        <h3 className="text-2xl font-black text-gray-900">
          {isTask ? "Nouvelle Tâche" : "Nouveau Jalon"}
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          Cliquez sur confirmer pour commencer la configuration.
        </p>
      </div>
      <button
        onClick={onConfirm}
        className={`flex items-center gap-4 rounded-2xl px-12 py-5 font-black text-white shadow-2xl active:scale-95 ${
          isTask
            ? "bg-blue-600 hover:bg-blue-700 shadow-blue-200"
            : "bg-red-600 hover:bg-red-700 shadow-red-200"
        }`}
      >
        <Plus size={22} strokeWidth={3} /> Confirmer la création
      </button>
    </div>
  );
}

export function TaskDetailPanel() {
  const store = useAppStore();
  if (!store.isDetailPanelOpen) return null;

  const isLandingPage =
    (store.detailPanelContentType === "task" && !store.selectedTaskId) ||
    (store.detailPanelContentType === "milestone" && !store.selectedMilestoneId);

  const today = new Date().toISOString().split("T")[0];

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
        onClick={store.closeDetailPanel}
      />

      <div className="fixed right-0 top-0 z-50 flex h-full w-[440px] flex-col border-l border-gray-100 bg-white shadow-2xl animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between border-b border-gray-50 px-6 py-6">
          <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
            {isLandingPage ? "Nouvel élément" : "Paramètres"}
          </h2>

          <div className="flex items-center gap-3">
            {!isLandingPage && (
              <button
                onClick={() => {
                  if (store.selectedTaskId) store.deleteTask(store.selectedTaskId);
                  else if (store.selectedMilestoneId)
                    store.deleteMilestone(store.selectedMilestoneId);
                  store.closeDetailPanel();
                }}
                className="rounded-full p-2.5 text-gray-400 transition-all hover:bg-red-50 hover:text-red-500"
              >
                <Trash2 size={20} />
              </button>
            )}
            <button
              onClick={store.closeDetailPanel}
              className="rounded-full p-2.5 text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-900"
            >
              <X size={22} />
            </button>
          </div>
        </div>

        <div className="px-6 pt-7">
          <label className="mb-3 block text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">
            Nature
          </label>
          <div className="flex rounded-2xl bg-gray-100 p-1.5 shadow-inner">
            <button
              type="button"
              onClick={() => store.setDetailPanelContentType("task")}
              className={`flex flex-1 items-center justify-center gap-3 rounded-xl py-3.5 text-sm font-bold transition-all ${
                store.detailPanelContentType === "task"
                  ? "bg-white text-blue-600 shadow-md"
                  : "text-gray-500"
              }`}
            >
              <StretchHorizontal size={18} /> Tâche
            </button>
            <button
              type="button"
              onClick={() => store.setDetailPanelContentType("milestone")}
              className={`flex flex-1 items-center justify-center gap-3 rounded-xl py-3.5 text-sm font-bold transition-all ${
                store.detailPanelContentType === "milestone"
                  ? "bg-white text-red-600 shadow-md"
                  : "text-gray-500"
              }`}
            >
              <Flag size={18} /> Jalon
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-8">
          {store.detailPanelContentType === "task" ? (
            store.selectedTaskId ? (
              <TaskPanel taskId={store.selectedTaskId} />
            ) : (
              <LandingView
                type="task"
                onConfirm={() =>
                  store.createTask({
                    title: "Nouvelle tâche",
                    status: "todo",
                    startDate: today,
                    endDate: today,
                    teamId: store.teams[0]?.id || "",
                    // progress retiré (si ton modèle le requiert encore, laisse 0 ici)
                    roles: [],
                    description: "",
                  })
                }
              />
            )
          ) : store.selectedMilestoneId ? (
            <MilestonePanel milestoneId={store.selectedMilestoneId} />
          ) : (
            <LandingView
              type="milestone"
              onConfirm={() =>
                store.createMilestone({
                  name: "Nouveau jalon",
                  date: today,
                })
              }
            />
          )}
        </div>
      </div>
    </>
  );
}
