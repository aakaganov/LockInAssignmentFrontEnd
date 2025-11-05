import { defineStore } from 'pinia'
import { getLeaderboardByTasks, getLeaderboardByTime } from '../apiClient'

interface TaskLeaderboardEntry {
  userId: string
  completedCount: number
}

interface TimeLeaderboardEntry {
  userId: string
  completedHours: number
}

export const useLeaderboardStore = defineStore('leaderboardStore', {
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
    async fetchByTasks(groupId: string) {
      this.loading = true
      try {
        const result = await getLeaderboardByTasks(groupId)
        this.byTasks = result.leaderboard || []
      } catch (err: any) {
        this.error = err.message
      } finally {
        this.loading = false
      }
    },

    async fetchByTime(groupId: string) {
      this.loading = true
      try {
        const result = await getLeaderboardByTime(groupId)
        this.byTime = result.leaderboard || []
      } catch (err: any) {
        this.error = err.message
      } finally {
        this.loading = false
      }
    },

    async fetchLeaderboard(groupId: string) {
      await Promise.all([
        this.fetchByTasks(groupId),
        this.fetchByTime(groupId),
      ])
    },

    reset() {
      this.byTasks = []
      this.byTime = []
      this.error = null
    },
  },
})
