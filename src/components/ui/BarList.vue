<script setup>
import { computed } from 'vue'

const props = defineProps({
  items: { type: Object, default: () => ({}) },
  labels: { type: Object, default: () => ({}) },
  emptyText: { type: String, default: 'No data available' },
})

const entries = computed(() => Object.entries(props.items ?? {}))
const max = computed(() => Math.max(1, ...entries.value.map(([, count]) => Number(count))))
</script>

<template>
  <ul v-if="entries.length" class="space-y-3">
    <li v-for="[key, count] in entries" :key="key" class="text-sm">
      <div class="mb-1 flex justify-between gap-2">
        <span class="truncate text-slate-600 capitalize">{{ labels[key] ?? key }}</span>
        <span class="font-medium text-slate-800">{{ count }}</span>
      </div>
      <div class="h-2 rounded-full bg-slate-100">
        <div class="h-2 rounded-full bg-brand-500" :style="{ width: `${(Number(count) / max) * 100}%` }" />
      </div>
    </li>
  </ul>
  <p v-else class="py-4 text-center text-sm text-slate-500">{{ emptyText }}</p>
</template>
