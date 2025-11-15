<script setup lang="ts">
import { ref } from "vue";
import { useUserStore } from "../../stores/userStore";

const userStore = useUserStore();
const currentUser = userStore.currentUser;

const name = ref(currentUser?.name || "");
const email = ref(currentUser?.email || "");
const password = ref("");

const successMessage = ref("");
const errorMessage = ref("");

const handleSave = async () => {
  if (!currentUser) return;
  try {
    await userStore.updateUser(currentUser.userId, name.value, email.value, password.value || undefined);
    successMessage.value = "Profile updated successfully!";
    errorMessage.value = "";
    password.value = "";
  } catch (err: any) {
    successMessage.value = "";
    errorMessage.value = err.message || "Failed to update profile.";
  }
};
</script>

<template>
  <div class="edit-profile-card">
    <h3>Edit Profile</h3>

    <label>
      Name:
      <input v-model="name" type="text" />
    </label>

    <label>
      Email:
      <input v-model="email" type="email" />
    </label>

    <label>
      Password:
      <input v-model="password" type="password" placeholder="Leave blank to keep current" />
    </label>

    <button @click="handleSave">Save Changes</button>

    <p v-if="successMessage" class="success">{{ successMessage }}</p>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
  </div>
</template>

<style scoped>
.edit-profile-card {
  background: #fff;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  max-width: 400px;
  margin: auto;
}

h3 {
  margin-bottom: 12px;
  text-align: center;
}

label {
  display: block;
  margin-bottom: 10px;
  font-weight: 600;
}

input {
  width: 100%;
  padding: 8px;
  margin-top: 4px;
  border-radius: 6px;
  border: 1px solid #ccc;
}

button {
  width: 100%;
  background-color: #3498db;
  color: white;
  padding: 8px;
  margin-top: 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
button:hover {
  background-color: #2980b9;
}

.success {
  color: #2ecc71;
  margin-top: 10px;
  text-align: center;
}
.error {
  color: #e74c3c;
  margin-top: 10px;
  text-align: center;
}
</style>
