<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useGroupStore } from '../../stores/groupStore'
import CreateGroupForm from './CreateGroupForm.vue'

const props = defineProps<{ userId: string }>()
const emit = defineEmits<{ (e: 'selectGroup', groupId: string): void }>()

const groupStore = useGroupStore()
const showCreateForm = ref(false)

onMounted(async () => {
  if (props.userId) await groupStore.fetchGroups(props.userId)
})

watch(() => props.userId, async (newId) => {
  if (newId) await groupStore.fetchGroups(newId)
})

function toggleCreateForm() {
  showCreateForm.value = !showCreateForm.value
}

async function handleGroupCreated() {
  showCreateForm.value = false
  await groupStore.fetchGroups(props.userId)
}

async function deleteGroup(groupId: string) {
  console.log("Trying to delete group:", groupId);
  if (!props.userId) return
  if (!confirm("Are you sure you want to delete this group?")) return

  try {
    const res = await groupStore.deleteGroup(groupId, props.userId)
    console.log("Delete response:", res);
    
  } catch (err: any) {
    console.error("Failed to delete group:", err.message)
  }
}
</script>

<template>
  <div class="group-list">
    <h3>Your Groups</h3>

    <!-- Create Group Button -->
    <button @click="toggleCreateForm" class="create-btn">
      {{ showCreateForm ? 'Cancel' : '➕ Create New Group' }}
    </button>

    <!-- Inline Create Form -->
    <CreateGroupForm
      v-if="showCreateForm"
      :ownerId="props.userId"
      @created="handleGroupCreated"
    />

    <!-- Group List -->
    <ul v-if="groupStore.groups.length > 0">
      <li
        v-for="g in groupStore.groups"
        :key="g.groupId"
        class="group-item"
      >
        <!-- Display the groupName and emit the groupId (App expects an ID) -->
        <span @click="$emit('selectGroup', g.groupId)">
          {{ g.groupName }}
        </span>

        <!-- Delete button for owner -->
        <button
          v-if="g.ownerId === props.userId"
          class="delete-btn"
          @click.stop="deleteGroup(g.groupId)"
        >
          ❌
        </button>
      </li>
    </ul>

    <p v-else>No groups yet.</p>

    <p v-if="groupStore.error" class="error">{{ groupStore.error }}</p>
  </div>
</template>

<style scoped>
.group-list {
  padding: 8px;
}

.create-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 6px 10px;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 8px;
}

.create-btn:hover {
  background: #0056b3;
}

.group-item {
  list-style: none;
  padding: 6px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

.group-item span {
  flex: 1;
}

.group-item:hover {
  background: #f2f2f2;
}

.delete-btn {
  background: transparent;
  border: none;
  color: red;
  margin-left: 8px;
  cursor: pointer;
}
.delete-btn:hover {
  color: darkred;
}

.error {
  color: red;
  font-size: 0.9em;
}
</style>