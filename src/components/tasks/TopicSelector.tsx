import { useState, useRef, useEffect } from "react";
import { X, Plus } from "lucide-react";
import { useAppStore } from "@/store";
import type { ID } from "@/types/models";

interface TopicSelectorProps {
  taskId: ID;
}

export function TopicSelector({ taskId }: TopicSelectorProps) {
  const topics = useAppStore((s) => s.topics);
  const tasks = useAppStore((s) => s.tasks);
  const addTopic = useAppStore((s) => s.addTopic);
  const updateTask = useAppStore((s) => s.updateTask);

  const task = tasks.find((t) => t.id === taskId);
  const taskTopicIds = task?.topicIds ?? [];

  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedTopics = topics.filter((t) => taskTopicIds.includes(t.id));
  const availableTopics = topics.filter((t) => !taskTopicIds.includes(t.id));
  const filtered = query
    ? availableTopics.filter((t) =>
        t.name.toLowerCase().includes(query.toLowerCase()),
      )
    : availableTopics;
  const exactMatch = topics.some(
    (t) => t.name.toLowerCase() === query.trim().toLowerCase(),
  );
  const showCreate = query.trim().length > 0 && !exactMatch;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleTopic = (topicId: ID) => {
    const newTopicIds = taskTopicIds.includes(topicId)
      ? taskTopicIds.filter((id) => id !== topicId)
      : [...taskTopicIds, topicId];
    updateTask(taskId, { topicIds: newTopicIds });
  };

  const handleSelect = (topicId: ID) => {
    toggleTopic(topicId);
    setQuery("");
    setIsOpen(false);
  };

  const handleCreate = () => {
    const name = query.trim();
    if (!name) return;
    const newTopic = addTopic(name);
    updateTask(taskId, { topicIds: [...taskTopicIds, newTopic.id] });
    setQuery("");
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      setQuery("");
      inputRef.current?.blur();
    }
    if (e.key === "Enter" && showCreate && filtered.length === 0) {
      e.preventDefault();
      handleCreate();
    }
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Selected badges */}
      {selectedTopics.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {selectedTopics.map((topic) => (
            <span
              key={topic.id}
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
              style={{
                backgroundColor: `${topic.color}20`,
                color: topic.color,
              }}
            >
              {topic.name}
              <button
                onClick={() => toggleTopic(topic.id)}
                className="rounded-full p-0.5 transition-colors hover:bg-black/10"
              >
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input */}
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder="Rechercher ou créer…"
        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-300"
      />

      {/* Dropdown */}
      {isOpen && (filtered.length > 0 || showCreate) && (
        <div className="absolute z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
          {filtered.map((topic) => (
            <button
              key={topic.id}
              onClick={() => handleSelect(topic.id)}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50"
            >
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: topic.color }}
              />
              <span className="text-gray-700">{topic.name}</span>
            </button>
          ))}
          {showCreate && (
            <button
              onClick={handleCreate}
              className="flex w-full items-center gap-2 border-t border-gray-100 px-3 py-2 text-left text-sm text-blue-600 hover:bg-blue-50"
            >
              <Plus size={14} />
              <span>Créer «&nbsp;{query.trim()}&nbsp;»</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
