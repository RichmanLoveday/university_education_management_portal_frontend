<script setup>
defineProps({
  title: { type: String, default: 'Nothing here yet' },
  text: { type: String, default: '' },
})
</script>

<template>
  <div class="px-6 py-12 text-center">
    <p class="font-medium text-slate-700">{{ title }}</p>
    <p v-if="text" class="mt-1 text-sm text-slate-500">{{ text }}</p>
    <div v-if="$slots.default" class="mt-4"><slot /></div>
  </div>
</template>
