<script setup>
import { superAdminApi } from '@/api'
import { useDepartmentOptions, useSemesterOptions, useSessionOptions } from '@/composables/useSuperAdminLookups'
import { formatDate, levelLabel, periodLabel } from '@/utils/format'
import ResourceManager from '@/components/ResourceManager.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'

const { options: departmentOptions } = useDepartmentOptions()
const { options: sessionOptions } = useSessionOptions()
const { options: semesterOptions } = useSemesterOptions()

const columns = [
  { key: 'student.matric_number', label: 'Matric no.', class: 'whitespace-nowrap font-medium' },
  { key: 'student.user.name', label: 'Student', class: 'whitespace-nowrap' },
  { key: 'student.department.code', label: 'Dept.' },
  { key: 'student.academic_level', label: 'Level', format: levelLabel, class: 'whitespace-nowrap' },
  { key: 'course.code', label: 'Course', class: 'whitespace-nowrap' },
  { key: 'period', label: 'Session', class: 'whitespace-nowrap', format: (_, row) => periodLabel(row.academic_session, row.semester) },
  { key: 'registration_date', label: 'Registered', format: formatDate, class: 'whitespace-nowrap' },
  { key: 'status', label: 'Status' },
]

const filters = [
  { key: 'department_id', options: departmentOptions, placeholder: 'All departments' },
  { key: 'academic_session_id', options: sessionOptions, placeholder: 'All sessions' },
  { key: 'semester_id', options: semesterOptions, placeholder: 'All semesters' },
]
</script>

<template>
  <ResourceManager
    title="Course Registrations"
    subtitle="Monitor course registrations across the university."
    entity="Registration"
    :resource="{ list: superAdminApi.registrations }"
    :columns="columns"
    :filters="filters"
    :can-create="false"
    :can-edit="false"
    :can-delete="false"
  >
    <template #cell-course.code="{ row }">
      <span class="font-medium">{{ row.course?.code }}</span>
      <span class="block max-w-56 truncate text-xs text-slate-500">{{ row.course?.title }}</span>
    </template>
    <template #cell-status="{ value }"><StatusBadge :status="value" /></template>
  </ResourceManager>
</template>
