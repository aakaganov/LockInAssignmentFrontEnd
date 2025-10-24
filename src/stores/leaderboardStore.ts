// src/stores/leaderboardStore.ts
import { defineStore } from 'pinia'
import * as api from '../apiClient'

export const useLeaderboardStore = defineStore('leaderboardStore', {
  state: () => ({
    byTasks: [] as { userId: string; completedCount: number }[],
    byTime: [] as { userId: string; completedHours: number }[],
    loading: false,
    error: null as string | null,
  }),
  actions: {
    async fetchByTasks(groupId: string) {
      this.loading = true
      this.error = null
      try {
        const res = await api.getLeaderboardByTasks(groupId)
        if (res.error) throw new Error(res.error)
        this.byTasks = res
      } catch (err: any) {
        this.error = err.message
      } finally {
        this.loading = false
      }
    },
    async fetchByTime(groupId: string) {
      this.loading = true
      this.error = null
      try {
        const res = await api.getLeaderboardByTime(groupId)
        if (res.error) throw new Error(res.error)
        this.byTime = res
      } catch (err: any) {
        this.error = err.message
      } finally {
        this.loading = false
      }
    },
    reset() {
      this.byTasks = []
      this.byTime = []
      this.loading = false
      this.error = null
    },
  },
})
