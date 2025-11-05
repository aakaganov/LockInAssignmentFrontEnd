<script setup lang="ts">
import { ref, watch } from 'vue'
import { useGroupStore } from '../../stores/groupStore'

const props = defineProps<{
  groupId: string
  name?: string
  members?: string[]
  requiresConfirmation?: boolean
}>()

const emit = defineEmits<{
  (e: 'toggleConfirmation', groupId: string, requiresConfirmation: boolean): void
}>()

// Local reactive state for checkbox
const localRequires = ref(!!props.requiresConfirmation)

// Use Pinia group store
const groupStore = useGroupStore()

// Keep local state updated if parent updates props
watch(() => props.requiresConfirmation, (newValue) => {
  localRequires.value = !!newValue
})

async function toggle() {
  localRequires.value = !localRequires.value
  // Call backend through store
  await groupStore.setConfirmationPolicy(props.groupId, localRequires.value)
  // Emit event for parent if needed
  emit('toggleConfirmation', props.groupId, localRequires.value)
}
</script>


<template>
  <div class="group-item">
    <h4>{{ name ?? groupId }}</h4>

    <!-- ✅ Members list -->
    <p v-if="members && members.length">
      <strong>Members:</strong> {{ members.join(', ') }}
    </p>
    <p v-else>No members yet.</p>

    <!-- ✅ Confirmation status -->
    <p v-if="requiresConfirmation">
      Confirmation is required for tasks in this group.
    </p>

    <label>
      <input type="checkbox" v-model="localRequires" @change="toggle" />
      Require task confirmation in this group
    </label>

    <!-- Slot for showing members or controls -->
    <slot name="members"></slot>
  </div>
</template>


<style scoped>
.group-item {
  border: 1px solid #eee;
  padding: 8px;
  border-radius: 6px;
  margin-bottom: 10px;
}
</style>
