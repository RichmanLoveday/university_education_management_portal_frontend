<script setup>
defineProps({
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  flush: { type: Boolean, default: false },
})
</script>

<template>
  <section class="card overflow-hidden">
    <header v-if="title || $slots.actions" class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
      <div>
        <h2 class="font-semibold text-slate-900">{{ title }}</h2>
        <p v-if="subtitle" class="text-xs text-slate-500">{{ subtitle }}</p>
      </div>
      <div v-if="$slots.actions" class="no-print flex flex-wrap gap-2"><slot name="actions" /></div>
    </header>
    <div :class="flush ? '' : 'p-5'"><slot /></div>
  </section>
</template>
