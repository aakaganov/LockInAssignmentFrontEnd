import { defineStore } from "pinia";
import * as api from "./apiClient";

export const useAppStore = defineStore("app", {
  state: () => ({
    users: [] as any[],
    tasks: [] as any[],
    confirmations: [] as any[],
    groups: [] as any[],
    leaderboardTasks: [] as any[],
    leaderboardTime: [] as any[],
  }),
  actions: {
    async fetchUsers() {
      // call api.getUsers() if you have such endpoint
      // update reactive state
    },
    async fetchTasks(ownerId: string) {
      this.tasks = await api.listTasks(ownerId);
    },
    async createTask(
      ownerId: string,
      title: string,
      description: string | null,
      dueDate: string | null,
      estimatedTime: number,
    ) {
      await api.createTask(ownerId, title, description, dueDate, estimatedTime);
      await this.fetchTasks(ownerId);
    },
    // Add more actions for confirmations, groups, leaderboard...
  },
});
