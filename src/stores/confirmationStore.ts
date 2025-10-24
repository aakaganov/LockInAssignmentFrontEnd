import { defineStore } from "pinia";
import * as api from '../apiClient';

export const useConfirmationStore = defineStore('confirmationStore', {
  state: () => ({
    confirmations: [] as any[],
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
        this.confirmations = res;
      } catch (err: any) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },
    async requestConfirmation(taskId: string, requestedBy: string) {
      await api.requestConfirmation(taskId, requestedBy);
      await this.fetchConfirmations(requestedBy);
    },
    async confirmTask(taskId: string, peerId: string) {
      await api.confirmTask(taskId, peerId);
    },
  },
});
