<script setup>
import { superAdminApi } from '@/api'
import { useOptions } from '@/composables/useOptions'
import { useDepartmentOptions, useSessionOptions } from '@/composables/useSuperAdminLookups'
import { ACADEMIC_LEVELS, STUDENT_STATUSES, levelLabel } from '@/utils/format'
import ResourceManager from '@/components/ResourceManager.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'

const { options: departmentOptions } = useDepartmentOptions()
const { options: sessionOptions } = useSessionOptions()
const { options: programOptions } = useOptions(superAdminApi.programs.list, (program) => ({
  value: program.id,
  label: program.name,
  departmentId: program.department_id,
}))

const columns = [
  { key: 'matric_number', label: 'Matric no.', class: 'whitespace-nowrap font-medium' },
  { key: 'user.name', label: 'Name', class: 'whitespace-nowrap' },
  { key: 'user.email', label: 'Email' },
  { key: 'department.code', label: 'Dept.' },
  { key: 'program.name', label: 'Program' },
  { key: 'academic_level', label: 'Level', format: levelLabel, class: 'whitespace-nowrap' },
  { key: 'status', label: 'Status' },
]

const filters = [
  { key: 'search', type: 'search', placeholder: 'Search name, email or matric no.' },
  { key: 'department_id', options: departmentOptions, placeholder: 'All departments' },
  { key: 'academic_level', options: ACADEMIC_LEVELS, placeholder: 'All levels' },
  { key: 'status', options: STUDENT_STATUSES, placeholder: 'All statuses' },
]

const currentYear = new Date().getFullYear()

function fields(mode, form) {
  return [
    ...(mode === 'create'
      ? [
          { key: 'name', label: 'Full name', required: true },
          { key: 'email', label: 'Email address', type: 'email', required: true },
          { key: 'password', label: 'Initial password', type: 'password', required: true, hint: 'At least 8 characters.' },
        ]
      : []),
    { key: 'matric_number', label: 'Matric number', required: true, placeholder: 'CSC/2025/001' },
    { key: 'department_id', label: 'Department', type: 'select', options: departmentOptions, required: true },
    {
      key: 'program_id',
      label: 'Program',
      type: 'select',
      options: programOptions.value.filter((program) => !form.department_id || program.departmentId === form.department_id),
      required: true,
    },
    { key: 'academic_level', label: 'Academic level', type: 'select', options: ACADEMIC_LEVELS, required: true },
    { key: 'entry_year', label: 'Entry year', type: 'number', min: 2000, max: currentYear + 1 },
    { key: 'current_session_id', label: 'Current session', type: 'select', options: sessionOptions },
    ...(mode === 'edit' ? [{ key: 'status', label: 'Status', type: 'select', options: STUDENT_STATUSES, required: true }] : []),
  ]
}

const toForm = (record) => ({
  name: '',
  email: '',
  password: '',
  matric_number: record?.matric_number ?? '',
  department_id: record?.department_id ?? '',
  program_id: record?.program_id ?? '',
  academic_level: record?.academic_level ?? '',
  entry_year: record?.entry_year ?? currentYear,
  current_session_id: record?.current_session_id ?? sessionOptions.value.find((option) => option.isCurrent)?.value ?? '',
  status: record?.status ?? 'active',
})
</script>

<template>
  <ResourceManager
    title="Students"
    subtitle="Student records across the university. Names and emails are managed under Users & Roles."
    entity="Student"
    :resource="superAdminApi.students"
    :columns="columns"
    :filters="filters"
    :fields="fields"
    :to-form="toForm"
    :delete-message="(row) => `Delete ${row.user?.name} (${row.matric_number})? Their login will be disabled.`"
  >
    <template #cell-status="{ value }"><StatusBadge :status="value" /></template>
  </ResourceManager>
</template>
