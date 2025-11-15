<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'

// Components
import LoginForm from './components/account/LoginForm.vue'
import UserProfile from './components/account/UserProfile.vue'
import TaskForm from './components/task/TaskForm.vue'
import TaskList from './components/task/TaskList.vue'
import NotificationList from './components/confirmAction/NotificationList.vue'
import GroupList from './components/friendGroup/GroupList.vue'
import GroupItem from './components/friendGroup/GroupItem.vue'
import AddMemberForm from './components/friendGroup/AddMemberForm.vue'
import Leaderboard from './components/leaderboard/Leaderboard.vue'
import UserEdit from './components/account/UserEdit.vue'

// Stores
import { useUserStore } from './stores/userStore'
import { useTaskStore } from './stores/taskStore'
import { useGroupStore } from './stores/groupStore'
import { useConfirmationStore } from './stores/confirmationStore'
import { useLeaderboardStore } from './stores/leaderboardStore'
import { useNotificationStore } from './stores/notificationStore'

const userStore = useUserStore()
const taskStore = useTaskStore()
const groupStore = useGroupStore()
const confirmationStore = useConfirmationStore()
const leaderboardStore = useLeaderboardStore()
const notificationStore = useNotificationStore()

const currentUserId = ref<string | null>(null)
const selectedGroupId = ref<string | null>(null)
const editingTaskId = ref<string | null>(null)

// Computed display
const userDisplay = computed(() =>
  userStore.currentUser ? `${userStore.currentUser.name} (${userStore.currentUser.email})` : ''
)

// --- Centralized user data sync ---
async function syncUserData(userId: string) {
  try {
    await Promise.all([
      taskStore.fetchTasks(userId),
      groupStore.fetchGroups(userId),
      confirmationStore.fetchConfirmations(userId),
      notificationStore.fetchNotifications(userId)
    ])
  } catch (err) {
    console.error('syncUserData error:', err)
  }
}
groupStore.$onAction(({ name, after, args }) => {
  if (name === "deleteGroup") {
    after(() => {
      const deletedId = args[0]; // groupId passed into deleteGroup
      if (selectedGroupId.value === deletedId) {
        selectedGroupId.value = null;       // 🔥 Immediately deselect
      }
    });
  }
});

// --- Restore session ---
onMounted(async () => {
  const valid = await userStore.restoreSession()
  if (valid && userStore.currentUser) {
    currentUserId.value = userStore.currentUser.userId
    await syncUserData(currentUserId.value)
  }
})

// --- Watch selected group for leaderboard ---
watch(selectedGroupId, async (gid) => {
  if (!gid) return
  await Promise.all([
    leaderboardStore.fetchByTasks(gid),
    leaderboardStore.fetchByTime(gid)
  ])
})

// --- Handlers ---
async function handleLogin(userId: string) {
  try {
    selectedGroupId.value = null;            // << RESET HERE
    groupStore.clearSelectedGroups();
    await userStore.fetchUser(userId)
    currentUserId.value = userId
    await syncUserData(userId)
  } catch (err) {
    console.error('handleLogin error:', err)
  }
}

function handleLogout() {
  selectedGroupId.value = null;       
  groupStore.clearSelectedGroups(); 
  userStore.logout()
  currentUserId.value = null
}
function handleLeftGroup(groupId: string) {
  if (selectedGroupId.value === groupId) {
    selectedGroupId.value = null
  }
}
async function handleDeleteUser() {
  if (!currentUserId.value) return
  await userStore.deleteUser(currentUserId.value)
  currentUserId.value = null
}

function handleSelectGroup(groupId: string) {
  selectedGroupId.value = groupId
}

function handleEditTask(taskId: string) {
  editingTaskId.value = taskId
}
</script>

<template>
  <div class="app-container">
    <header>
      <h1>Time Management Dashboard</h1>
      <p v-if="currentUserId" class="user-display">{{ userDisplay }}</p>
    </header>

    <main>
      <!-- LOGIN -->
      <section v-if="!currentUserId" class="login-section">
        <LoginForm @login="handleLogin" />
      </section>

      <!-- AUTHENTICATED APP -->
      <section v-else class="dashboard">
        <!-- LEFT SIDEBAR -->
        <aside class="sidebar left">
          <UserProfile
            :userId="currentUserId"
            @logout="handleLogout"
            @deleteUser="handleDeleteUser"
          />
          <UserEdit />
          <GroupList :userId="currentUserId" @selectGroup="handleSelectGroup" />
          <hr />
          <NotificationList :userId="currentUserId" />
        </aside>

        <!-- MAIN CONTENT -->
        <section class="main-content">
          <TaskForm
            :ownerId="currentUserId"
            :editingTask="editingTaskId ? taskStore.tasks.find(t => t.taskId === editingTaskId) : null"
            @created="editingTaskId = null"
            @updated="editingTaskId = null"
          />
          <TaskList :ownerId="currentUserId" @editTask="handleEditTask" />
        </section>

        <!-- RIGHT PANEL -->
        <aside class="sidebar right">
          <div v-if="selectedGroupId">
            <GroupItem
              :groupId="selectedGroupId"
              :name="groupStore.groups.find(g => g.groupId === selectedGroupId)?.groupName"
              :members="groupStore.groups.find(g => g.groupId === selectedGroupId)?.members"
              :requiresConfirmation="groupStore.groups.find(g => g.groupId === selectedGroupId)?.confirmationRequired"
              @leftGroup="handleLeftGroup"
              />
            <AddMemberForm :groupId="selectedGroupId" />
            <Leaderboard :groupId="selectedGroupId" />
          </div>
          <div v-else class="placeholder">
            <p>Select a group to view group details and leaderboard.</p>
          </div>
        </aside>
      </section>
    </main>
  </div>
</template>

<style scoped>
/* Styles remain unchanged from original */
.app-container { font-family: 'Inter', Arial, sans-serif; color: #333; padding: 16px; }
header { text-align: center; margin-bottom: 24px; }
header h1 { font-size: 2rem; margin-bottom: 4px; color: #2c3e50; }
.user-display { font-size: 0.9rem; color: #555; }
.dashboard { display: grid; grid-template-columns: 1fr 2fr 1fr; gap: 16px; }
.sidebar { background: #f7f8fa; padding: 16px; border-radius: 8px; box-shadow: 0 1px 4px rgba(0,0,0,0.05); }
.sidebar.left { display: flex; flex-direction: column; gap: 16px; }
.sidebar.right { display: flex; flex-direction: column; gap: 12px; }
.main-content { display: flex; flex-direction: column; gap: 16px; }
hr { border: 0; border-top: 1px solid #ddd; margin: 12px 0; }
.placeholder { text-align: center; padding: 24px; border: 2px dashed #ccc; border-radius: 8px; color: #888; font-style: italic; }
</style>