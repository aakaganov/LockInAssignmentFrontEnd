<!-- src/components/TaskConfirm.vue -->
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useGroupStore } from '../../stores/groupStore'
import { useConfirmationStore } from '../../stores/confirmationStore'
interface GroupMember {
  userId: string
  name: string
  email?: string
}

const filteredGroups = computed(() =>
  confirmGroups.value.map(g => ({
    ...g,
    members: g.members.filter((m: GroupMember) => m.userId !== props.ownerId)
  }))
)

const props = defineProps<{
  taskId: string
  taskName: string
  completionTime: number
  ownerId: string
  onClose: () => void
}>()

const groupStore = useGroupStore()
const confirmationStore = useConfirmationStore()

const loading = ref(false)
const selected = ref<Record<string, string[]>>({}) // groupId -> memberIds[]

const confirmGroups = computed(() =>
  groupStore.groups.filter(g => g.confirmationRequired)
)

onMounted(async () => {
  if (groupStore.groups.length === 0) {
    await groupStore.fetchGroups(props.ownerId)
  }
  groupStore.groups.forEach(g => {
    selected.value[g.groupId] = []
  })
/**
  confirmGroups.value.forEach(g => {
    if (!selected.value[g.groupId]) {
      selected.value[g.groupId] = []
    }
  }) */
  
})

async function sendRequests() {
  loading.value = true
  try {
    console.log('Selected (raw):', selected.value)
    let selectedPeers = Object.values(selected.value).filter(arr => Array.isArray(arr) && arr.length > 0).flat()
    selectedPeers = Array.from(new Set(selectedPeers.filter(Boolean))).filter(id => id !== props.ownerId)
    console.log('Flattened/deduped selected peers (filtered out owner):', selectedPeers)
    if (!selectedPeers || selectedPeers.length === 0) {
      alert('Select at least one member.')
      return;
    }

    // Call the store with each selected peer individually
    /**
    for (const peerId of selectedPeers) {
      await confirmationStore.requestConfirmation(
        props.taskId,
        props.ownerId,
        peerId // one at a time
      )
    }
    
    await confirmationStore.requestConfirmation(
      props.taskId,
      props.ownerId,  
      props.taskName,
      selectedPeers,
      props.completionTime,  // sender
      undefined,        // groupId (optional)
    );*/
    await confirmationStore.requestConfirmation(
        props.taskId,
        props.ownerId,  
        props.taskName,
        selectedPeers,
        props.completionTime,  // sender
        undefined,        // groupId (optional)
    );
    props.onClose()
  } catch (err) {
    console.error(err)
    alert('Failed to send confirmation requests.')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="overlay">
    <div class="modal">
      <h3>Request Confirmation</h3>
      <div v-if="confirmGroups.length === 0">
        <p>You have no groups requiring confirmation.</p>
      </div>

      <div v-for="g in filteredGroups" :key="g.groupId" class="group-block">
        <h4>{{ g.groupName }}</h4>
        <div class="members">
          <label
            v-for="m in g.members"
            :key="m.userId"
            class="member-option"
          >
            <input
              type="checkbox"
              :value="m.userId"
              v-model="selected[g.groupId]"
            />
            {{ m.name }} ({{ m.email }})
          </label>
        </div>
      </div>

      <div class="actions">
        <button @click="props.onClose">Cancel</button>
        <button @click="sendRequests" :disabled="loading">
          {{ loading ? 'Sending…' : 'Send' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal {
  background: white;
  border-radius: 8px;
  padding: 16px;
  width: 400px;
  max-height: 80vh;
  overflow-y: auto;
}
.group-block {
  margin-top: 12px;
}
.member-option {
  display: block;
  margin-bottom: 4px;
}
.actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
  gap: 8px;
}
</style>
