<template>
  <div class="user-profile" v-if="props.userId">
    <h3>Profile</h3>

    <label>Name:</label>
    <input v-model="name" />

    <label>Email:</label>
    <input v-model="email" type="email" />

    <label>Password:</label>
    <input v-model="password" type="password" placeholder="Leave blank to keep current password" />

    <button @click="saveProfile">Save</button>
    <button @click="logout">Logout</button>
    <button @click="$emit('deleteUser', props.userId)">Delete Account</button>
  </div>

  <div v-else>
    <p>No user selected.</p>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useUserStore } from '../../stores/userStore'

const userStore = useUserStore()

const props = defineProps<{ userId: string | null }>()
const emit = defineEmits<{
  (e: 'logout'): void
  (e: 'deleteUser', userId: string): void
}>()

const name = ref('')
const email = ref('')
const password = ref('')

// Load user data
watch(
  () => props.userId,
  async (newId) => {
    if (newId) {
      await userStore.fetchUser(newId)
      const user = userStore.users.find(u => u.userId === newId)
      if (user) {
        name.value = user.name
        email.value = user.email
        password.value = ''
      }
    }
  },
  { immediate: true }
)

// Save profile
async function saveProfile() {
  if (!props.userId) return
  await userStore.updateUser(props.userId, name.value, email.value, password.value || undefined)
  password.value = ''
  alert('Profile updated successfully!')
}

// ✅ Logout without router
function logout() {
  userStore.logout()
  //console.log("Logout clicked");
  emit('logout')  // tell App.vue to switch back to login screen
}
</script>


<style scoped>
.user-profile {
  padding: 12px;
  border: 1px solid #eee;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

button {
  margin-top: 4px;
}
</style>
