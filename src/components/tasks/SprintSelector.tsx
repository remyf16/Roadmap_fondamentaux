import { useState, useRef, useEffect } from "react";
import { Plus, Check, Pencil } from "lucide-react";
import { useAppStore } from "@/store";
import { SprintEditModal } from "./SprintEditModal";
import type { ID } from "@/types/models";

interface SprintSelectorProps {
  taskId: ID;
}

export function SprintSelector({ taskId }: SprintSelectorProps) {
  const sprints = useAppStore((s) => s.sprints);
  const tasks = useAppStore((s) => s.tasks);
  const addSprint = useAppStore((s) => s.addSprint);
  const updateTask = useAppStore((s) => s.updateTask);

  const task = tasks.find((t) => t.id === taskId);
  const currentSprintId = task?.sprintId;
  const currentSprint = sprints.find((s) => s.id === currentSprintId);

  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newNumber, setNewNumber] = useState("");
  const [newWeekRange, setNewWeekRange] = useState("");
  const [newStartDate, setNewStartDate] = useState("");
  const [newEndDate, setNewEndDate] = useState("");
  const [editingSprintId, setEditingSprintId] = useState<ID | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = query
    ? sprints.filter((s) => s.name.toLowerCase().includes(query.toLowerCase()))
    : sprints;
  const exactMatch = sprints.some(
    (s) => s.name.toLowerCase() === query.trim().toLowerCase(),
  );
  const showCreate = query.trim().length > 0 && !exactMatch;

  const resetCreateForm = () => {
    setNewName("");
    setNewNumber("");
    setNewWeekRange("");
    setNewStartDate("");
    setNewEndDate("");
  };

  const closeDropdown = () => {
    setIsOpen(false);
    setQuery("");
    setIsCreating(false);
    resetCreateForm();
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setQuery("");
        setIsCreating(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (sprintId: ID | undefined) => {
    updateTask(taskId, { sprintId });
    closeDropdown();
  };

  const openCreateForm = () => {
    setIsCreating(true);
    setNewName(query.trim());
    setQuery("");
  };

  const handleCreate = () => {
    const name = newName.trim();
    if (!name || !newNumber || !newWeekRange || !newStartDate || !newEndDate)
      return;

    const sprint = addSprint({
      name,
      number: Number(newNumber),
      weekRange: newWeekRange,
      startDate: newStartDate,
      endDate: newEndDate,
    });
    updateTask(taskId, { sprintId: sprint.id });
    closeDropdown();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      closeDropdown();
      inputRef.current?.blur();
    }
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Display current sprint */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-lg border border-gray-200 px-3 py-2 text-left text-sm outline-none focus:border-blue-300"
      >
        <span className={currentSprint ? "text-gray-900" : "text-gray-400"}>
          {currentSprint
            ? `${currentSprint.name} (${currentSprint.weekRange})`
            : "Aucun sprint"}
        </span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg">
          {/* Search input */}
          {!isCreating && (
            <div className="border-b border-gray-100 p-2">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Rechercher…"
                className="w-full rounded-md border border-gray-200 px-2.5 py-1.5 text-sm outline-none focus:border-blue-300"
                autoFocus
              />
            </div>
          )}

          {!isCreating && (
            <div className="max-h-48 overflow-y-auto">
              {/* No sprint option */}
              <button
                onClick={() => handleSelect(undefined)}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50"
              >
                <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                  {!currentSprintId && (
                    <Check size={14} className="text-blue-600" />
                  )}
                </span>
                <span className="text-gray-500 italic">Aucun sprint</span>
              </button>

              {/* Sprint list */}
              {filtered.map((sprint) => (
                <button
                  key={sprint.id}
                  onClick={() => handleSelect(sprint.id)}
                  className="group flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50"
                >
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                    {currentSprintId === sprint.id && (
                      <Check size={14} className="text-blue-600" />
                    )}
                  </span>
                  <span className="flex-1 text-gray-700">
                    {sprint.name}{" "}
                    <span className="text-xs text-gray-400">
                      ({sprint.weekRange})
                    </span>
                  </span>
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingSprintId(sprint.id);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.stopPropagation();
                        setEditingSprintId(sprint.id);
                      }
                    }}
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded opacity-0 hover:bg-gray-200 group-hover:opacity-100"
                  >
                    <Pencil size={12} className="text-gray-400" />
                  </span>
                </button>
              ))}

              {/* Create option */}
              {showCreate && (
                <button
                  onClick={openCreateForm}
                  className="flex w-full items-center gap-2 border-t border-gray-100 px-3 py-2 text-left text-sm text-blue-600 hover:bg-blue-50"
                >
                  <Plus size={14} />
                  <span>Créer «&nbsp;{query.trim()}&nbsp;»</span>
                </button>
              )}
            </div>
          )}

          {/* Create form */}
          {isCreating && (
            <div className="p-3">
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Nouveau sprint
              </h4>
              <div className="space-y-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Nom du sprint"
                  className="w-full rounded-md border border-gray-200 px-2.5 py-1.5 text-sm outline-none focus:border-blue-300"
                  autoFocus
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={newNumber}
                    onChange={(e) => setNewNumber(e.target.value)}
                    placeholder="Numéro"
                    min={1}
                    className="w-full rounded-md border border-gray-200 px-2.5 py-1.5 text-sm outline-none focus:border-blue-300"
                  />
                  <input
                    type="text"
                    value={newWeekRange}
                    onChange={(e) => setNewWeekRange(e.target.value)}
                    placeholder="Semaines (S1-S2)"
                    className="w-full rounded-md border border-gray-200 px-2.5 py-1.5 text-sm outline-none focus:border-blue-300"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="mb-0.5 block text-xs text-gray-400">
                      Début
                    </label>
                    <input
                      type="date"
                      value={newStartDate}
                      onChange={(e) => setNewStartDate(e.target.value)}
                      className="w-full rounded-md border border-gray-200 px-2.5 py-1.5 text-sm outline-none focus:border-blue-300"
                    />
                  </div>
                  <div>
                    <label className="mb-0.5 block text-xs text-gray-400">
                      Fin
                    </label>
                    <input
                      type="date"
                      value={newEndDate}
                      onChange={(e) => setNewEndDate(e.target.value)}
                      className="w-full rounded-md border border-gray-200 px-2.5 py-1.5 text-sm outline-none focus:border-blue-300"
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => {
                      setIsCreating(false);
                      resetCreateForm();
                    }}
                    className="flex-1 rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={
                      !newName.trim() ||
                      !newNumber ||
                      !newWeekRange ||
                      !newStartDate ||
                      !newEndDate
                    }
                    className="flex-1 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    Créer
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {editingSprintId && (
        <SprintEditModal
          sprintId={editingSprintId}
          onClose={() => setEditingSprintId(null)}
        />
      )}
    </div>
  );
}
