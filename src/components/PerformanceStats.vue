<script setup>
import { formatNumber } from '@/utils/format'
import BarList from './ui/BarList.vue'

defineProps({
  statistics: { type: Object, default: null },
})
</script>

<template>
  <p v-if="!statistics?.total_results" class="py-6 text-center text-sm text-slate-500">No results recorded yet.</p>
  <div v-else class="grid gap-6 lg:grid-cols-3">
    <dl class="grid grid-cols-2 gap-3 lg:col-span-2">
      <div v-for="item in [
        ['Results', statistics.total_results],
        ['Average score', formatNumber(statistics.average_score, 1)],
        ['Highest score', formatNumber(statistics.highest_score, 0)],
        ['Lowest score', formatNumber(statistics.lowest_score, 0)],
        ['Passed', statistics.pass_count],
        ['Failed', statistics.fail_count],
      ]" :key="item[0]" class="rounded-lg bg-slate-50 p-3">
        <dt class="text-xs text-slate-500">{{ item[0] }}</dt>
        <dd class="text-lg font-semibold text-slate-900">{{ item[1] }}</dd>
      </div>
      <div class="col-span-2 rounded-lg bg-brand-50 p-3">
        <dt class="text-xs text-brand-700">Pass rate</dt>
        <dd class="flex items-center gap-3">
          <span class="text-lg font-semibold text-brand-900">{{ formatNumber(statistics.pass_rate, 1) }}%</span>
          <span class="h-2 flex-1 rounded-full bg-white">
            <span class="block h-2 rounded-full bg-brand-500" :style="{ width: `${statistics.pass_rate}%` }" />
          </span>
        </dd>
      </div>
    </dl>
    <div>
      <h3 class="mb-3 text-sm font-semibold text-slate-800">Grade distribution</h3>
      <BarList :items="statistics.grade_distribution" />
    </div>
  </div>
</template>
