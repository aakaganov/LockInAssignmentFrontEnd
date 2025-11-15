<script setup lang="ts">
import { useConfirmationStore } from '../../stores/confirmationStore'



const props = defineProps<{
  taskId: string
  peerId?: string | null
}>()

const emit = defineEmits<{
  (e: 'confirmed', taskId: string, peerId?: string): void
  (e: 'denied', taskId: string, peerId?: string): void
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

async function onDeny() {
  if (!props.peerId) return

  try {
    // Optional: implement API deny if available
    // await confirmationStore.denyTask(props.taskId, props.peerId)
    await confirmationStore.denyTask(props.taskId, props.peerId);
    emit('denied', props.taskId, props.peerId)
  } catch (err: any) {
    console.error('Deny failed:', err.message)
  }
}
</script>

<template>
  <div class="confirm-action">
    <button @click="onConfirm">Confirm</button>
    <button class="deny" @click="onDeny">Deny</button>
  </div>
</template>

<style scoped>
.confirm-action button {
  background: #2b8aef;
  color: white;
  border: none;
  padding: 6px 10px;
  border-radius: 4px;
  margin-right: 4px;
}

.confirm-action button.deny {
  background: #ef2b2b;
}
</style>
