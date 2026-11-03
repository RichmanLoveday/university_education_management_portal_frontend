import { ref, shallowRef } from 'vue'
import { errorMessage } from '@/api/client'

export function useAsync(fn, { immediate = true, initial = null } = {}) {
  const data = shallowRef(initial)
  const loading = ref(false)
  const error = ref('')

  async function run(...args) {
    loading.value = true
    error.value = ''
    try {
      data.value = await fn(...args)
      return data.value
    } catch (err) {
      error.value = errorMessage(err)
      return null
    } finally {
      loading.value = false
    }
  }

  if (immediate) run()

  return { data, loading, error, run }
}
