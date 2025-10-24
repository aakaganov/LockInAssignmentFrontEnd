<script setup lang="ts">
import { computed, watch, onMounted } from 'vue'
import { useLeaderboardStore } from "../../stores/leaderboardStore";


const props = defineProps<{
  groupId?: string | null
}>()

const leaderboardStore = useLeaderboardStore()

// Load leaderboard when mounted if groupId exists
onMounted(() => {
  if (props.groupId) {
    leaderboardStore.fetchLeaderboard(props.groupId)
  }
})

// React if groupId changes (ex. switching groups)
watch(() => props.groupId, (newGroupId) => {
  if (newGroupId) {
    leaderboardStore.fetchLeaderboard(newGroupId)
  }
})

// Use computed values from store
const byTasks = computed(() => leaderboardStore.leaderboardTasks)
const byTime = computed(() => leaderboardStore.leaderboardTime)
</script>

<template>
  <div class="leaderboard">
    <h3>Leaderboard</h3>
    <div v-if="!props.groupId">Select a group to view the leaderboard.</div>

    <div v-else>
      <div v-if="leaderboardStore.loading">Loading leaderboard...</div>
      <div v-else-if="leaderboardStore.error" class="error">{{ leaderboardStore.error }}</div>
      <div v-else>
        <section>
          <h4>🏆 By Tasks</h4>
          <ol>
            <li v-for="r in byTasks" :key="r.userId">
              {{ r.userId }} — {{ r.completedCount }} tasks
            </li>
          </ol>
        </section>

        <section>
          <h4>⏱️ By Time (hours)</h4>
          <ol>
            <li v-for="r in byTime" :key="r.userId">
              {{ r.userId }} — {{ r.completedHours.toFixed(1) }} hrs
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
