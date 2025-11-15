<script setup lang="ts">
import { computed, watch, onMounted } from 'vue'
import { useLeaderboardStore } from '../../stores/leaderboardStore'
import { useGroupStore } from '../../stores/groupStore'
const groupStore = useGroupStore()
const byTasksWithNames = computed(() =>
  byTasks.value.map((r) => {
    const group = groupStore.groups.find(g => g.groupId === props.groupId)
    const member = group?.members.find((m: { userId: string; name: string }) => m.userId === r.userId)
    return {
      ...r,
      name: member ? member.name : r.userId
    }
  })
)

const byTimeWithNames = computed(() =>
  byTime.value.map((r) => {
    const group = groupStore.groups.find(g => g.groupId === props.groupId)
    const member = group?.members.find((m: { userId: string; name: string }) => m.userId === r.userId)
    return {
      ...r,
      name: member ? member.name : r.userId
    }
  })
)
console.log(byTasksWithNames)
console.log(byTimeWithNames)
const props = defineProps<{
  groupId?: string | null
}>()

const leaderboardStore = useLeaderboardStore()

// ✅ Load leaderboard when component mounts
onMounted(() => {
  if (props.groupId) {
    leaderboardStore.fetchLeaderboard(props.groupId)
  }
})

// ✅ Watch for group changes and reload leaderboard
watch(
  () => props.groupId,
  (newGroupId) => {
    if (newGroupId) {
      leaderboardStore.fetchLeaderboard(newGroupId)
    } else {
      leaderboardStore.reset()
    }
  }
)

// ✅ Use computed values that point to actual store data
const byTasks = computed(() => leaderboardStore.byTasks)
const byTime = computed(() => leaderboardStore.byTime)
</script>

<template>
  <div class="leaderboard">
    <h3>Leaderboard</h3>

    <!-- No group selected -->
    <div v-if="!props.groupId">Select a group to view the leaderboard.</div>

    <!-- Data Loading -->
    <div v-else>
      <div v-if="leaderboardStore.loading">Loading leaderboard...</div>
      <div v-else-if="leaderboardStore.error" class="error">
        {{ leaderboardStore.error }}
      </div>

      <!-- ✅ Render leaderboards -->
      <div v-else>
        <section>
          <h4>🏆 By Tasks</h4>
          <ol>
            <li v-for="r in byTasksWithNames" :key="r.userId">
              {{ r.name }} — {{ r.completedCount }} tasks
            </li>
          </ol>
        </section>

        <section>
          <h4>⏱️ By Time (minutes)</h4>
          <ol>
            <li v-for="r in byTimeWithNames" :key="r.userId">
              {{ r.name }} — {{ r.completedMinutes }} mins
            </li>
          </ol>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.leaderboard {
  padding: 8px;
  border: 1px solid #eee;
  border-radius: 6px;
}
.error {
  color: red;
}
</style>
