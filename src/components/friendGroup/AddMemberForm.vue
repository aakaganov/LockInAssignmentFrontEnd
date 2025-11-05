<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '../../stores/userStore'
import * as api from '../../apiClient'

const props = defineProps<{
  groupId: string
}>()

const emit = defineEmits<{
  (e: 'invited', groupId: string, email: string): void
}>()

const newInviteEmail = ref('')
const loading = ref(false)
const userStore = useUserStore()

async function invite() {
  if (!newInviteEmail.value) {
    alert("Please enter an email address.");
    return;
  }

  loading.value = true
  try {
    const payload = {
      groupId: props.groupId,
      email: newInviteEmail.value,
      invitedBy: userStore.currentUser?.userId || '', // who is inviting
    }

    const res = await api.inviteUserByEmail(payload)

    if (res.error) throw new Error(res.error)

    alert(`Invitation sent to ${newInviteEmail.value}`)
    emit('invited', props.groupId, newInviteEmail.value)
    newInviteEmail.value = ''
  } catch (err: any) {
    console.error("Invite error:", err.message)
    alert("Failed to send invitation.")
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="add-member">
    <h4>Invite Member</h4>
    <input
      v-model="newInviteEmail"
      placeholder="Enter user's email"
      type="email"
    />
    <button @click="invite" :disabled="loading">
      {{ loading ? 'Sending...' : 'Send Invite' }}
    </button>
  </div>
</template>

<style scoped>
.add-member { 
  padding: 6px; 
}
input { 
  margin-right: 6px; 
  padding: 4px;
}
button { 
  padding: 4px 8px;
  cursor: pointer;
}
</style>
