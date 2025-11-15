<!-- src/components/task/TaskItem.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { useTaskStore } from '../../stores/taskStore'
import TaskConfirm from '../task/TaskConfirm.vue'

const taskStore = useTaskStore()

const props = defineProps<{
  taskId: string
  title: string
  description?: string
  dueDate?: string | null
  estimatedTime: number
  actualTime?: number | null
  status: 'pending' | 'completed'
  ownerId: string
  groupRequiresConfirmation?: boolean
  confirmationRequested?: boolean
  confirmed?: boolean
}>()

const emit = defineEmits<{
  (e: 'edit', taskId: string): void
}>()

const localStatus = ref(props.status)
const actualTimeInput = ref<number | null>(null)
const showConfirmModal = ref(false)

async function onComplete() {
  if (actualTimeInput.value === null || actualTimeInput.value <= 0) {
    alert('Please enter the actual time spent (in minutes).')
    return
  }

  try {
    await taskStore.completeTask(props.taskId, actualTimeInput.value, props.ownerId)
    localStatus.value = 'completed'
  } catch (err) {
    console.error(err)
    alert('Failed to complete task.')
  }
}

function onEdit() {
  emit('edit', props.taskId)
}

async function onDelete() {
  try {
    await taskStore.deleteTask(props.taskId, props.ownerId)
  } catch (err) {
    console.error(err)
    alert('Failed to delete task.')
  }
}
</script>

<template>
  <div class="task-item">
    <div class="meta">
      <strong>{{ title }}</strong>
      <span class="status">[{{ localStatus }}]</span>
    </div>

    <div class="body">
      <p v-if="description">{{ description }}</p>
      <p v-if="dueDate"><small>Due: {{ dueDate }}</small></p>
      <p><small>Est: {{ estimatedTime }} min</small></p>
    </div>

    <div class="actions">
      <!-- Pending task input -->
      <div v-if="localStatus === 'pending'">
        <input
          v-model.number="actualTimeInput"
          type="number"
          min="1"
          placeholder="Actual time (min)"
          style="width: 150px; margin-right: 8px;"
        />
        <button @click="onComplete" :disabled="taskStore.loading">
          {{ taskStore.loading ? 'Working…' : 'Complete' }}
        </button>
      </div>

      <!-- ✅ Confirm button for completed tasks -->
      <button
        v-if="localStatus === 'completed' && !props.confirmed"
        @click="showConfirmModal = true"
      >
        Confirm
      </button>

      <!-- Confirmation status -->
      <span v-if="props.confirmationRequested && !props.confirmed">Pending confirmation…</span>
      <span v-if="props.confirmed">✅ Verified</span>

      <!-- Edit/Delete buttons -->
      <button @click="onEdit">Edit</button>
      <button @click="onDelete" :disabled="taskStore.loading">Delete</button>
    </div>

    <!-- Modal for task confirmation -->
    <TaskConfirm
      v-if="showConfirmModal"
      :taskId="props.taskId"
      :taskName="props.title"
      :completionTime="props.actualTime ?? 0"
      :ownerId="props.ownerId"
      :onClose="() => (showConfirmModal = false)"
    />
  </div>
</template>

<style scoped>
.task-item {
  border: 1px solid #f1f1f1;
  padding: 8px;
  border-radius: 6px;
  margin-bottom: 8px;
}
.actions {
  margin-top: 8px;
}
.status {
  margin-left: 8px;
  color: #666;
}
</style>
