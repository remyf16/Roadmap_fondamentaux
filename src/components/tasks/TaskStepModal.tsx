import React, { useState } from 'react';
import { useAppStore } from "@/store";
import { 
  X, 
  Plus, 
  Trash2, 
  Flag, 
  Star, 
  AlertCircle, 
  Info, 
  Target, 
  Zap, 
  Clock, 
  Save, 
  RotateCcw 
} from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import type { TaskStep } from "@/types/models"; // Importation du type corrigée

const ICON_MAP: Record<string, React.ElementType> = {
  Flag, Star, AlertCircle, Info, Target, Zap, Clock
};

export function TaskStepModal() {
  const { isOpen, taskId, tasks, updateTask, close } = useAppStore(useShallow(s => ({
    isOpen: s.isStepModalOpen,
    taskId: s.stepModalTaskId,
    tasks: s.tasks,
    updateTask: s.updateTask,
    close: s.closeStepModal
  })));

  const [text, setText] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [icon, setIcon] = useState("Flag");
  const [editingId, setEditingId] = useState<string | null>(null);

  if (!isOpen || !taskId) return null;
  
  const task = tasks.find(t => t.id === taskId);
  if (!task) return null;

  const resetForm = () => {
    setText("");
    setDate(new Date().toISOString().split('T')[0]);
    setIcon("Flag");
    setEditingId(null);
  };

  const handleEdit = (step: TaskStep) => {
    setEditingId(step.id);
    setText(step.text);
    setDate(step.date);
    setIcon(step.icon);
  };

  const handleSave = () => {
    if (!text) return;
    const currentSteps = task.steps || [];

    if (editingId) {
      const updatedSteps = currentSteps.map(s => 
        s.id === editingId 
          ? { ...s, text, date, icon } 
          : s
      );
      updateTask(taskId, { steps: updatedSteps });
    } else {
      const newStep = { id: crypto.randomUUID(), icon, text, date };
      updateTask(taskId, { steps: [...currentSteps, newStep] });
    }
    
    resetForm();
  };

  const handleRemove = (stepId: string) => {
    if (editingId === stepId) resetForm();
    updateTask(taskId, { steps: (task.steps || []).filter(s => s.id !== stepId) });
  };

  const handleClose = () => {
    resetForm();
    close();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={handleClose} />
      
      <div className="relative w-[500px] bg-white rounded-[2.5rem] shadow-2xl p-8 animate-in zoom-in-95 duration-300 border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-gray-900">Étapes de planning</h2>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X /></button>
        </div>

        <div className="space-y-3 mb-8 max-h-[300px] overflow-y-auto pr-2">
          {(!task.steps || task.steps.length === 0) && (
            <div className="text-center py-8 text-gray-400 italic">
              Aucune étape définie. Ajoutez-en une ci-dessous.
            </div>
          )}
          
          {task.steps?.map(step => {
            const Icon = ICON_MAP[step.icon] || Flag;
            const isEditing = editingId === step.id;

            return (
              <div 
                key={step.id} 
                onClick={() => handleEdit(step)}
                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer group ${
                  isEditing 
                    ? "bg-blue-50 border-blue-200 ring-1 ring-blue-100" 
                    : "bg-gray-50 border-gray-100 hover:bg-gray-100"
                }`}
              >
                <div className={`p-2 rounded-xl shadow-sm transition-colors ${isEditing ? "bg-blue-600 text-white" : "bg-white text-blue-600"}`}>
                  <Icon size={20} />
                </div>
                <div className="flex-1">
                  <p className={`font-bold text-sm ${isEditing ? "text-blue-900" : "text-gray-900"}`}>{step.text}</p>
                  <p className={`text-[11px] font-medium uppercase tracking-wider ${isEditing ? "text-blue-400" : "text-gray-400"}`}>{step.date}</p>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(step.id);
                  }} 
                  className="text-gray-300 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-white"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            );
          })}
        </div>

        <div className="pt-6 border-t border-gray-100 space-y-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              {editingId ? "Modifier l'étape" : "Nouvelle étape"}
            </span>
            {editingId && (
              <button onClick={resetForm} className="text-xs text-red-500 font-bold hover:underline flex items-center gap-1">
                <RotateCcw size={12} /> Annuler
              </button>
            )}
          </div>

          <div className="flex gap-2 justify-center">
            {Object.entries(ICON_MAP).map(([name, Icon]) => (
              <button key={name} onClick={() => setIcon(name)}
                className={`p-3 rounded-xl transition-all ${icon === name ? 'bg-blue-600 text-white shadow-lg scale-110' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>
                <Icon size={18} />
              </button>
            ))}
          </div>

          <input 
            type="text" 
            placeholder="Nom de l'étape..." 
            value={text} 
            onChange={e => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-100 outline-none text-sm transition-all" 
          />
          
          <div className="flex gap-3">
            <input 
              type="date" 
              value={date} 
              onChange={e => setDate(e.target.value)} 
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-100 outline-none" 
            />
            
            <button 
              onClick={handleSave}
              className={`px-6 py-3 text-white rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg active:scale-95 ${
                editingId 
                  ? "bg-green-600 hover:bg-green-700 shadow-green-200" 
                  : "bg-blue-600 hover:bg-blue-700 shadow-blue-200"
              }`}
            >
              {editingId ? <Save size={18} /> : <Plus size={18} strokeWidth={3} />}
              {editingId ? "Enregistrer" : "Ajouter"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}