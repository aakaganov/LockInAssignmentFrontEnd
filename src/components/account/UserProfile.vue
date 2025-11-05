<script setup lang="ts">
import { defineProps, defineEmits, computed } from 'vue'
import { useUserStore } from '../../stores/userStore'

const props = defineProps<{
  userId: string
}>()

const emit = defineEmits<{
  (e: 'logout'): void
  (e: 'deleteUser'): void
}>()

const userStore = useUserStore()

const user = computed(() =>
  userStore.users.find(u => u.userId === props.userId) || userStore.currentUser
)
</script>

<template>
  <div class="profile-card" v-if="user">
    <h3>{{ user.name }}</h3>
    <p>{{ user.email }}</p>
    <div class="buttons">
      <button @click="$emit('logout')" class="logout">Logout</button>
      <button @click="$emit('deleteUser')" class="delete">Delete Account</button>
    </div>
  </div>
</template>

<style scoped>
.profile-card {
  background: #fff;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  text-align: center;
}

h3 {
  font-size: 1.2rem;
  margin-bottom: 4px;
}

p {
  font-size: 0.95rem;
  margin-bottom: 12px;
  color: #555;
}

.buttons {
  display: flex;
  justify-content: center;
  gap: 8px;
}

button {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  border: none;
}

button.logout {
  background-color: #3498db;
  color: white;
}

button.logout:hover {
  background-color: #2980b9;
}

button.delete {
  background-color: #e74c3c;
  color: white;
}

button.delete:hover {
  background-color: #c0392b;
}
</style>
