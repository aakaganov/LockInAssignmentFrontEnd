<script setup lang="ts">
import { useConfirmationStore } from '../../stores/confirmationStore'

const props = defineProps<{
  taskId: string
  peerId?: string | null
}>()

const emit = defineEmits<{
  (e: 'confirmed', taskId: string, peerId?: string): void
}>()

const confirmationStore = useConfirmationStore()

async function onConfirm() {
  if (!props.peerId) return

  try {
    await confirmationStore.confirmTask(props.taskId, props.peerId)
    emit('confirmed', props.taskId, props.peerId)
  } catch (err: any) {
    console.error('Confirmation failed:', err.message)
  }
}
</script>

<template>
  <div class="confirm-action">
    <button @click="onConfirm">Confirm</button>
  </div>
</template>

<style scoped>
.confirm-action button {
  background: #2b8aef;
  color: white;
  border: none;
  padding: 6px 10px;
  border-radius: 4px;
}
</style>
