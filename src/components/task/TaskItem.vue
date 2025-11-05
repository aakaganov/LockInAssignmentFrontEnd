<script setup lang="ts">
import { ref } from 'vue'
import { useTaskStore } from '../../stores/taskStore'
import { useConfirmationStore } from '../../stores/confirmationStore'

const taskStore = useTaskStore()
const confirmationStore = useConfirmationStore()

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

async function onComplete() {
  if (actualTimeInput.value === null || actualTimeInput.value <= 0) {
    alert('Please enter the actual time spent (in minutes).')
    return
  }

  try {
    console.log(`Completing task: ${props.taskId} with actualTime: ${actualTimeInput.value}`)
    await taskStore.completeTask(props.taskId, actualTimeInput.value, props.ownerId)
    localStatus.value = 'completed'
  } catch (err) {
    console.error(err)
    alert('Failed to complete task.')
  }
}

async function onDelete() {
  try {
    console.log(`Deleting task: ${props.taskId} (owner: ${props.ownerId})`)
    await taskStore.deleteTask(props.taskId, props.ownerId)
  } catch (err) {
    console.error(err)
    alert('Failed to delete task.')
  }
}

async function onRequestConfirmation() {
  try {
    await confirmationStore.requestConfirmation(props.taskId, props.ownerId)
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
      <!-- ✅ Add input for actual time -->
      <div v-if="localStatus === 'pending'">
        <input
          v-model.number="actualTimeInput"
          type="number"
          min="1"
          placeholder="Actual time (min)"
          style="width: 150px; margin-right: 8px;"
        />
        <button
          @click="onComplete"
          :disabled="taskStore.loading"
        >
          {{ taskStore.loading ? 'Working...' : 'Complete' }}
        </button>
      </div>

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
