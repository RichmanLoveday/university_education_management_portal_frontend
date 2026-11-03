<script setup>
import AppIcon from './ui/AppIcon.vue'

defineProps({
  title: { type: String, required: true },
  generatedAt: { type: String, default: '' },
})

const print = () => window.print()
</script>

<template>
  <div>
    <div class="no-print mb-4 flex flex-wrap items-center justify-between gap-3">
      <slot name="back" />
      <button class="btn btn-primary" @click="print"><AppIcon name="printer" :size="16" /> Print / Save as PDF</button>
    </div>

    <article class="print-area card mx-auto max-w-4xl p-6 sm:p-10">
      <header class="mb-8 flex flex-col items-center gap-2 border-b-2 border-slate-800 pb-6 text-center">
        <span class="flex h-12 w-12 items-center justify-center rounded-full bg-brand-900 text-lg font-bold text-white">U</span>
        <p class="text-lg font-bold tracking-wide text-slate-900 uppercase">University Education Management Portal</p>
        <h1 class="text-base font-semibold tracking-wider text-brand-700 uppercase">{{ title }}</h1>
        <p v-if="generatedAt" class="text-xs text-slate-500">Generated {{ generatedAt }}</p>
      </header>
      <slot />
    </article>
  </div>
</template>
