<script setup>
import { useConfirmStore } from '@/stores/confirm'
import AppModal from './AppModal.vue'

const confirm = useConfirmStore()
</script>

<template>
  <AppModal :open="Boolean(confirm.dialog)" :title="confirm.dialog?.title" size="sm" @close="confirm.answer(false)">
    <p class="text-sm text-slate-600">{{ confirm.dialog?.message }}</p>
    <template #footer>
      <button class="btn btn-secondary" @click="confirm.answer(false)">Cancel</button>
      <button class="btn" :class="`btn-${confirm.dialog?.tone}`" @click="confirm.answer(true)">
        {{ confirm.dialog?.confirmText }}
      </button>
    </template>
  </AppModal>
</template>
