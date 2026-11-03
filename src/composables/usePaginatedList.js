import { reactive, ref, shallowRef, watch } from 'vue'
import { errorMessage } from '@/api/client'

// Laravel endpoints return either a paginator ({ data, current_page, ... }) or a plain array
export function rowsOf(payload) {
  if (Array.isArray(payload)) return payload
  return payload?.data ?? []
}

function cleanParams(params) {
  return Object.fromEntries(Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined))
}

export function usePaginatedList(fetcher, initialFilters = {}, { perPage = 15, immediate = true } = {}) {
  const rows = shallowRef([])
  const meta = ref(null)
  const loading = ref(false)
  const error = ref('')
  const page = ref(1)
  const filters = reactive({ ...initialFilters })

  let requestId = 0
  async function load() {
    const current = ++requestId
    loading.value = true
    error.value = ''
    try {
      const payload = await fetcher(cleanParams({ ...filters, page: page.value, per_page: perPage }))
      // Ignore responses from requests superseded by newer filter changes
      if (current !== requestId) return
      rows.value = rowsOf(payload)
      meta.value = Array.isArray(payload) ? null : payload
    } catch (err) {
      if (current === requestId) error.value = errorMessage(err)
    } finally {
      if (current === requestId) loading.value = false
    }
  }

  function setPage(value) {
    page.value = value
    load()
  }

  let debounce
  watch(
    () => ({ ...filters }),
    (next, previous) => {
      clearTimeout(debounce)
      const delay = next.search !== previous.search ? 350 : 0
      debounce = setTimeout(() => {
        page.value = 1
        load()
      }, delay)
    },
  )

  if (immediate) load()

  return { rows, meta, loading, error, page, filters, load, setPage }
}
