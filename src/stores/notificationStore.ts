// src/stores/notificationStore.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getNotifications, acceptInvite } from '../apiClient' // ✅ unified naming
import { useGroupStore } from './groupStore'

export const useNotificationStore = defineStore('notificationStore', () => {
  const notifications = ref<Array<{
    id: string
    type: 'group_invite'
    groupId: string
    fromUser: string
    status: 'pending' | 'accepted' | 'declined'
    groupName?: string
  }>>([])

  // ✅ Fetch all notifications for the logged-in user
  async function fetchNotifications(userId: string) {
    if (!userId) return
    const result = await getNotifications({ userId })
    notifications.value = result.notifications || []
  }

  // ✅ Accept group invite (adds user to group + refreshes groups)
    async function acceptInvite(payload: { groupId: string; userId: string }): Promise<{ success: boolean }> {
    const groupStore = useGroupStore()
    
    // Explicitly type `res` to avoid TS7022
    const res: { success: boolean } = await acceptInvite(payload)

    if (res.success) {
        const notif = notifications.value.find(n => n.groupId === payload.groupId)
        if (notif) notif.status = 'accepted'
        await groupStore.fetchGroups(payload.userId)
    }

  return res
}


  return { notifications, fetchNotifications, acceptInvite }
})
