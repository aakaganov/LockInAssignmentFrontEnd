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

    async createTask(
      ownerId: string,
      title: string,
      description: string | null,
      dueDate: string | null,
      estimatedTime: number
    ) {
      this.loading = true
      this.error = null
      try {
        const res = await api.createTask(ownerId, title, description, dueDate, estimatedTime)
        if (res.error) throw new Error(res.error)

        // Always push the new task locally if API returns it
        const newTask = {
          taskId: res.taskId ?? Math.random().toString(36), // fallback temp id
          ownerId,
          title,
          description,
          dueDate,
          estimatedTime,
          status: 'pending',
        }
        this.tasks.push(newTask)
      } catch (err: any) {
        this.error = err.message
      } finally {
        this.loading = false
      }
    },
    async updateTask(
      taskId: string,
      data: {
        title?: string
        description?: string | null
        dueDate?: string | null
        estimatedTime?: number
      }
    ) {
      this.loading = true
      this.error = null
      try {
        const res = await api.editTask(
          taskId,
          data.title,
          data.description ?? undefined,
          data.dueDate ?? undefined,
          data.estimatedTime
        )
        if (res.error) throw new Error(res.error)

        // ✅ update local cache (instead of waiting for fetch)
        const index = this.tasks.findIndex(t => t.taskId === taskId)
        if (index !== -1) {
          this.tasks[index] = {
            ...this.tasks[index],
            ...data,
          }
        }

      } catch (err: any) {
        this.error = err.message
      } finally {
        this.loading = false
      }
    },

    /**
    async updateTask(
      taskId: string,
      data: {
        title?: string
        description?: string | null
        dueDate?: string | null
        estimatedTime?: number
      }
    ) {
      this.loading = true;
      this.error = null;
      try {
        const res = await api.editTask(
          taskId,
          data.title,
          data.description ?? undefined,
          data.dueDate ?? undefined,
          data.estimatedTime
        )
        if (res.error) throw new Error(res.error)
        if (res.ownerId) {
          await this.fetchTasks(res.ownerId)
        }
      } catch (err: any) {
        this.error = err.message
      } finally {
        this.loading = false
      }
    },
    */

    async completeTask(taskId: string, actualTime: number, ownerId: string) {
      this.loading = true
      try {
        await api.completeTask(taskId, actualTime)
        await this.fetchTasks(ownerId) // reload just this user's tasks
      } catch (err) {
        console.error('Failed to complete task:', err)
        this.error = 'Failed to complete task.'
      } finally {
        this.loading = false
      }
    },
    /** 
    async completeTask(taskId: string, actualTime: number, ownerId: string) {
      this.loading = true;
      this.error = null;
      try {
        const res = await api.completeTask(taskId, actualTime);
        if (res.error) throw new Error(res.error);
        await this.fetchTasks(ownerId);
      } catch (err: any) {
        this.error = err.message;
      } finally {
        this.loading = false
      }
    }*/
    async deleteTask(taskId: string, ownerId: string) {
      this.loading = true;
      this.error = null;
      try {
        const res = await api.deleteTask(taskId);
        if (res.error) throw new Error(res.error);
        await this.fetchTasks(ownerId);
      } catch (err: any) {
        this.error = err.message;
      } finally {
        this.loading = false
      }
    }
  }
});
