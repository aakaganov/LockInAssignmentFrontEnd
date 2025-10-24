<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '../../stores/userStore'

const userId = ref('')
const emit = defineEmits<{
  (e: 'login', userId: string): void
}>()

const userStore = useUserStore()

async function onLogin() {
  if (!userId.value) return

  try {
    // Check if user exists
    await userStore.fetchUser(userId.value)
    const userExists = userStore.users.some(u => u.userId === userId.value)

    if (!userExists) {
      // Create new user if it doesn't exist
      await userStore.addUser(userId.value, userId.value, `${userId.value}@example.com`)
    }

    // Emit login event
    emit('login', userId.value)
  } catch (err: any) {
    console.error('Login failed:', err.message)
  }
}
</script>

<template>
  <div class="login-form">
    <h3>Sign in / Create User</h3>
    <input v-model="userId" placeholder="Enter userId" />
    <button @click="onLogin">Sign in</button>
    <p class="hint">Tip: use a simple id like "alice"</p>
  </div>
</template>

<style scoped>
.login-form {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
}
input {
  margin-right: 8px;
}
.hint {
  color: #666;
  font-size: 0.9rem;
}
</style>
