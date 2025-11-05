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
    let result;
    if (isSignup.value) {
      if (!name.value.trim()) {
        alert("Name is required for signup.")
        return
      }
      result = await userStore.signup(name.value.trim(), email.value.trim(), password.value)
    } else {
      result = await userStore.login(email.value.trim(), password.value)
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
      <input v-if="isSignup" v-model="name" placeholder="Name" />
      <input v-model="email" placeholder="Email or Username" />
      <input v-model="password" placeholder="Password" type="password" />
    </div>

    <button @click="handleAuth">
      {{ isSignup ? "Sign Up" : "Login" }}
    </button>

    <p @click="isSignup = !isSignup" class="toggle">
      {{ isSignup ? "Have an account? Login instead" : "No account? Sign up" }}
    </p>
  </div>
</template>

<style scoped>
.login-card {
  max-width: 380px;
  margin: 40px auto;
  padding: 24px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
  gap: 16px;
  text-align: center;
}

h3 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 12px;
}

.inputs {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

input {
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

input:focus {
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
  outline: none;
}

button {
  padding: 12px;
  margin-top: 8px;
  border-radius: 8px;
  background-color: #3498db;
  color: white;
  border: none;
  font-size: 1rem;
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
  font-size: 0.9rem;
  margin-top: 8px;
}
</style>
