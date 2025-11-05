<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '../../stores/userStore'

const email = ref('')
const password = ref('')
const name = ref('') // Only used for signup
const isSignup = ref(false) // Toggle between login/signup mode
const userStore = useUserStore()

const emit = defineEmits<{
  (e: 'login', userId: string): void
}>()

async function handleAuth() {
  if (!email.value || !password.value) {
    alert("Email and password are required.")
    return
  }

  try {
    let user;
    if (isSignup.value) {
      if (!name.value.trim()) {
        alert("Name is required for signup.")
        return
      }
      user = await userStore.signup(name.value.trim(), email.value.trim(), password.value)
    } else {
      user = await userStore.login(email.value.trim(), password.value)
    }

    // Emit userId, not email
    emit('login', user.userId)
  } catch (err: any) {
    console.error('Auth failed:', err.message)
    alert(err.message || "Authentication failed.")
  }
}



</script>

<template>
  <div class="login-form">
    <h3>{{ isSignup ? "Create Account" : "Login" }}</h3>

    <div v-if="isSignup">
      <input v-model="name" placeholder="Name" />
    </div>

    <input v-model="email" placeholder="Email" type="email" />
    <input v-model="password" placeholder="Password" type="password" />

    <button @click="handleAuth">
      {{ isSignup ? "Sign Up" : "Login" }}
    </button>

    <p @click="isSignup = !isSignup" class="toggle">
      {{ isSignup ? "Have an account? Login instead" : "No account? Sign up" }}
    </p>
  </div>
</template>

<style scoped>
.login-form {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

button {
  margin-top: 4px;
}

.toggle {
  color: blue;
  text-decoration: underline;
  cursor: pointer;
  font-size: 0.9rem;
}
</style>
