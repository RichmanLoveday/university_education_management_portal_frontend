import { computed, ref } from 'vue'
import { departmentAdminApi } from '@/api'
import { rowsOf } from './usePaginatedList'
import { periodLabel } from '@/utils/format'

// Department admins have no session endpoint, so periods are collected from
// the dashboard's current period and the department's existing allocations.
export function useDepartmentPeriods() {
  const periods = ref([])
  const current = ref(null)

  async function load() {
    const [dashboard, allocations] = await Promise.all([
      departmentAdminApi.dashboard().catch(() => null),
      departmentAdminApi.allocations.list({ per_page: 100 }).catch(() => []),
    ])

    const found = new Map()
    const add = (session, semester) => {
      if (!session?.id || !semester?.id) return
      const value = `${session.id}:${semester.id}`
      if (!found.has(value)) found.set(value, { value, label: periodLabel(session, semester), sessionId: session.id, semesterId: semester.id })
    }

    const period = dashboard?.current_period
    add(period?.academic_session, period?.semester)
    current.value = found.values().next().value ?? null
    rowsOf(allocations).forEach((allocation) => add(allocation.academic_session, allocation.semester))
    periods.value = [...found.values()].sort((a, b) => b.label.localeCompare(a.label))
  }

  const options = computed(() =>
    periods.value.map((period) => ({ value: period.value, label: period.value === current.value?.value ? `${period.label} (current)` : period.label })),
  )

  load()

  return { periods, options, current, reload: load }
}

export function splitPeriod(value) {
  const [academic_session_id = '', semester_id = ''] = String(value ?? '').split(':')
  return { academic_session_id: academic_session_id ? Number(academic_session_id) : '', semester_id: semester_id ? Number(semester_id) : '' }
}
