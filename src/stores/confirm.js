import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useConfirmStore = defineStore('confirm', () => {
  const dialog = ref(null)
  let resolver = null

  // Resolves true when the user confirms, false when they cancel
  function ask({ title = 'Are you sure?', message = '', confirmText = 'Confirm', tone = 'primary' } = {}) {
    resolver?.(false)
    dialog.value = { title, message, confirmText, tone }
    return new Promise((resolve) => {
      resolver = resolve
    })
  }

  function answer(value) {
    resolver?.(value)
    resolver = null
    dialog.value = null
  }

  return { dialog, ask, answer }
})
