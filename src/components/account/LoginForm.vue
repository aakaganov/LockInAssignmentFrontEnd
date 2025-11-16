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
    let result
    if (isSignup.value) {
      if (!name.value.trim()) {
        alert("Name is required for signup.")
        return
      }
      result = await userStore.signup(name.value.trim(), email.value.trim(), password.value)
    } else {
      result = await userStore.login(email.value.trim(), password.value)
    }
    if (!result || !result.userId) {
      console.error('Login failed: result or result.userId is undefined', result)
      alert("Login failed. Please check your credentials or backend.")
      return
    }

    emit('login', result.userId)
  } catch (err: any) {
    console.error('Auth failed:', err.message)
    alert(err.message || "Authentication failed.")
  }
}
</script>

<template>
  <div class="login-card">
    <h3>{{ isSignup ? "Create Account" : "Login" }}</h3>
    
    <div class="inputs">
      <input v-if="isSignup" v-model="name" placeholder="Full Name" />
      <input v-model="email" placeholder="Email or Username" />
      <input v-model="password" type="password" placeholder="Password" />
    </div>

    <button @click="handleAuth">
      {{ isSignup ? "Sign Up" : "Login" }}
    </button>

    <p class="toggle" @click="isSignup = !isSignup">
      {{ isSignup ? "Already have an account? Login" : "No account? Sign up" }}
    </p>
  </div>
</template>

<style scoped>
.login-card {
  max-width: 400px;
  margin: 60px auto;
  padding: 32px;
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 12px 24px rgba(0,0,0,0.12);
  display: flex;
  flex-direction: column;
  gap: 20px;
  text-align: center;
  transition: transform 0.2s;
}

.login-card:hover {
  transform: translateY(-2px);
}

h3 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e2a38;
  margin-bottom: 16px;
}

.inputs {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

input {
  padding: 12px 16px;
  border-radius: 10px;
  border: 1px solid #d1d5db;
  font-size: 1rem;
  transition: all 0.2s;
}

input:focus {
  border-color: #3498db;
  box-shadow: 0 0 0 4px rgba(52, 152, 219, 0.2);
  outline: none;
}

button {
  padding: 14px;
  border-radius: 10px;
  background-color: #3498db;
  color: #fff;
  font-weight: 600;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
}

button:hover {
  background-color: #2980b9;
  transform: translateY(-1px);
}

.toggle {
  color: #3498db;
  text-decoration: underline;
  cursor: pointer;
  font-size: 0.95rem;
  margin-top: 12px;
}
</style>
