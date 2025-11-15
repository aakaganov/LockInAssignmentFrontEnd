<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useGroupStore } from '../../stores/groupStore';
import { useUserStore } from '../../stores/userStore';

const userStore = useUserStore();
const $storeUserId = userStore.currentUser?.userId;
const props = defineProps<{
  groupId: string;
  name?: string | null;
  owner?: { userId: string; name: string; email: string } | null;
  members?: { userId: string; name: string; email: string }[];
  requiresConfirmation?: boolean;
}>();

const emit = defineEmits<{
  (e: 'toggleConfirmation', groupId: string, requiresConfirmation: boolean): void;
  (e: 'leftGroup', groupId: string): void; 
}>();

const groupStore = useGroupStore();
const localRequires = ref(!!props.requiresConfirmation);

watch(() => props.requiresConfirmation, (newVal) => {
  localRequires.value = !!newVal;
});
async function leaveGroup() {
  if (!$storeUserId) return;
  
  if (!confirm(`Are you sure you want to leave group "${props.name}"?`)) return;

  try {
    await groupStore.leaveGroup(props.groupId, $storeUserId);
    emit('leftGroup', props.groupId);
  } catch (err) {
    alert('Failed to leave the group.');
    console.error(err);
  }
}
// Compute owner reliably
const owner = computed(() => {
  if (props.owner) return props.owner;
  const group = groupStore.groups.find(g => g.groupId === props.groupId);
  if (!group) return { userId: '', name: 'Unknown', email: '—' };
  const ownerMember = props.members?.find(m => m.userId === group.ownerId);
  return ownerMember ?? { userId: group.ownerId, name: 'Unknown', email: '—' };
});

// Compute members excluding owner
const nonOwnerMembers = computed(() => {
  if (!props.members || props.members.length === 0) return [];
  const group = groupStore.groups.find(g => g.groupId === props.groupId);
  if (!group) return props.members;
  return props.members.filter(m => m.userId !== group.ownerId);
});

async function toggle() {
  localRequires.value = !localRequires.value;
  await groupStore.setConfirmationPolicy(props.groupId, localRequires.value);
  emit('toggleConfirmation', props.groupId, localRequires.value);
}
</script>

<template>
  <div class="group-item">
    <h4>{{ name ?? groupId }}</h4>

    <!-- Owner -->
    <div>
      <strong>Owner:</strong>
      <p>{{ owner.name }} ({{ owner.email }})</p>
    </div>
    <!-- Members -->
    <div>
      <strong>Members:</strong>
      <div v-if="nonOwnerMembers.length > 0">
        <ul>
          <li v-for="member in nonOwnerMembers" :key="member.userId">
            {{ member.name }} ({{ member.email }})
          </li>
        </ul>
      </div>
      <p v-else>No additional members.</p>
    </div>
    <!-- Leave Group button for non-owners -->
    <div v-if="owner.userId !== $storeUserId && nonOwnerMembers.some(m => m.userId === $storeUserId)">
      <button @click="leaveGroup" class="leave-btn">Leave Group</button>
    </div>

    <!-- Members list
    <div v-if="nonOwnerMembers.length > 0">
      <strong>Members:</strong>
      <ul>
        <li v-for="member in nonOwnerMembers" :key="member.userId">
          {{ member.name }} ({{ member.email }})
        </li>
      </ul>
    </div>
     -->
    <!-- No additional members 
    <p v-else>No additional members.</p>
     -->
    <!-- Confirmation -->
    <p v-if="props.requiresConfirmation">
      Confirmation is required for tasks in this group.
    </p>

    <label>
      <input type="checkbox" v-model="localRequires" @change="toggle" />
      Require task confirmation in this group
    </label>
  </div>
</template>

<style scoped>
.group-item {
  border: 1px solid #eee;
  padding: 8px;
  border-radius: 6px;
  margin-bottom: 10px;
}

ul {
  margin: 4px 0;
  padding-left: 16px;
}

li {
  line-height: 1.4;
}
.leave-btn {
  background: #ef7f1a;
  color: white;
  border: none;
  padding: 6px 10px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 8px;
}
.leave-btn:hover {
  background: #d95f00;
}
</style>
