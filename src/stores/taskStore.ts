import { defineStore } from "pinia";
import * as api from "../apiClient";

export const useTaskStore = defineStore("taskStore", {
  state: () => ({
    tasks: [] as any[],
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchTasks(ownerId: string) {
      this.loading = true;
      this.error = null;
      try {
        const res = await api.listTasks(ownerId);
        if (res.error) throw new Error(res.error);
        this.tasks = res;
      } catch (err: any) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },

    async createTask(ownerId: string, title: string, description: string | null, dueDate: string | null, estimatedTime: number) {
      try {
        const res = await api.createTask(ownerId, title, description, dueDate, estimatedTime);
        if (res.error) throw new Error(res.error);
        await this.fetchTasks(ownerId);
      } catch (err: any) {
        this.error = err.message;
      }
    },

    async completeTask(taskId: string, actualTime: number, ownerId: string) {
      try {
        const res = await api.completeTask(taskId, actualTime);
        if (res.error) throw new Error(res.error);
        await this.fetchTasks(ownerId);
      } catch (err: any) {
        this.error = err.message;
      }
    },

    async deleteTask(taskId: string, ownerId: string) {
      try {
        const res = await api.deleteTask(taskId);
        if (res.error) throw new Error(res.error);
        await this.fetchTasks(ownerId);
      } catch (err: any) {
        this.error = err.message;
      }
    }
  }
});
