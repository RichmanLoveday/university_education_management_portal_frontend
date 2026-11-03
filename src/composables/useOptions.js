import { ref } from 'vue'
import { rowsOf } from './usePaginatedList'

const LOOKUP_PAGE_SIZE = 100

// Loads a list endpoint once and maps it to { value, label } pairs for selects
export function useOptions(fetcher, toOption, { immediate = true, params = {} } = {}) {
  const options = ref([])
  const records = ref([])
  const loading = ref(false)

  async function load(extraParams = {}) {
    loading.value = true
    try {
      records.value = rowsOf(await fetcher({ per_page: LOOKUP_PAGE_SIZE, ...params, ...extraParams }))
      options.value = records.value.map(toOption)
    } catch {
      options.value = []
    } finally {
      loading.value = false
    }
  }

  if (immediate) load()

  return { options, records, loading, load }
}
