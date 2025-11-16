<script setup lang="ts">
import { ref } from 'vue';
import { useGroupStore } from '../../stores/groupStore';

const props = defineProps<{
  ownerId: string;
}>();

const emit = defineEmits<{
  (e: 'created'): void;
}>();

const groupStore = useGroupStore();

const groupName = ref('');
const confirmationRequired = ref(false);
const invitedEmails = ref(''); // comma-separated emails
const loading = ref(false);
const error = ref<string | null>(null);

async function handleCreate() {
  if (!groupName.value.trim()) {
    error.value = 'Group name is required.';
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    // Split invited emails
    const emails = invitedEmails.value
      .split(',')
      .map(e => e.trim())
      .filter(Boolean);

    // Create group and send notifications automatically in backend
    await groupStore.createGroup({
      ownerId: props.ownerId,
      groupName: groupName.value,
      confirmationRequired: confirmationRequired.value,
      invitedEmails: emails,
    });

    emit('created');

    // Reset form
    groupName.value = '';
    confirmationRequired.value = false;
    invitedEmails.value = '';
  } catch (err: any) {
    console.error('Failed to create group:', err);
    error.value = err.message || 'Failed to create group.';
  } finally {
    loading.value = false;
  }
}

</script>

<template>
  <div class="create-group-form">
    <h4>Create New Group</h4>

    <div class="field">
      <label>Group Name:</label>
      <input v-model="groupName" type="text" placeholder="Enter group name" />
    </div>

    <div class="field checkbox">
      <label>
        <input type="checkbox" v-model="confirmationRequired" />
        Require confirmation for completed tasks
      </label>
    </div>

    <div class="field">
      <label>Invite Users by Email (comma-separated):</label>
      <input
        v-model="invitedEmails"
        type="text"
        placeholder="e.g. alice@example.com, bob@example.com"
      />
    </div>

    <button @click="handleCreate" :disabled="loading">
      {{ loading ? 'Creating...' : 'Create Group' }}
    </button>

    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<style scoped>
.create-group-form {
  border: 1px solid #ddd;
  padding: 8px;
  border-radius: 6px;
  margin-top: 8px;
  background: #fafafa;
}
.field {
  margin-bottom: 6px;
  display: flex;
  flex-direction: column;
}
.checkbox {
  flex-direction: row;
  align-items: center;
  gap: 6px;
}
input[type="text"] {
  padding: 4px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
button {
  background: #28a745;
  color: white;
  border: none;
  padding: 6px 10px;
  border-radius: 4px;
  cursor: pointer;
}
button:hover {
  background: #1e7e34;
}
.error {
  color: red;
  font-size: 0.9em;
  margin-top: 4px;
}
</style>