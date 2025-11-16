// stores/groupStore.ts
import { defineStore } from "pinia";
import * as api from "../apiClient";
import { useConfirmationStore } from "./confirmationStore";

export const useGroupStore = defineStore("groupStore", {
  state: () => ({
    groups: [] as any[],
    loading: false,
    error: null as string | null,
  }),

  actions: {
    clearSelectedGroups() {
      this.groups = [];
    },
    /** Sync all groups for a user from API */
    async syncGroups(userId: string) {
      this.loading = true;
      this.error = null;

      try {
        const res = await api.listGroups(userId);
        console.log(
          "groupStore.syncGroups -> fetched groups:",
          JSON.stringify(res, null, 2),
        );

        // Normalize data for frontend
        this.groups = (res || []).map((g: any) => ({
          groupId: g.groupId,
          groupName: g.groupName,
          ownerId: g.ownerId,
          owner: g.owner
            ? {
                userId: g.owner.userId,
                name: g.owner.name,
                email: g.owner.email,
              }
            : null,
          members: Array.isArray(g.members)
            ? g.members.map((m: any) => ({
                userId: m.userId,
                name: m.name,
                email: m.email,
              }))
            : [],
          confirmationRequired:
            g.confirmationRequired ?? g.requiresConfirmation ?? false,
          createdAt: g.createdAt,
        }));

        return this.groups;
      } catch (err: any) {
        this.error = err.message || "Unable to fetch groups";
        console.error("groupStore.syncGroups error:", err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    /** Original fetchGroups method now delegates to syncGroups */
    async fetchGroups(userId: string) {
      return await this.syncGroups(userId);
    },

    async createGroup({
      ownerId,
      groupName,
      confirmationRequired,
      invitedEmails = [],
    }: {
      ownerId: string;
      groupName: string;
      confirmationRequired: boolean;
      invitedEmails?: string[];
    }) {
      this.loading = true;
      this.error = null;
      const confirmationStore = useConfirmationStore();

      try {
        const res = await api.createGroup({
          ownerId,
          groupName,
          confirmationRequired,
          invitedEmails,
        });

        if (res.error) throw new Error(res.error);

        const newGroup = {
          groupId: res.groupId,
          ownerId,
          groupName,
          members: [ownerId],
          confirmationRequired,
        };
        this.groups.push(newGroup);

        if (res.invitedUsers?.length) {
          for (const memberId of res.invitedUsers) {
            confirmationStore.addNotification(
              memberId,
              `You were invited to join group "${groupName}"`,
              "group_invite",
            );
          }
        }

        return { groupId: res.groupId, invitedUsers: res.invitedUsers || [] };
      } catch (err: any) {
        this.error = err.message;
        console.error("groupStore.createGroup error:", err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async inviteMember(groupId: string, email: string, invitedBy: string) {
      this.loading = true;
      this.error = null;
      const confirmationStore = useConfirmationStore();

      try {
        const res = await api.inviteUserByEmail({ groupId, email, invitedBy });
        if (res.invitedUserId) {
          confirmationStore.addNotification(
            res.invitedUserId,
            `You were invited to join group "${groupId}"`,
            "group_invite",
          );
        }
      } catch (err: any) {
        this.error = err.message;
        console.error("groupStore.inviteMember error:", err);
      } finally {
        this.loading = false;
      }
    },

    async acceptInvite(groupId: string, userId: string) {
      await api.acceptInvite({ groupId, userId });
      await this.syncGroups(userId);
    },

    async declineInvite(groupId: string, userId: string) {
      await api.declineInvite({ groupId, userId });
    },

    async setConfirmationPolicy(
      groupId: string,
      requiresConfirmation: boolean,
    ) {
      this.loading = true;
      this.error = null;
      try {
        await api.setConfirmationPolicy(groupId, requiresConfirmation);
        const group = this.groups.find((g) => g.groupId === groupId);
        if (group) group.confirmationRequired = requiresConfirmation;
      } catch (err: any) {
        this.error = err.message;
        console.error("groupStore.setConfirmationPolicy error:", err);
      } finally {
        this.loading = false;
      }
    },

    async deleteGroup(groupId: string, userId: string) {
      this.loading = true;
      this.error = null;

      try {
        const res = await api.deleteGroup({ groupId, userId });
        if (res.error) throw new Error(res.error);
        this.groups = this.groups.filter((g) => g.groupId !== groupId);

        this.groups = this.groups.filter((g) => g.groupId !== groupId);
      } catch (err: any) {
        this.error = err.message;
        console.error("groupStore.deleteGroup error:", err);
        throw err;
      } finally {
        this.loading = false;
      }
    },
    async leaveGroup(groupId: string, userId: string) {
      try {
        await api.leaveGroup(groupId, userId); // Remove group from local store for leaving user
        this.groups = this.groups.filter((g) => g.groupId !== groupId);
      } catch (err) {
        console.error("Failed to leave group:", err);
        throw err;
      }
    },
  },
});
