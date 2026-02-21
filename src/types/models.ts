export type ID = string;

export interface Team {
  id: ID;
  name: string;
  color: string;
}

export interface Sprint {
  id: ID;
  name: string;
  number: number;
  startDate: string;
  endDate: string;
  weekRange: string;
}

// L'export qui manquait ou était mal défini
export type TaskStatus = "backlog" | "todo" | "in_progress" | "review" | "done";

export type Role =
  | "product_owner"
  | "product_manager"
  | "product_designer"
  | "product_marketing_manager"
  | "direction"
  | "e_learning"
  | "developer";

export type DependencyType =
  | "finish_to_start"
  | "start_to_start"
  | "finish_to_finish"
  | "start_to_finish";

export interface Dependency {
  sourceTaskId: ID;
  targetTaskId: ID;
  type: DependencyType;
}

export interface Milestone {
  id: ID;
  name: string;
  date: string;
  sprintId: ID;
  description?: string;
}

export interface Topic {
  id: ID;
  name: string;
  color: string;
}

export interface TaskStep {
  id: ID;
  icon: string;
  text: string;
  date: string;
}

export interface Task {
  id: ID;
  title: string;
  description?: string;
  status: TaskStatus;
  teamId: ID;
  sprintId?: ID;
  startDate: string;
  endDate: string;
  progress: number;
  parentTaskId?: ID;
  order: number;
  color?: string;
  tags?: string[];
  topicIds?: ID[];
  roles?: Role[];
  steps?: TaskStep[];
  createdAt: string;
  updatedAt: string;
}

export interface AppData {
  teams: Team[];
  sprints: Sprint[];
  tasks: Task[];
  dependencies: Dependency[];
  milestones: Milestone[];
  topics: Topic[];
  version: number;
}

export type ViewType = "timeline" | "kanban" | "graph" | "dependencies";

export type GroupByType = "none" | "topic" | "role" | "month";