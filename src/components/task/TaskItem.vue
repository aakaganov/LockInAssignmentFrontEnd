<script setup lang="ts">
import { ref } from 'vue'
import { useTaskStore } from '../../stores/taskStore'

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

async function onComplete() {
  try {
    await taskStore.completeTask(props.taskId)
    localStatus.value = 'completed'
  } catch (err) {
    console.error(err)
    alert('Failed to complete task.')
  }
}

async function onDelete() {
  try {
    await taskStore.deleteTask(props.taskId)
  } catch (err) {
    console.error(err)
    alert('Failed to delete task.')
  }
}

async function onRequestConfirmation() {
  try {
    await taskStore.requestConfirmation(props.taskId, props.ownerId)
  } catch (err) {
    console.error(err)
    alert('Failed to request confirmation.')
  }
}

function onEdit() {
  emit('edit', props.taskId)
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
      <button
        v-if="localStatus === 'pending'"
        @click="onComplete"
        :disabled="taskStore.loading"
      >
        {{ taskStore.loading ? 'Working...' : 'Complete' }}
      </button>

      <button
        v-if="localStatus === 'completed' && !confirmed && !confirmationRequested && props.groupRequiresConfirmation"
        @click="onRequestConfirmation"
        :disabled="taskStore.loading"
      >
        Request Confirmation
      </button>

      <span v-if="confirmationRequested && !confirmed">Pending confirmation…</span>
      <span v-if="confirmed">✅ Verified</span>

      <button @click="onEdit">Edit</button>
      <button @click="onDelete" :disabled="taskStore.loading">Delete</button>
    </div>

    <p v-if="taskStore.error" class="error">{{ taskStore.error }}</p>
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
.error {
  color: red;
  font-size: 0.85rem;
}
</style>
