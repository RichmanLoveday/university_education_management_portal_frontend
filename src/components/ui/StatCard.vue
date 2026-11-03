<script setup>
import AppIcon from './AppIcon.vue'

defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], default: '—' },
  hint: { type: String, default: '' },
  icon: { type: String, default: '' },
  tone: { type: String, default: 'brand' },
})

const tones = {
  brand: 'bg-brand-50 text-brand-600',
  green: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
  rose: 'bg-rose-50 text-rose-600',
  sky: 'bg-sky-50 text-sky-600',
}
</script>

<template>
  <div class="card flex items-start gap-4 p-5">
    <span v-if="icon" class="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg" :class="tones[tone]">
      <AppIcon :name="icon" />
    </span>
    <div class="min-w-0">
      <p class="text-sm text-slate-500">{{ label }}</p>
      <p class="mt-1 truncate text-2xl font-bold text-slate-900">{{ value ?? '—' }}</p>
      <p v-if="hint" class="mt-0.5 truncate text-xs text-slate-500">{{ hint }}</p>
    </div>
  </div>
</template>
