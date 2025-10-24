<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useUserStore } from '../../stores/userStore'

const props = defineProps<{
  userId: string | null
}>()

const emit = defineEmits<{
  (e: 'deleteUser', userId: string): void
}>()

const userStore = useUserStore()
const name = ref('')
const email = ref('')

// Watch for changes to props.userId
watch(
  () => props.userId,
  async (newId) => {
    if (newId) {
      await userStore.fetchUser(newId) // fetch single user from backend
      const user = userStore.users.find(u => u.userId === newId)
      if (user) {
        name.value = user.name
        email.value = user.email
      } else {
        name.value = ''
        email.value = ''
      }
    }
  },
  { immediate: true }
)
</script>

<template>
  <div class="user-profile">
    <h3>Profile</h3>
    <div v-if="props.userId">
      <p><strong>ID:</strong> {{ props.userId }}</p>
      <p><strong>Name:</strong> {{ name || '(not set)' }}</p>
      <p><strong>Email:</strong> {{ email || '(not set)' }}</p>
      <button @click="$emit('deleteUser', props.userId)">Delete Account</button>
    </div>
    <div v-else>
      <p>No user selected.</p>
    </div>
  </div>
</template>

<style scoped>
.user-profile {
  padding: 12px;
  border: 1px solid #eee;
  border-radius: 6px;
}
button {
  margin-top: 8px;
}
</style>
