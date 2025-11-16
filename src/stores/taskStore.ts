import { defineStore } from "pinia";
import * as api from "../apiClient";

export const useTaskStore = defineStore("taskStore", {
  state: () => ({
    tasks: [] as any[],
    loading: false,
    error: null as string | null,
  }),

  actions: {
    /** Normalize null → undefined for compatibility with TaskForm.vue */
    normalizeTask(t: any) {
      return {
        ...t,
        description: t.description ?? undefined,   // <-- FIX
        dueDate: t.dueDate ?? null,                // null allowed
        estimatedTime: t.estimatedTime ?? 0,
        groupRequiresConfirmation: t.group?.confirmationRequired ?? false,
        confirmationRequested: t.confirmationRequested ?? false,
        confirmed: t.confirmed ?? false,
      };
    },

    async fetchTasks(ownerId: string) {
      this.loading = true;
      this.error = null;

      try {
        const res = await api.listTasks(ownerId);
        if (res.error) throw new Error(res.error);

        // Normalize tasks so the component type matches
        this.tasks = (res || []).map((t: any) => this.normalizeTask(t));

      } catch (err: any) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },

    async createTask(ownerId: string, title: string, description: string | null, dueDate: string | null, estimatedTime: number) {
      this.loading = true;
      this.error = null;

      try {
        const res = await api.createTask(ownerId, title, description, dueDate, estimatedTime);
        if (res.error) throw new Error(res.error);

        const newTask = this.normalizeTask({
          taskId: res.taskId ?? Math.random().toString(36),
          ownerId,
          title,
          description,
          dueDate,
          estimatedTime,
          status: "pending",
        });

        this.tasks.push(newTask);

      } catch (err: any) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },

    async updateTask(taskId: string, data: { title?: string; description?: string | null; dueDate?: string | null; estimatedTime?: number; }) {
      this.loading = true;
      this.error = null;

      try {
        const res = await api.editTask(
          taskId,
          data.title,
          data.description ?? undefined,
          data.dueDate ?? undefined,
          data.estimatedTime
        );
        if (res.error) throw new Error(res.error);

        const index = this.tasks.findIndex(t => t.taskId === taskId);
        if (index !== -1) {
          this.tasks[index] = this.normalizeTask({
            ...this.tasks[index],
            ...data
          });
        }

      } catch (err: any) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },

    async completeTask(taskId: string, actualTime: number, ownerId: string) {
      this.loading = true;

      try {
        await api.completeTask(taskId, actualTime);
        await this.fetchTasks(ownerId);
      } catch (err) {
        this.error = "Failed to complete task.";
      } finally {
        this.loading = false;
      }
    },

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
        this.loading = false;
      }
    },
    /**
    async suggestTaskOrder() {
      if (!this.tasks.length) return;

      try {
        const res = await suggestTaskOrderAPI(this.tasks);
        if (res.orderedTaskIds && Array.isArray(res.orderedTaskIds)) {
          this.tasks.sort(
            (a, b) =>
              res.orderedTaskIds.indexOf(a.taskId) -
              res.orderedTaskIds.indexOf(b.taskId)
          );
        }

      } catch (err) {
        console.error("Failed to suggest task order:", err);
      }
    },
     */


    async suggestTaskOrder() {
      if (!this.tasks || this.tasks.length === 0) return;

      try {
        // convert dueDate to string or null
        const payload = this.tasks.map(t => ({
          taskId: t.taskId,
          title: t.title,
          description: t.description,
          dueDate: t.dueDate ? t.dueDate.toString() : null,
          estimatedTime: t.estimatedTime,
        }));

        console.log("Sending tasks to suggestOrder:", payload);

        const data = await api.suggestTaskOrder(payload);

        console.log("Response from suggestOrder API:", data);

        if (!data.orderedTaskIds) throw new Error("No order returned");

        // Log the suggested order
        console.log(
          "Suggested task order:",
          data.orderedTaskIds.map((id: string) => this.tasks.find(t => t.taskId === id)?.title),
        );

        // Reorder tasks
        const taskMap = new Map(this.tasks.map(t => [t.taskId, t]));
        this.tasks = data.orderedTaskIds
          .map((id: string) => taskMap.get(id)).filter(Boolean);

      } catch (err: any) {
        console.error("Failed to suggest order:", err);
        this.error = `Could not suggest task order: ${err.message || err}`;
      }
    },

  }
});
