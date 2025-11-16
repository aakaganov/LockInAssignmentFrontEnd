// stores/leaderboardStore.ts
import { defineStore } from "pinia";
import { getLeaderboardByTasks, getLeaderboardByTime } from "../apiClient";

interface TaskLeaderboardEntry {
  userId: string;
  completedCount: number;
}

interface TimeLeaderboardEntry {
  userId: string;
  completedMinutes: number;
}

export const useLeaderboardStore = defineStore("leaderboardStore", {
  state: () => ({
    byTasks: [] as TaskLeaderboardEntry[],
    byTime: [] as TimeLeaderboardEntry[],
    loading: false,
    error: null as string | null,
  }),

  getters: {
    leaderboardTasks: (state) => state.byTasks,
    leaderboardTime: (state) => state.byTime,
  },

  actions: {
    /** Sync both leaderboards (tasks + time) */
    async syncLeaderboard(groupId: string) {
      this.loading = true;
      this.error = null;

      try {
        const [tasks, time] = await Promise.all([
          getLeaderboardByTasks(groupId),
          getLeaderboardByTime(groupId),
        ]);

        this.byTasks = tasks.leaderboard || [];
        this.byTime = time.leaderboard || [];
      } catch (err: any) {
        console.error("Leaderboard sync error:", err);
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },

    /** Original functions kept 100% intact */
    async fetchByTasks(groupId: string) {
      console.log("Fetching tasks leaderboard for group:", groupId);
      this.loading = true;
      this.error = null;

      try {
        const result = await getLeaderboardByTasks(groupId);
        this.byTasks = result.leaderboard || [];
      } catch (err: any) {
        console.error("Leaderboard fetchByTasks error:", err);
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },

    async fetchByTime(groupId: string) {
      console.log("Fetching time leaderboard for group:", groupId);
      this.loading = true;
      this.error = null;

      try {
        const result = await getLeaderboardByTime(groupId);
        this.byTime = result.leaderboard || [];
      } catch (err: any) {
        console.error("Leaderboard fetchByTime error:", err);
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },

    /** Your existing combined call — preserved */
    async fetchLeaderboard(groupId: string) {
      await Promise.all([
        this.fetchByTasks(groupId),
        this.fetchByTime(groupId),
      ]);
    },

    reset() {
      this.byTasks = [];
      this.byTime = [];
      this.error = null;
    },
  },
});
