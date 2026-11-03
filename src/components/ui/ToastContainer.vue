<script setup>
import { useToastStore } from '@/stores/toast'

const toast = useToastStore()

const styles = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  error: 'border-rose-200 bg-rose-50 text-rose-800',
  info: 'border-sky-200 bg-sky-50 text-sky-800',
}
</script>

<template>
  <div
    class="no-print pointer-events-none fixed inset-x-4 top-4 z-[60] flex flex-col items-end gap-2 sm:inset-x-auto sm:right-4 sm:w-96"
    aria-live="polite"
  >
    <TransitionGroup
      enter-from-class="translate-y-[-8px] opacity-0"
      enter-active-class="transition duration-200"
      leave-to-class="opacity-0"
      leave-active-class="transition duration-150"
    >
      <div
        v-for="item in toast.toasts"
        :key="item.id"
        :class="styles[item.type]"
        class="pointer-events-auto flex w-full items-start gap-3 rounded-lg border px-4 py-3 text-sm shadow-md"
        role="status"
      >
        <span class="flex-1">{{ item.text }}</span>
        <button class="text-current opacity-60 hover:opacity-100" aria-label="Dismiss" @click="toast.dismiss(item.id)">
          ✕
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>
