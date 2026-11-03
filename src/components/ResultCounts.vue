<script setup>
import { computed } from 'vue'
import StatusBadge from './ui/StatusBadge.vue'

const props = defineProps({
  counts: { type: [Object, Array], default: () => ({}) },
})

// Empty groupings serialise as [] from the API
const entries = computed(() => (Array.isArray(props.counts) ? [] : Object.entries(props.counts ?? {}).filter(([, count]) => count > 0)))
</script>

<template>
  <div class="flex flex-wrap gap-1">
    <span v-if="!entries.length" class="text-xs text-slate-400">No results</span>
    <StatusBadge v-for="[status, count] in entries" :key="status" :status="status" :label="`${count} ${status}`" />
  </div>
</template>
