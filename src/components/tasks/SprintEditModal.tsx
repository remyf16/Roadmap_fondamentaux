import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useAppStore } from "@/store";
import type { ID } from "@/types/models";

interface SprintEditModalProps {
  sprintId: ID;
  onClose: () => void;
}

export function SprintEditModal({ sprintId, onClose }: SprintEditModalProps) {
  const sprints = useAppStore((s) => s.sprints);
  const updateSprint = useAppStore((s) => s.updateSprint);

  const sprint = sprints.find((s) => s.id === sprintId);

  const [name, setName] = useState(sprint?.name ?? "");
  const [number, setNumber] = useState(String(sprint?.number ?? ""));
  const [weekRange, setWeekRange] = useState(sprint?.weekRange ?? "");
  const [startDate, setStartDate] = useState(sprint?.startDate ?? "");
  const [endDate, setEndDate] = useState(sprint?.endDate ?? "");

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!sprint) return null;

  const handleSave = () => {
    if (!name.trim() || !number || !weekRange || !startDate || !endDate) return;

    updateSprint(sprintId, {
      name: name.trim(),
      number: Number(number),
      weekRange,
      startDate,
      endDate,
    });
    onClose();
  };

  return createPortal(
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[60] bg-black/30" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-[61] flex items-center justify-center p-4">
        <div
          className="w-full max-w-md rounded-xl border border-gray-200 bg-white shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3">
            <h3 className="text-sm font-semibold text-gray-900">
              Modifier le sprint
            </h3>
            <button
              onClick={onClose}
              className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="space-y-3 p-5">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">
                Nom
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-300"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">
                  Numéro
                </label>
                <input
                  type="number"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  min={1}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-300"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">
                  Semaines
                </label>
                <input
                  type="text"
                  value={weekRange}
                  onChange={(e) => setWeekRange(e.target.value)}
                  placeholder="S1-S2"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-300"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">
                  Début
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-300"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">
                  Fin
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-300"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 border-t border-gray-200 px-5 py-3">
            <button
              onClick={onClose}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={
                !name.trim() || !number || !weekRange || !startDate || !endDate
              }
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}
