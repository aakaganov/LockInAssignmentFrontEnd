<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useConfirmationStore } from '../../stores/confirmationStore'
import { useNotificationStore } from '../../stores/notificationStore'
//import { useGroupStore } from '../../stores/groupStore'
import { useTaskStore } from '../../stores/taskStore'
import { useUserStore } from '../../stores/userStore'
import ConfirmAction from './ConfirmAction.vue'

const props = defineProps<{ userId: string | null }>()

interface Notification {
  id: string
  type: 'task' | 'group_invite'
  relatedId: string
  fromUser: string
  status: 'pending' | 'accepted' | 'verified' | 'declined'
  extra?: any
  taskName?: string
}

const notifications = ref<Notification[]>([])

const confirmationStore = useConfirmationStore()
const notificationStore = useNotificationStore()
//const groupStore = useGroupStore()
const taskStore = useTaskStore()
const userStore = useUserStore()

async function loadNotifications() {
  if (!props.userId) return
  console.log("Current userId:", props.userId); // <<< ADD THIS
  // --- Fetch pending confirmations ---
  await confirmationStore.fetchPendingConfirmationsForPeer(props.userId)
  
  notifications.value = []

  await taskStore.fetchTasks(props.userId)
  const tasks = taskStore.tasks
  confirmationStore.confirmations.forEach(c => {
    console.log("Checking confirmation", c.taskId, "for user", props.userId,
      "status:", c.status,
      "confirmedBy:", c.confirmedBy,
      "deniedBy:", c.deniedBy
    );
  });
  const taskNotifications: Notification[] = await Promise.all(confirmationStore.confirmations
    .filter(c =>
      props.userId &&
      c.status === 'pending' &&
      !c.confirmedBy?.includes(props.userId) &&
      !c.deniedBy?.includes(props.userId)
    )
    .map(async c => {
      let senderName = c.requestedBy
      try {
        await userStore.fetchUser(c.requestedBy)
        const user = userStore.users.find(u => u.userId === c.requestedBy)
        if (user && user.name) senderName = user.name
      } catch {}

      return {
        id: c.taskId,
        type: 'task',
        relatedId: c.taskId,
        taskName: c.taskName,       // ✅ use the taskName from confirmation
        fromUser: senderName,
        status: c.status,
        extra: {actualTime: c.actualTime ?? tasks.find(t => t.taskId === c.taskId)?.actualTime } // ✅ include actualTime if needed
      }
    })
)
  /*
  confirmationStore.confirmations
      .filter(c => 
      c.status === 'pending' &&
      !c.confirmedBy?.includes(props.userId) &&
      !c.deniedBy?.includes(props.userId)
    )
      .map(async c => {
        const task = tasks.find(t => t.taskId === c.taskId)
        const taskName = task ? task.title : `Task ${c.taskId}`
        const filteredConfirmations = confirmationStore.confirmations.filter(cf => 
          cf.taskId === c.taskId &&
          cf.status === 'pending' &&
          !cf.confirmedBy?.includes(props.userId) &&
          !cf.deniedBy?.includes(props.userId)
        );
        console.log("Filtered task confirmations for user:", props.userId, filteredConfirmations);

        let senderName = c.requestedBy
        try {
          await userStore.fetchUser(c.requestedBy)
          const user = userStore.users.find(u => u.userId === c.requestedBy)
          if (user && user.name) senderName = user.name
        } catch {}

        return {
          id: c.taskId,
          type: 'task',
          relatedId: c.taskId,
          taskName,
          fromUser: senderName,
          status: c.status,
        }
      })
      */
  
  // --- Fetch group invites ---
  await notificationStore.fetchNotifications(props.userId)
  const groupNotifications: Notification[] = notificationStore.notifications
    .filter(n => n.type === 'group_invite' && n.status === 'pending')
    .map(n => ({
      id: n.id,
      type: 'group_invite',
      relatedId: n.groupId!,
      fromUser: n.fromUserName || 'Unknown',
      status: n.status,
      extra: { groupName: n.groupName },
    }))

  notifications.value = [...taskNotifications, ...groupNotifications]
}

onMounted(loadNotifications)
watch(() => props.userId, loadNotifications)

// --- Group invite handlers ---
async function handleAcceptInvite(notification: Notification) {
  if (!props.userId) return
  try {
    await notificationStore.acceptInvite({
      groupId: notification.relatedId,
      userId: props.userId,
    })
    notifications.value = notifications.value.filter(n => n.id !== notification.id)
  } catch (err: any) {
    console.error('Failed to accept invite:', err.message)
  }
}

async function handleDeclineInvite(notification: Notification) {
  if (!props.userId) return
  try {
    await notificationStore.declineInvite({
      groupId: notification.relatedId,
      userId: props.userId,
    })
    notifications.value = notifications.value.filter(n => n.id !== notification.id)
  } catch (err: any) {
    console.error('Failed to decline invite:', err.message)
  }
}

// --- Task confirmation handlers ---
async function handleConfirmed(taskId: string, peerId?: string) {
  if (!peerId) return
  try {
    await confirmationStore.confirmTask(taskId, peerId) // persist to backend
    notifications.value = notifications.value.filter(n => n.id !== taskId)
  } catch (err: any) {
    console.error('Failed to confirm task:', err.message)
  }
}

async function handleDenied(taskId: string, peerId?: string) {
  if (!peerId) return
  try {
    await confirmationStore.denyTask(taskId, peerId) // persist to backend
    notifications.value = notifications.value.filter(n => n.id !== taskId)
  } catch (err: any) {
    console.error('Failed to deny task:', err.message)
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
          <strong>Task:</strong> {{ n.taskName || n.extra?.taskName || n.relatedId  }}
          — requested by {{ n.fromUser }}
          - spent {{n.extra?.actualTime || 'N/A' }} mins
          — status: {{ n.status }}
          <ConfirmAction
            v-if="n.status === 'pending'"
            :taskId="n.id"
            :peerId="props.userId"
            @confirmed="handleConfirmed"
            @denied="handleDenied"
          />
        </template>

        <template v-else-if="n.type === 'group_invite'">
          <strong>Group Invite:</strong>
          {{ n.extra.groupName }} — invited by {{ n.fromUser }}
          <div v-if="n.status === 'pending'" class="confirm-action">
            <button @click="handleAcceptInvite(n)">Accept</button>
            <button class="deny" @click="handleDeclineInvite(n)">Decline</button>
          </div>
        </template>
      </li>
    </ul>
  </div>
</template>

<style scoped>
/* Reuse ConfirmAction styling */
.confirm-action button {
  background: #2b8aef;
  color: white;
  border: none;
  padding: 6px 10px;
  border-radius: 4px;
  margin-right: 4px;
  cursor: pointer;
  transition: background 0.2s;
}
.confirm-action button:hover {
  background: #1c6dd0;
}
.confirm-action button.deny {
  background: #ef2b2b;
}
.confirm-action button.deny:hover {
  background: #d12020;
}
</style>
