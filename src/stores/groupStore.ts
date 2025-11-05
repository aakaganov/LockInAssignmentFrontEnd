import { defineStore } from "pinia";
import * as api from "../apiClient";
import { useConfirmationStore } from "./confirmationStore";
import { listGroups } from "../apiClient";
export const useGroupStore = defineStore("groupStore", {
  state: () => ({
    groups: [] as any[],
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchGroups(userId: string) {
      try {
        const res = await listGroups(userId); // Make sure this returns objects like { groupId, groupName, ownerId }
        console.log("Fetched groups:", res);
        this.groups = res.map((g: any) => ({
          groupId: g.groupId,
          groupName: g.groupName,  // <-- make sure this exists
          ownerId: g.ownerId,
        }));
      } catch (err) {
        console.error("Failed to fetch groups:", err);
        this.error = "Unable to load groups";
      }
    },
    /**
    async fetchGroups(userId: string) {
      this.loading = true;
      this.error = null;
      try {
        const res = await api.listGroups(userId);
        if (res.error) throw new Error(res.error);

        // Replace groups entirely
        this.groups = Array.isArray(res) ? res : [];
      } catch (err: any) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },
 */

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
          invitedEmails, // pass the correct key
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

        // Send notifications to invited users
        if (res.invitedUsers?.length) {
          for (const memberId of res.invitedUsers) {
            confirmationStore.addNotification(
              memberId,
              `You were invited to join group "${groupName}"`,
              "group_invite"
            );
          }
        }

        return { groupId: res.groupId, invitedUsers: res.invitedUsers || [] };
      } catch (err: any) {
        this.error = err.message;
        console.error("createGroup error:", err);
        throw err;
      } finally {
        this.loading = false;
      }
    },


    /**
      try {
        const res = await api.createGroup({
          ownerId,
          groupName,
          confirmationRequired,
          members,
        });

        if (res.error) throw new Error(res.error);
        const { groupId, invitedMembers } = res;

        // Immediately add to local groups so UI updates instantly
        this.groups.push({
          groupId,
          groupName,
          members: [ownerId],
          requiresConfirmation: confirmationRequired,
        });

        // Send join requests to invited members
        for (const memberId of invitedMembers) {
          confirmationStore.addNotification(
            memberId,
            `You were invited to join group "${groupName}"`,
            "group_invite"
          );
        }

      } catch (err: any) {
        this.error = err.message;
        console.error("createGroup error:", err);
      } finally {
        this.loading = false;
      } */

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
            "group_invite"
          );
        }
      } catch (err: any) {
        this.error = err.message;
        console.error("inviteMember error:", err);
      } finally {
        this.loading = false;
      }
    },

    async acceptInvite(groupId: string, userId: string) {
      await api.acceptInvite({ groupId, userId });
      await this.fetchGroups(userId);
    },

    async declineInvite(groupId: string, userId: string) {
      await api.declineInvite({ groupId, userId });
    },
    async setConfirmationPolicy(groupId: string, requiresConfirmation: boolean) {
      this.loading = true;
      this.error = null;
      try {
        await api.setConfirmationPolicy(groupId, requiresConfirmation);
        // Update local copy if present
        const group = this.groups.find(g => g.groupId === groupId);
        if (group) group.requiresConfirmation = requiresConfirmation;
      } catch (err: any) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },
    async deleteGroup(groupId: string, userId: string) {
      console.log("Store.deleteGroup called", groupId, userId);
      this.loading = true;
      this.error = null;

      try {
        const res = await api.deleteGroup({ groupId, userId });
        console.log("API response:", res);
        if (res.error) throw new Error(res.error);

        // Remove the deleted group from the local state
        this.groups = this.groups.filter(g => g.groupId !== groupId);
      } catch (err: any) {
        this.error = err.message;
        console.error("deleteGroup error:", err);
        throw err;
      } finally {
        this.loading = false;
      }
    },
    /** 
    async deleteGroup(groupId: string, userId: string) {
      this.loading = true;
      this.error = null;
      try {
        const res = await api.deleteGroup({ groupId, userId });
        if (res.success) {
          // Remove group from local store
          this.groups = this.groups.filter(g => g.groupId !== groupId);
        }
      } catch (err: any) {
        this.error = err.message;
        console.error("deleteGroup error:", err);
      } finally {
        this.loading = false;
      }
    },
    */

  },
});
