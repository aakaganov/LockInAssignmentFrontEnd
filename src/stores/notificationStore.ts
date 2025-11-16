import { defineStore } from "pinia";
import { ref } from "vue";
import { getNotifications, acceptInvite, declineInvite } from "../apiClient";
import { useGroupStore } from "./groupStore";
console.log(acceptInvite)
export const useNotificationStore = defineStore("notificationStore", () => {
  const notifications = ref<
    Array<{
      id: string;
      type: "group_invite" | "task_confirmation";
      groupId?: string;
      taskId?: string;
      fromUserId: string;
      fromUserName?: string;
      status: "pending" | "accepted" | "declined" | "verified";
      groupName?: string;
      taskName?: string;
    }>
  >([]);

  /** Normalize backend notifications to match FE expectations */
  function normalizeNotification(n: any) {
    return {
      id: n.notificationId,
      type: n.type,

      // Task confirmation notifications
      taskId:
        n.type === "task_confirmation"
          ? (n.relatedTaskId ?? n.taskId ?? undefined)
          : undefined,

      // Group invite notifications
      groupId: n.type === "group_invite" ? (n.groupId ?? undefined) : undefined,

      fromUserId: n.fromUserId,
      fromUserName: n.fromUserName ?? n.fromUser ?? "Unknown User",

      status: n.status,

      groupName: n.groupName ?? undefined,
      taskName: n.taskName ?? undefined,

      // Preserve extra fields safely
      extra: n.extra ?? undefined,
    };
  }

  async function fetchNotifications(userId: string) {
    if (!userId) return;
    const result = await getNotifications({ userId });

    notifications.value = (result.notifications || [])
      .filter((n: any) => n.status === "pending" && n.userId === userId)
      .map((n: any) => normalizeNotification(n));
  }

  async function acceptInviteAction(payload: {
    groupId: string;
    userId: string;
  }) {
    const groupStore = useGroupStore();
    const res = await acceptInvite(payload);

    if (res.success) {
      const index = notifications.value.findIndex(
        (n) => n.groupId === payload.groupId,
      );
      if (index !== -1) notifications.value.splice(index, 1);
      await groupStore.fetchGroups(payload.userId);
    }
    return res;
  }

  async function declineInviteAction(payload: {
    groupId: string;
    userId: string;
  }) {
    const res = await declineInvite(payload);

    if (res.success) {
      const index = notifications.value.findIndex(
        (n) => n.groupId === payload.groupId,
      );
      if (index !== -1) notifications.value.splice(index, 1);
    }
    return res;
  }

  return {
    notifications,
    fetchNotifications,
    acceptInvite: acceptInviteAction,
    declineInvite: declineInviteAction,
  };
});
