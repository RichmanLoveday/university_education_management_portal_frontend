<script setup>
defineProps({ text: { type: String, default: 'Loading…' } })
</script>

<template>
  <div class="flex items-center justify-center gap-3 py-12 text-sm text-slate-500" role="status">
    <span class="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-brand-600" />
    {{ text }}
  </div>
</template>
