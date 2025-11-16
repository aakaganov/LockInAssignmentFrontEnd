import { defineStore } from "pinia";
import * as api from "../apiClient";

export interface Confirmation {
  taskId: string;
  requestedBy: string;
  taskName: string;
  groupId?: string;
  selectedPeers?: string[];
  actualTime?: number;
  status: "pending" | "accepted" | "verified" | "declined"; // normalized
  confirmedBy: string[]; // always an array
  deniedBy: string[]; // always an array
}

export const useConfirmationStore = defineStore("confirmationStore", {
  state: () => ({
    confirmations: [] as Confirmation[],
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
    async fetchConfirmations(userId: string) {
      this.loading = true;
      this.error = null;
      try {
        const res = await api.getConfirmations(userId);
        if (res.error) throw new Error(res.error);

        this.confirmations = (res || []).map((c: any) => {
          // Normalize status
          let normalizedStatus:
            | "pending"
            | "accepted"
            | "verified"
            | "declined" = "pending";
          if (c.status === "confirmed") normalizedStatus = "accepted";
          else if (c.status === "denied") normalizedStatus = "declined";

          return {
            ...c,
            status: normalizedStatus,
            confirmedBy: Array.isArray(c.confirmedBy) ? c.confirmedBy : [],
            deniedBy: Array.isArray(c.deniedBy) ? c.deniedBy : [],
          };
        });
      } catch (err: any) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },

    async fetchPendingConfirmationsForPeer(peerId: string) {
      if (!peerId) return;
      const res = await api.fetchPendingConfirmationsForPeer(peerId);
      this.confirmations = (res || []).map((c: any) => ({
        ...c,
        status:
          c.status === "confirmed"
            ? "accepted"
            : c.status === "denied"
              ? "declined"
              : "pending",
        confirmedBy: Array.isArray(c.confirmedBy) ? c.confirmedBy : [],
        deniedBy: Array.isArray(c.deniedBy) ? c.deniedBy : [],
      }));
    },

    async requestConfirmation(
      taskId: string,
      requestedBy: string,
      taskName: string,
      selectedPeers: string[],
      completionTime?: number,
      groupId?: string,
      actualTime?: number,
    ) {
      const peers = Array.isArray(selectedPeers) ? selectedPeers : [];
      await api.requestConfirmation(
        taskId,
        requestedBy,
        taskName,
        completionTime,
        groupId,
        peers,
      );
    },

    async confirmTask(taskId: string, peerId: string) {
      try {
        const res = await api.confirmTask(taskId, peerId);
        if (res.error) throw new Error(res.error);
      } catch (err: any) {
        this.error = err.message;
      }
    },

    async denyTask(taskId: string, peerId: string) {
      try {
        const res = await api.denyTask(taskId, peerId);
        if (res.error) throw new Error(res.error);
      } catch (err: any) {
        this.error = err.message;
      }
    },

    addNotification(
      userId: string,
      message: string,
      type: string = "group",
      context?: { taskName?: string; senderName?: string },
    ) {
      if (context) {
        if (context.taskName)
          message = message.replace("{taskName}", context.taskName);
        if (context.senderName)
          message = message.replace("{senderName}", context.senderName);
      }
      this.notifications.push({ userId, message, type, createdAt: new Date() });
    },

    getNotifications(userId: string) {
      return this.notifications.filter((n) => n.userId === userId);
    },

    clearNotifications(userId: string) {
      this.notifications = this.notifications.filter(
        (n) => n.userId !== userId,
      );
    },
  },
});
