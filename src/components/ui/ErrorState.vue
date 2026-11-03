<script setup>
import AppIcon from './AppIcon.vue'

defineProps({ message: { type: String, required: true } })
defineEmits(['retry'])
</script>

<template>
  <div class="card flex flex-col items-center gap-3 px-6 py-10 text-center" role="alert">
    <span class="flex h-11 w-11 items-center justify-center rounded-full bg-rose-50 text-rose-600">
      <AppIcon name="alert" />
    </span>
    <p class="max-w-md text-sm text-slate-600">{{ message }}</p>
    <button class="btn btn-secondary btn-sm" @click="$emit('retry')"><AppIcon name="refresh" :size="14" /> Try again</button>
  </div>
</template>
