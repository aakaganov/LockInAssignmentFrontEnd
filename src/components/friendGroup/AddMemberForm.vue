<script setup lang="ts">
import { ref } from 'vue'
import { useGroupStore } from "../../stores/groupStore";


const props = defineProps<{
  groupId: string
}>()

const emit = defineEmits<{
  (e: 'added', groupId: string, userId: string): void
}>()

const newMember = ref('')
const groupStore = useGroupStore()

async function add() {
  if (!newMember.value) return
  try {
    await groupStore.addMember(props.groupId, newMember.value)
    emit('added', props.groupId, newMember.value)
    newMember.value = ''
  } catch (err: any) {
    console.error('Error adding member:', err.message)
  }
}
</script>

<template>
  <div class="add-member">
    <h4>Add Member</h4>
    <input v-model="newMember" placeholder="User ID to add" />
    <button @click="add">Add</button>
  </div>
</template>

<style scoped>
.add-member { padding: 6px; }
input { margin-right: 6px; }
</style>
