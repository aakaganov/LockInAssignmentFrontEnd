<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useGroupStore } from "../../stores/groupStore";

const props = defineProps<{
  userId: string | null
}>()

const emit = defineEmits<{
  (e: 'selectGroup', groupId: string): void
}>()

// Use Pinia store
const groupStore = useGroupStore()

// Automatically load groups when userId comes in
onMounted(() => {
  if (props.userId) {
    groupStore.listGroups(props.userId)
  }
})

// If userId changes, reload list
watch(() => props.userId, (newUserId) => {
  if (newUserId) {
    groupStore.listGroups(newUserId)
  }
})

// Groups come from store
const groups = computed(() => groupStore.groups)

function select(gid: string) {
  emit('selectGroup', gid)
}
</script>

<template>
  <div class="group-list">
    <h3>Your Groups</h3>

    <div v-if="groupStore.loading">Loading...</div>
    <div v-else-if="groups.length === 0">No groups yet.</div>

    <ul v-else>
      <li v-for="g in groups" :key="g.groupId">
        <button @click="select(g.groupId)">
          {{ g.name || g.groupId }}
        </button>
      </li>
    </ul>

    <div v-if="groupStore.error" class="error">{{ groupStore.error }}</div>
  </div>
</template>

<style scoped>
.group-list { padding: 8px; }
button { margin: 4px 0; }
.error { color: red; font-size: 0.9em; }
</style>
