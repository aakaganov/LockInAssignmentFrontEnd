import { defineStore } from "pinia";
import * as api from "../apiClient";

export const useConfirmationStore = defineStore("confirmationStore", {
  state: () => ({
    confirmations: [] as any[], // task or group confirmations
    notifications: [] as {
      userId: string;
      message: string;
      type?: string;
      createdAt: Date;
    }[],
    loading: false,
    error: null as string | null,
  }),

  actions: {
    // === CONFIRMATION LOGIC ===

    async fetchConfirmations(userId: string) {
      this.loading = true;
      this.error = null;
      try {
        const res = await api.getConfirmations(userId);
        if (res.error) throw new Error(res.error);
        this.confirmations = res;
      } catch (err: any) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },

    async requestConfirmation(taskId: string, requestedBy: string) {
      try {
        const res = await api.requestConfirmation(taskId, requestedBy);
        if (res.error) throw new Error(res.error);
      } catch (err: any) {
        this.error = err.message;
      }
    },

    async confirmTask(taskId: string, peerId: string) {
      try {
        const res = await api.confirmTask(taskId, peerId);
        if (res.error) throw new Error(res.error);
      } catch (err: any) {
        this.error = err.message;
      }
    },

    // === NOTIFICATION LOGIC ===

    addNotification(userId: string, message: string, type: string = "group") {
      this.notifications.push({
        userId,
        message,
        type,
        createdAt: new Date(),
      });
    },

    getNotifications(userId: string) {
      return this.notifications.filter((n) => n.userId === userId);
    },

    clearNotifications(userId: string) {
      this.notifications = this.notifications.filter(
        (n) => n.userId !== userId
      );
    },
  },
});
