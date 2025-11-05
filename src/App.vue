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

// Stores
import { useUserStore } from './stores/userStore'
import { useTaskStore } from './stores/taskStore'
import { useGroupStore } from './stores/groupStore'
import { useConfirmationStore } from './stores/confirmationStore'
import { useLeaderboardStore } from './stores/leaderboardStore'

// Pinia stores
const userStore = useUserStore()
const taskStore = useTaskStore()
const groupStore = useGroupStore()
const confirmationStore = useConfirmationStore()
const leaderboardStore = useLeaderboardStore()

// Reactive state
const currentUserId = ref<string | null>(null)
const selectedGroupId = ref<string | null>(null)
const editingTaskId = ref<string | null>(null)
const loading = ref(true)

// Computed reactive values for current user info
const userDisplay = computed(() => {
  if (!userStore.currentUser) return ''
  return `${userStore.currentUser.name} (${userStore.currentUser.email})`
})

// Restore session on page load
onMounted(async () => {
  const valid = await userStore.restoreSession()
  if (valid && userStore.currentUser) {
    currentUserId.value = userStore.currentUser.userId
  } else {
    currentUserId.value = null
  }
})

// Watch currentUserId to fetch tasks, groups, and confirmations
watch(currentUserId, async (id) => {
  if (id) {
    await taskStore.fetchTasks(id)
    await groupStore.fetchGroups(id)
    await confirmationStore.fetchConfirmations(id)
  }
})

// Watch selectedGroupId to fetch leaderboard
watch(selectedGroupId, async (gid) => {
  if (gid) {
    await leaderboardStore.fetchByTasks(gid)
    await leaderboardStore.fetchByTime(gid)
  }
})
/** 
async function handleLogin(userId: string) {
  // Fetch full user data first so name/email are up to date
  await userStore.fetchUser(userId);
  // Then set currentUserId to trigger dashboard updates
  currentUserId.value = userId;
}
  */

async function handleLogin(userId: string) {
  await userStore.fetchUser(userId);
  currentUserId.value = userId;

  await Promise.all([
    taskStore.fetchTasks(userId),
    groupStore.fetchGroups(userId),
    confirmationStore.fetchConfirmations(userId),
  ]);
}


function handleLogout() {
  userStore.logout()
  localStorage.removeItem("currentUser") // extra safeguard
  currentUserId.value = null
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
  <div class="app">
    <h1>Time Management Dashboard</h1>
    <!-- LOGIN -->
    <section v-if="!currentUserId">
      <LoginForm @login="handleLogin" />
    </section>


    <!-- AUTHENTICATED APP -->
    <section v-else>
      <div class="layout">

        <!-- LEFT SIDEBAR -->
        <aside>
          <UserProfile
            :userId="currentUserId"
            @logout="handleLogout"
            @deleteUser="handleDeleteUser"
          />
          <GroupList :userId="currentUserId" @selectGroup="handleSelectGroup" />
          <hr />
          <NotificationList :userId="currentUserId" />
        </aside>

        <!-- MAIN CONTENT -->
        <main>
          <TaskForm
            :ownerId="currentUserId"
            :editingTask="editingTaskId ? taskStore.tasks.find(t => t.taskId === editingTaskId) : null"
            @created="editingTaskId = null"
            @updated="editingTaskId = null"
          />
          <TaskList
            :ownerId="currentUserId"
            @editTask="handleEditTask"
          />
        </main>

        <!-- RIGHT PANEL -->
        <aside>
          <div v-if="selectedGroupId">
            <GroupItem :groupId="selectedGroupId" />
            <AddMemberForm :groupId="selectedGroupId" />
            <Leaderboard :groupId="selectedGroupId" />
          </div>
          <div v-else>
            <p>Select a group to view group details and leaderboard.</p>
          </div>
        </aside>

      </div>
    </section>
  </div>
</template>

<style scoped>
.app {
  font-family: Arial, sans-serif;
  padding: 20px;
}
.layout {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  gap: 16px;
}
aside {
  background: #f8f8f8;
  padding: 12px;
  border-radius: 6px;
}
main {
  background: #fff;
  border-radius: 6px;
  padding: 12px;
  border: 1px solid #eee;
}
hr {
  margin: 12px 0;
}
</style>