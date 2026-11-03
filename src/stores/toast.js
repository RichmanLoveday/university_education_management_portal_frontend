import { defineStore } from 'pinia'
import { ref } from 'vue'

let nextId = 1

export const useToastStore = defineStore('toast', () => {
  const toasts = ref([])

  function push(type, text, timeout = 4500) {
    const id = nextId++
    toasts.value.push({ id, type, text })
    setTimeout(() => dismiss(id), timeout)
  }

  function dismiss(id) {
    toasts.value = toasts.value.filter((toast) => toast.id !== id)
  }

  return {
    toasts,
    dismiss,
    success: (text) => push('success', text),
    error: (text) => push('error', text, 6500),
    info: (text) => push('info', text),
  }
})
