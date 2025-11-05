<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useConfirmationStore } from '../../stores/confirmationStore'
import { useNotificationStore } from '../../stores/notificationStore'
import { acceptInvite } from '../../apiClient'
import { useGroupStore } from '../../stores/groupStore'
import ConfirmAction from './ConfirmAction.vue'

const props = defineProps<{
  userId: string | null
}>()

// Unified notifications array
interface Notification {
  id: string
  type: 'task' | 'group_invite'
  relatedId: string // taskId or groupId
  fromUser: string
  status: 'pending' | 'accepted' | 'verified' | "declined"
  extra?: any // optional payload (e.g., groupName)
}

const notifications = ref<Notification[]>([])

const confirmationStore = useConfirmationStore()
const notificationStore = useNotificationStore()
const groupStore = useGroupStore()


// Load notifications from both stores
async function loadNotifications() {
  if (!props.userId) return

  // Task confirmations
  await confirmationStore.fetchConfirmations(props.userId)
  const taskNotifications: Notification[] = confirmationStore.confirmations.map(c => ({
    id: c.taskId,
    type: 'task',
    relatedId: c.taskId,
    fromUser: c.requestedBy,
    status: c.status,
  }))

  // Group invites
  await notificationStore.fetchNotifications(props.userId)
  const groupNotifications: Notification[] = notificationStore.notifications
    .filter(n => n.type === 'group_invite')
    .map(n => ({
      id: n.id,
      type: 'group_invite',
      relatedId: n.groupId,
      fromUser: n.fromUser,
      status: n.status,
      extra: { groupName: n.groupName }
    }))

  notifications.value = [...taskNotifications, ...groupNotifications]
}

onMounted(loadNotifications)
watch(() => props.userId, loadNotifications)

// Handlers
function handleConfirmed(taskId: string, peerId?: string) {
  if (!peerId) return
  const notification = notifications.value.find(n => n.id === taskId && n.type === 'task')
  if (notification) {
    notification.status = 'verified'
    confirmationStore.confirmTask(taskId, peerId)
  }
}

async function handleAcceptInvite(notification: Notification) {
  if (!props.userId) return
  try {
    await notificationStore.acceptInvite({
      groupId: notification.relatedId,
      userId: props.userId
    })
    notification.status = 'accepted'
    // Optionally refresh groups in groupStore here
  } catch (err: any) {
    console.error('Failed to accept invite:', err.message)
  }
}

</script>

<template>
  <div class="notification-list">
    <h3>Notifications</h3>
    <div v-if="notifications.length === 0">
      <p>No notifications.</p>
    </div>
    <ul>
      <li v-for="n in notifications" :key="n.id">
        <template v-if="n.type === 'task'">
          <strong>Task:</strong> {{ n.relatedId }} — requested by {{ n.fromUser }} — status: {{ n.status }}
          <ConfirmAction
            v-if="n.status === 'pending'"
            :taskId="n.relatedId"
            :peerId="props.userId"
            @confirmed="handleConfirmed"
          />
        </template>

        <template v-else-if="n.type === 'group_invite'">
          <strong>Group Invite:</strong> {{ n.extra.groupName }} — invited by {{ n.fromUser }} — status: {{ n.status }}
          <button
            v-if="n.status === 'pending'"
            @click="handleAcceptInvite(n)"
          >
            Accept
          </button>
        </template>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.notification-list {
  padding: 8px;
  border: 1px dashed #eee;
  border-radius: 6px;
}

button {
  background: #2b8aef;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  margin-left: 8px;
}

button:hover {
  background: #1a6fc2;
}
</style>
