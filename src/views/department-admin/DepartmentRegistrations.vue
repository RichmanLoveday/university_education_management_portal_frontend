<script setup>
import { departmentAdminApi } from '@/api'
import { useOptions } from '@/composables/useOptions'
import { splitPeriod, useDepartmentPeriods } from '@/composables/useDepartmentPeriods'
import { ACADEMIC_LEVELS, formatDate, levelLabel, periodLabel } from '@/utils/format'
import ResourceManager from '@/components/ResourceManager.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'

const { options: courseOptions } = useOptions(departmentAdminApi.courses.list, (course) => ({
  value: course.id,
  label: `${course.code} — ${course.title}`,
}))
const { options: periodOptions } = useDepartmentPeriods()

const columns = [
  { key: 'student.matric_number', label: 'Matric no.', class: 'whitespace-nowrap font-medium' },
  { key: 'student.user.name', label: 'Student', class: 'whitespace-nowrap' },
  { key: 'student.academic_level', label: 'Level', format: levelLabel, class: 'whitespace-nowrap' },
  { key: 'course.code', label: 'Course', class: 'whitespace-nowrap' },
  { key: 'course.units', label: 'Units', align: 'right' },
  { key: 'period', label: 'Session', class: 'whitespace-nowrap', format: (_, row) => periodLabel(row.academic_session, row.semester) },
  { key: 'registration_date', label: 'Registered', format: formatDate, class: 'whitespace-nowrap' },
  { key: 'status', label: 'Status' },
]

const filters = [
  { key: 'search', type: 'search', placeholder: 'Search student or matric no.' },
  { key: 'period', options: periodOptions, placeholder: 'All sessions' },
  { key: 'course_id', options: courseOptions, placeholder: 'All courses' },
  { key: 'academic_level', options: ACADEMIC_LEVELS, placeholder: 'All levels' },
]

const resource = {
  list: ({ period, ...params }) => departmentAdminApi.registrations({ ...params, ...(period ? splitPeriod(period) : {}) }),
}
</script>

<template>
  <ResourceManager
    title="Course Registrations"
    subtitle="Courses registered by students in your department."
    entity="Registration"
    :resource="resource"
    :columns="columns"
    :filters="filters"
    :can-create="false"
    :can-edit="false"
    :can-delete="false"
    empty-text="No registrations match the selected filters."
  >
    <template #cell-course.code="{ row }">
      <span class="font-medium">{{ row.course?.code }}</span>
      <span class="block max-w-56 truncate text-xs text-slate-500">{{ row.course?.title }}</span>
    </template>
    <template #cell-status="{ value }"><StatusBadge :status="value" /></template>
  </ResourceManager>
</template>
