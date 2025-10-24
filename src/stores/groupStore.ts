import { defineStore } from "pinia";
import * as api from "../apiClient";

export const useGroupStore = defineStore("groupStore", {
  state: () => ({
    groups: [] as any[],
    loading: false,
    error: null as string | null,
  }),
  actions: {
    async fetchGroups(userId: string) {
      this.loading = true;
      this.error = null;
      try {
        const res = await api.listGroups(userId);
        if (res.error) throw new Error(res.error);
        this.groups = res;
      } catch (err: any) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },

    async createGroup(groupId: string, name: string, requiresConfirmation: boolean) {
      try {
        const res = await api.createGroup(groupId, name, requiresConfirmation);
        if (res.error) throw new Error(res.error);
        await this.fetchGroups(""); // optionally pass owner/userId
      } catch (err: any) {
        this.error = err.message;
      }
    },

    async addMember(groupId: string, userId: string) {
      try {
        const res = await api.addMember(groupId, userId);
        if (res.error) throw new Error(res.error);
        await this.fetchGroups(""); // refresh groups
      } catch (err: any) {
        this.error = err.message;
      }
    },

    async removeMember(groupId: string, userId: string) {
      try {
        const res = await api.removeMember(groupId, userId);
        if (res.error) throw new Error(res.error);
        await this.fetchGroups(""); // refresh groups
      } catch (err: any) {
        this.error = err.message;
      }
    },

    async setConfirmationPolicy(groupId: string, requiresConfirmation: boolean) {
      try {
        const res = await api.setConfirmationPolicy(groupId, requiresConfirmation);
        if (res.error) throw new Error(res.error);
      } catch (err: any) {
        this.error = err.message;
      }
    },
  },
});
