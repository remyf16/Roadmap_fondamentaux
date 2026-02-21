import { useAppStore } from "@/store";
import { clsx } from "clsx";
import {
  Users,
  Zap,
  Briefcase,
  Tag,
  ChevronDown,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import { useState } from "react";
import type { Role } from "@/types/models";

const roleOptions: { value: Role; label: string }[] = [
  { value: "product_owner", label: "Product owner" },
  { value: "product_manager", label: "Product manager" },
  { value: "product_designer", label: "Product designer" },
  { value: "product_marketing_manager", label: "Product marketing manager" },
  { value: "direction", label: "Direction" },
  { value: "e_learning", label: "E-learning" },
  { value: "developer", label: "Développeur" },
];

export function Sidebar() {
  const teams = useAppStore((s) => s.teams);
  const sprints = useAppStore((s) => s.sprints);
  const topics = useAppStore((s) => s.topics);
  const filters = useAppStore((s) => s.filters);
  const setFilter = useAppStore((s) => s.setFilter);
  const resetFilters = useAppStore((s) => s.resetFilters);
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);

  const [teamsOpen, setTeamsOpen] = useState(true);
  const [sprintsOpen, setSprintsOpen] = useState(true);
  const [rolesOpen, setRolesOpen] = useState(true);
  const [topicsOpen, setTopicsOpen] = useState(true);

  const hasFilters =
    filters.teamIds.length > 0 ||
    filters.sprintIds.length > 0 ||
    filters.roles.length > 0 ||
    filters.topicIds.length > 0;

  if (!sidebarOpen) return null;

  const toggleTeamFilter = (teamId: string) => {
    const current = filters.teamIds;
    setFilter(
      "teamIds",
      current.includes(teamId)
        ? current.filter((id) => id !== teamId)
        : [...current, teamId],
    );
  };

  const toggleSprintFilter = (sprintId: string) => {
    const current = filters.sprintIds;
    setFilter(
      "sprintIds",
      current.includes(sprintId)
        ? current.filter((id) => id !== sprintId)
        : [...current, sprintId],
    );
  };

  const toggleRoleFilter = (role: Role) => {
    const current = filters.roles;
    setFilter(
      "roles",
      current.includes(role)
        ? current.filter((r) => r !== role)
        : [...current, role],
    );
  };

  const toggleTopicFilter = (topicId: string) => {
    const current = filters.topicIds;
    setFilter(
      "topicIds",
      current.includes(topicId)
        ? current.filter((id) => id !== topicId)
        : [...current, topicId],
    );
  };

  return (
    <aside className="flex w-60 flex-col border-r border-gray-200 bg-gray-50/50">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-gray-700">Filtres</h2>
        {hasFilters && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600"
          >
            <RotateCcw size={12} />
            Reset
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {/* Teams */}
        <button
          onClick={() => setTeamsOpen(!teamsOpen)}
          className="mb-2 flex w-full items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500"
        >
          {teamsOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          <Users size={14} />
          Équipes
        </button>
        {teamsOpen && (
          <div className="mb-4 ml-2 space-y-1">
            {teams.map((team) => (
              <label
                key={team.id}
                className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm hover:bg-gray-100"
              >
                <input
                  type="checkbox"
                  checked={filters.teamIds.includes(team.id)}
                  onChange={() => toggleTeamFilter(team.id)}
                  className="rounded"
                />
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: team.color }}
                />
                <span className="text-gray-700">{team.name}</span>
              </label>
            ))}
          </div>
        )}

        {/* Sprints */}
        <button
          onClick={() => setSprintsOpen(!sprintsOpen)}
          className="mb-2 flex w-full items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500"
        >
          {sprintsOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          <Zap size={14} />
          Sprints
        </button>
        {sprintsOpen && (
          <div className="ml-2 space-y-1">
            {sprints.map((sprint) => (
              <label
                key={sprint.id}
                className={clsx(
                  "flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm hover:bg-gray-100",
                )}
              >
                <input
                  type="checkbox"
                  checked={filters.sprintIds.includes(sprint.id)}
                  onChange={() => toggleSprintFilter(sprint.id)}
                  className="rounded"
                />
                <span className="text-gray-700">
                  {sprint.name}{" "}
                  <span className="text-xs text-gray-400">
                    ({sprint.weekRange})
                  </span>
                </span>
              </label>
            ))}
          </div>
        )}

        {/* Roles */}
        <button
          onClick={() => setRolesOpen(!rolesOpen)}
          className="mb-2 flex w-full items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500"
        >
          {rolesOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          <Briefcase size={14} />
          Métiers
        </button>
        {rolesOpen && (
          <div className="ml-2 space-y-1">
            {roleOptions.map((role) => (
              <label
                key={role.value}
                className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm hover:bg-gray-100"
              >
                <input
                  type="checkbox"
                  checked={filters.roles.includes(role.value)}
                  onChange={() => toggleRoleFilter(role.value)}
                  className="rounded"
                />
                <span className="text-gray-700">{role.label}</span>
              </label>
            ))}
          </div>
        )}

        {/* Topics */}
        {topics.length > 0 && (
          <>
            <button
              onClick={() => setTopicsOpen(!topicsOpen)}
              className="mb-2 flex w-full items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500"
            >
              {topicsOpen ? (
                <ChevronDown size={14} />
              ) : (
                <ChevronRight size={14} />
              )}
              <Tag size={14} />
              Thématiques
            </button>
            {topicsOpen && (
              <div className="ml-2 space-y-1">
                {topics.map((topic) => (
                  <label
                    key={topic.id}
                    className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm hover:bg-gray-100"
                  >
                    <input
                      type="checkbox"
                      checked={filters.topicIds.includes(topic.id)}
                      onChange={() => toggleTopicFilter(topic.id)}
                      className="rounded"
                    />
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: topic.color }}
                    />
                    <span className="text-gray-700">{topic.name}</span>
                  </label>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </aside>
  );
}
