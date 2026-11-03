import { computed } from 'vue'
import { superAdminApi } from '@/api'
import { useOptions } from './useOptions'
import { periodLabel } from '@/utils/format'

export function useFacultyOptions() {
  return useOptions(superAdminApi.faculties.list, (faculty) => ({ value: faculty.id, label: faculty.name }))
}

export function useDepartmentOptions() {
  return useOptions(superAdminApi.departments.list, (department) => ({
    value: department.id,
    label: department.name,
    facultyId: department.faculty_id,
  }))
}

export function useSessionOptions() {
  return useOptions(superAdminApi.sessions.list, (session) => ({
    value: session.id,
    label: session.is_current ? `${session.name} (current)` : session.name,
    isCurrent: session.is_current,
  }))
}

export function useSemesterOptions() {
  const lookup = useOptions(superAdminApi.semesters.list, (semester) => ({
    value: semester.id,
    label: periodLabel(semester.academic_session, semester),
    sessionId: semester.academic_session_id,
    isCurrent: semester.is_current,
  }))

  // Combined "session:semester" values for report and monitoring filters
  const periods = computed(() =>
    lookup.records.value.map((semester) => ({
      value: `${semester.academic_session_id}:${semester.id}`,
      label: periodLabel(semester.academic_session, semester) + (semester.is_current ? ' (current)' : ''),
    })),
  )

  const forSession = (sessionId) => lookup.options.value.filter((option) => !sessionId || option.sessionId === Number(sessionId))

  return { ...lookup, periods, forSession }
}
