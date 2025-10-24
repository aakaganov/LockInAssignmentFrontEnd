<script setup lang="ts">
import { ref, watch } from 'vue'
import { useTaskStore } from '../../stores/taskStore'

const taskStore = useTaskStore()

const props = defineProps<{
  ownerId: string | null
  editingTask?: {
    taskId: string
    title: string
    description?: string
    dueDate?: string | null
    estimatedTime: number
  } | null
}>()

const emit = defineEmits<{
  (e: 'created'): void
  (e: 'updated'): void
}>()

// Local form state
const title = ref('')
const description = ref('')
const dueDate = ref<string | null>(null)
const estimatedTime = ref<number>(30)

// Track props.editingTask and update form accordingly
watch(() => props.editingTask, (t) => {
  if (t) {
    title.value = t.title
    description.value = t.description ?? ''
    dueDate.value = t.dueDate ?? null
    estimatedTime.value = t.estimatedTime
  } else {
    resetForm()
  }
}, { immediate: true })

// Reset form helper
function resetForm() {
  title.value = ''
  description.value = ''
  dueDate.value = null
  estimatedTime.value = 30
}

async function submit() {
  if (!props.ownerId) {
    alert('Select a user first')
    return
  }

  try {
    if (props.editingTask) {
      // ✅ Update existing task using Pinia store
      await taskStore.updateTask(props.editingTask.taskId, {
        title: title.value,
        description: description.value,
        dueDate: dueDate.value,
        estimatedTime: estimatedTime.value
      })
      emit('updated')
    } else {
      // ✅ Create new task using Pinia store
      await taskStore.createTask({
        ownerId: props.ownerId,
        title: title.value,
        description: description.value,
        dueDate: dueDate.value,
        estimatedTime: estimatedTime.value
      })
      emit('created')
      resetForm()
    }
  } catch (err) {
    console.error(err)
    alert('Something went wrong. Please try again.')
  }
}
</script>

<template>
  <div class="task-form">
    <h3>{{ props.editingTask ? 'Edit Task' : 'Create Task' }}</h3>

    <input v-model="title" placeholder="Title" />
    <textarea v-model="description" placeholder="Description" />

    <div>
      <label>
        Due date:
        <input v-model="dueDate" type="date" />
      </label>
      <label style="margin-left:12px;">
        Est. minutes:
        <input v-model.number="estimatedTime" type="number" min="1" />
      </label>
    </div>

    <button @click="submit" :disabled="taskStore.loading">
      {{ taskStore.loading ? 'Working...' : (props.editingTask ? 'Save' : 'Create') }}
    </button>

    <p v-if="taskStore.error" style="color:red">{{ taskStore.error }}</p>
  </div>
</template>

<style scoped>
.task-form { padding: 10px; border: 1px solid #eee; border-radius: 6px; }
input, textarea { display: block; width: 100%; margin: 6px 0; }
</style>
