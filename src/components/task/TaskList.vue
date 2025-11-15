<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useTaskStore } from '../../stores/taskStore'
import TaskItem from './TaskItem.vue'

const props = defineProps<{
  ownerId: string | null
}>()

const emit = defineEmits<{
  (e: 'editTask', taskId: string): void
}>()

const taskStore = useTaskStore()

// 🆕 State for filtering
const showCompleted = ref(true)

// Load tasks when mounted or when owner changes
onMounted(async () => {
  if (props.ownerId) {
    await taskStore.fetchTasks(props.ownerId)
  }
})

watch(() => props.ownerId, async (newOwner) => {
  if (newOwner) {
    await taskStore.fetchTasks(newOwner)
  }
})

// 🆕 Computed filtered tasks
const filteredTasks = computed(() => {
  if (showCompleted.value) return taskStore.tasks
  return taskStore.tasks.filter(t => t.status !== 'completed' && t.status !== 'confirmed')
})
</script>

<template>
  <div class="task-list">
    <div class="header">
      <h3>Your Tasks</h3>

      <!-- Toggle button -->
      <button @click="showCompleted = !showCompleted">
        {{ showCompleted ? 'Hide Completed' : 'Show Completed' }}
      </button>
      <!-- Suggested order button -->
      <button @click="taskStore.suggestTaskOrder()" style="margin-left: 8px;">
        Suggest Order
      </button>
    </div>

    <div v-if="!props.ownerId">
      <p>Please select a user to see tasks.</p>
    </div>

    <div v-else>
      <p v-if="taskStore.error" class="error">{{ taskStore.error }}</p>

      <div v-if="filteredTasks.length === 0">
        <p>No tasks to show.</p>
      </div>

      <div v-else>
        <TaskItem
          v-for="t in filteredTasks"
          :key="t.taskId"
          :taskId="t.taskId"
          :title="t.title"
          :description="t.description"
          :dueDate="t.dueDate"
          :estimatedTime="t.estimatedTime"
          :actualTime="t.actualTime"
          :status="t.status"
          :ownerId="props.ownerId"
          :groupRequiresConfirmation="t.groupRequiresConfirmation"
          :confirmationRequested="t.confirmationRequested"
          :confirmed="t.confirmed"
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
