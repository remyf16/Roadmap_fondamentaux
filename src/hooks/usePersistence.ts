import { useEffect, useRef } from "react";
import { useAppStore } from "@/store";
import { createRepository } from "@/lib/storage";
import { seedData } from "@/data/seed";

const repo = createRepository();

export function usePersistence() {
  const tasks = useAppStore((s) => s.tasks);
  const teams = useAppStore((s) => s.teams);
  const sprints = useAppStore((s) => s.sprints);
  const dependencies = useAppStore((s) => s.dependencies);
  const milestones = useAppStore((s) => s.milestones);
  const topics = useAppStore((s) => s.topics);

  const setTasks = useAppStore((s) => s.setTasks);
  const setTeams = useAppStore((s) => s.setTeams);
  const setSprints = useAppStore((s) => s.setSprints);
  const setDependencies = useAppStore((s) => s.setDependencies);
  const setMilestones = useAppStore((s) => s.setMilestones);
  const setTopics = useAppStore((s) => s.setTopics);

  const initialized = useRef(false);

  // Load on mount
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    repo.load().then((data) => {
      const source = data ?? seedData;
      setTasks(source.tasks);
      setTeams(source.teams);
      setSprints(source.sprints);
      setDependencies(source.dependencies);
      setMilestones(source.milestones);
      setTopics(source.topics ?? []);
    });
  }, [
    setTasks,
    setTeams,
    setSprints,
    setDependencies,
    setMilestones,
    setTopics,
  ]);

  // Auto-save on changes (debounced)
  useEffect(() => {
    if (!initialized.current || tasks.length === 0) return;

    const timer = setTimeout(() => {
      repo.save({
        tasks,
        teams,
        sprints,
        dependencies,
        milestones,
        topics,
        version: 1,
      });
    }, 500);
    return () => clearTimeout(timer);
  }, [tasks, teams, sprints, dependencies, milestones, topics]);
}
