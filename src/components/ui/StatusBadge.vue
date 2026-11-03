<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: { type: [String, Boolean], default: '' },
  label: { type: String, default: '' },
})

const tones = {
  approved: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  active: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  registered: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  current: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  submitted: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  pending: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  draft: 'bg-slate-100 text-slate-600 ring-slate-500/20',
  graduated: 'bg-sky-50 text-sky-700 ring-sky-600/20',
  reopened: 'bg-sky-50 text-sky-700 ring-sky-600/20',
  rejected: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  inactive: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  suspended: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  withdrawn: 'bg-rose-50 text-rose-700 ring-rose-600/20',
}

const key = computed(() => {
  if (typeof props.status === 'boolean') return props.status ? 'active' : 'inactive'
  return String(props.status ?? '').toLowerCase()
})
const text = computed(() => props.label || key.value.replace(/_/g, ' '))
</script>

<template>
  <span
    class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap capitalize ring-1 ring-inset"
    :class="tones[key] ?? 'bg-slate-100 text-slate-600 ring-slate-500/20'"
  >
    {{ text || '—' }}
  </span>
</template>
