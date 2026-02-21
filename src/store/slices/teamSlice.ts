import type { StateCreator } from "zustand";
import type { Team } from "@/types/models";

export interface TeamSlice {
  teams: Team[];
  setTeams: (teams: Team[]) => void;
}

export const createTeamSlice: StateCreator<TeamSlice, [], [], TeamSlice> = (
  set,
) => ({
  teams: [],
  setTeams: (teams) => set({ teams }),
});
