<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useConfirmationStore } from '../../stores/confirmationStore'
import ConfirmAction from './ConfirmAction.vue'

const props = defineProps<{
  userId: string | null
}>()

// list of confirmations requested by user or for user to confirm
const confirmations = ref<Array<{
  taskId: string
  requestedBy: string
  confirmedBy: string[]
  status: 'pending' | 'verified'
}>>([])

const confirmationStore = useConfirmationStore()

async function loadConfirmations() {
  if (!props.userId) return
  confirmations.value = await confirmationStore.getConfirmations(props.userId)
}

onMounted(loadConfirmations)

// Reload confirmations whenever userId changes
watch(() => props.userId, loadConfirmations)

function handleConfirmed(taskId: string, peerId?: string) {
  // update the status locally (optional: refetch from store instead)
  const idx = confirmations.value.findIndex(c => c.taskId === taskId)
  if (idx !== -1) {
    confirmations.value[idx].confirmedBy.push(peerId!)
    // if all required confirmations done, set status to verified
    confirmations.value[idx].status = 'verified'
  }
}
</script>

<template>
  <div class="confirm-list">
    <h3>Confirmation Requests</h3>
    <div v-if="confirmations.length === 0">
      <p>No confirmations.</p>
    </div>
    <ul>
      <li v-for="c in confirmations" :key="c.taskId">
        <strong>Task:</strong> {{ c.taskId }} — requested by {{ c.requestedBy }} — status: {{ c.status }}
        <ConfirmAction
          v-if="c.status === 'pending'"
          :taskId="c.taskId"
          :peerId="props.userId"
          @confirmed="handleConfirmed"
        />
      </li>
    </ul>
  </div>
</template>

<style scoped>
.confirm-list {
  padding: 8px;
  border: 1px dashed #eee;
  border-radius: 6px;
}
</style>
