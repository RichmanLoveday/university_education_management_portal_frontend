<script setup>
import { computed } from 'vue'
import { departmentAdminApi } from '@/api'
import { useOptions } from '@/composables/useOptions'
import { splitPeriod, useDepartmentPeriods } from '@/composables/useDepartmentPeriods'
import { periodLabel } from '@/utils/format'
import ResourceManager from '@/components/ResourceManager.vue'

const { options: courseOptions } = useOptions(departmentAdminApi.courses.list, (course) => ({
  value: course.id,
  label: `${course.code} — ${course.title}`,
}))
const { options: lecturerOptions } = useOptions(
  departmentAdminApi.lecturers.list,
  (lecturer) => ({ value: lecturer.id, label: `${lecturer.user?.name} (${lecturer.staff_id})` }),
  { params: { is_active: 1 } },
)
const { options: periodOptions, current } = useDepartmentPeriods()

const columns = [
  { key: 'course.code', label: 'Course', class: 'whitespace-nowrap font-medium' },
  { key: 'course.title', label: 'Title', class: 'min-w-56' },
  { key: 'lecturer.user.name', label: 'Lecturer', class: 'whitespace-nowrap' },
  { key: 'period', label: 'Session', class: 'whitespace-nowrap', format: (_, row) => periodLabel(row.academic_session, row.semester) },
]

const filters = computed(() => [
  { key: 'search', type: 'search', placeholder: 'Search course code or title' },
  { key: 'lecturer_id', options: lecturerOptions, placeholder: 'All lecturers' },
  { key: 'period', options: periodOptions, placeholder: 'All sessions' },
])

function fields(mode) {
  if (mode === 'edit') return [{ key: 'lecturer_id', label: 'Lecturer', type: 'select', options: lecturerOptions, required: true, full: true }]
  return [
    { key: 'course_id', label: 'Course', type: 'select', options: courseOptions, required: true, full: true },
    { key: 'lecturer_id', label: 'Lecturer', type: 'select', options: lecturerOptions, required: true, full: true },
    { key: 'period', label: 'Session & semester', type: 'select', options: periodOptions, required: true, full: true },
  ]
}

const toForm = (record) => ({
  course_id: record?.course_id ?? '',
  lecturer_id: record?.lecturer_id ?? '',
  period: current.value?.value ?? '',
})

function toPayload(form, mode) {
  if (mode === 'edit') return { lecturer_id: form.lecturer_id }
  return { course_id: form.course_id, lecturer_id: form.lecturer_id, ...splitPeriod(form.period) }
}

// The list endpoint filters by session and semester ids, not the combined select value
function listAllocations(params) {
  const { period, ...rest } = params
  return departmentAdminApi.allocations.list({ ...rest, ...(period ? splitPeriod(period) : {}) })
}
const resource = { ...departmentAdminApi.allocations, list: listAllocations }
</script>

<template>
  <ResourceManager
    title="Course Allocations"
    subtitle="Assign lecturers to department courses for a session and semester."
    entity="Allocation"
    :resource="resource"
    :columns="columns"
    :filters="filters"
    :fields="fields"
    :to-form="toForm"
    :to-payload="toPayload"
    :delete-message="(row) => `Remove ${row.lecturer?.user?.name} from ${row.course?.code} for ${periodLabel(row.academic_session, row.semester)}?`"
  />
</template>
