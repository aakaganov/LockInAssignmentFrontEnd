<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useTaskStore } from '../../stores/taskStore'
import TaskItem from './TaskItem.vue'

const props = defineProps<{
  ownerId: string | null
}>()

const emit = defineEmits<{
  (e: 'editTask', taskId: string): void
}>()

const taskStore = useTaskStore()

// Load tasks when component mounts and when ownerId changes
onMounted(async () => {
  if (props.ownerId) {
    await taskStore.fetchTasks(props.ownerId)
  }
})

watch(
  () => props.ownerId,
  async newOwner => {
    if (newOwner) {
      await taskStore.fetchTasks(newOwner)
    }
  }
)

async function handleSuggestOrder() {
  if (!props.ownerId) return
  try {
    await taskStore.suggestOrder(props.ownerId)
  } catch (err) {
    console.error(err)
    alert('AI suggest order failed')
  }
}
</script>

<template>
  <div class="task-list">
    <div class="header">
      <h3>Your Tasks</h3>
      <button @click="handleSuggestOrder" :disabled="taskStore.loading">
        {{ taskStore.loading ? 'Working...' : 'Suggest Order (AI)' }}
      </button>
    </div>

    <div v-if="!props.ownerId">
      <p>Please select a user to see tasks.</p>
    </div>

    <div v-else>
      <p v-if="taskStore.error" class="error">{{ taskStore.error }}</p>

      <div v-if="taskStore.tasks.length === 0">
        <p>No tasks yet.</p>
      </div>

      <div v-else>
        <TaskItem
          v-for="t in taskStore.tasks"
          :key="t.taskId"
          :taskId="t.taskId"
          :title="t.title"
          :description="t.description"
          :dueDate="t.dueDate"
          :estimatedTime="t.estimatedTime"
          :actualTime="t.actualTime"
          :status="t.status"
          :ownerId="props.ownerId"
          :groupRequiresConfirmation="t.groupRequiresConfirmation ?? false"
          :confirmationRequested="t.confirmationRequested ?? false"
          :confirmed="t.confirmed ?? false"
          @edit="(id) => emit('editTask', id)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.task-list {
  padding: 8px;
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.error {
  color: red;
  margin-bottom: 8px;
}
</style>
