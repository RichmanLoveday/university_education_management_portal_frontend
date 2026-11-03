<script setup>
import { computed } from 'vue'
import AppIcon from './AppIcon.vue'

const props = defineProps({
  meta: { type: Object, default: null },
})
const emit = defineEmits(['change'])

const pages = computed(() => {
  if (!props.meta) return []
  const { current_page: current, last_page: last } = props.meta
  const start = Math.max(1, Math.min(current - 2, last - 4))
  return Array.from({ length: Math.min(5, last) }, (_, index) => start + index)
})

function go(page) {
  if (page >= 1 && page <= props.meta.last_page && page !== props.meta.current_page) emit('change', page)
}
</script>

<template>
  <div
    v-if="meta && meta.total > 0"
    class="flex flex-col items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 text-sm sm:flex-row"
  >
    <p class="text-slate-500">
      Showing <span class="font-medium text-slate-700">{{ meta.from }}</span>–<span class="font-medium text-slate-700">{{ meta.to }}</span>
      of <span class="font-medium text-slate-700">{{ meta.total }}</span>
    </p>
    <nav v-if="meta.last_page > 1" class="flex items-center gap-1" aria-label="Pagination">
      <button class="btn btn-ghost btn-sm" :disabled="meta.current_page === 1" aria-label="Previous page" @click="go(meta.current_page - 1)">
        <AppIcon name="chevronLeft" :size="16" />
      </button>
      <button
        v-for="page in pages"
        :key="page"
        class="btn btn-sm min-w-8"
        :class="page === meta.current_page ? 'btn-primary' : 'btn-ghost'"
        @click="go(page)"
      >
        {{ page }}
      </button>
      <button
        class="btn btn-ghost btn-sm"
        :disabled="meta.current_page === meta.last_page"
        aria-label="Next page"
        @click="go(meta.current_page + 1)"
      >
        <AppIcon name="chevronRight" :size="16" />
      </button>
    </nav>
  </div>
</template>
