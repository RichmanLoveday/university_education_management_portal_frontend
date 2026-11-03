<script setup>
import { departmentAdminApi } from '@/api'
import { useOptions } from '@/composables/useOptions'
import { useDepartmentPeriods } from '@/composables/useDepartmentPeriods'
import { ACADEMIC_LEVELS, STUDENT_STATUSES, levelLabel } from '@/utils/format'
import ResourceManager from '@/components/ResourceManager.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'

const { options: programOptions } = useOptions(departmentAdminApi.programs.list, (program) => ({
  value: program.id,
  label: program.name,
}))
const { current } = useDepartmentPeriods()

const columns = [
  { key: 'matric_number', label: 'Matric no.', class: 'whitespace-nowrap font-medium' },
  { key: 'user.name', label: 'Name', class: 'whitespace-nowrap' },
  { key: 'user.email', label: 'Email' },
  { key: 'program.name', label: 'Program' },
  { key: 'academic_level', label: 'Level', format: levelLabel, class: 'whitespace-nowrap' },
  { key: 'status', label: 'Status' },
]

const filters = [
  { key: 'search', type: 'search', placeholder: 'Search name, email or matric no.' },
  { key: 'program_id', options: programOptions, placeholder: 'All programs' },
  { key: 'academic_level', options: ACADEMIC_LEVELS, placeholder: 'All levels' },
  { key: 'status', options: STUDENT_STATUSES, placeholder: 'All statuses' },
]

const currentYear = new Date().getFullYear()

function fields(mode) {
  const account =
    mode === 'create'
      ? [
          { key: 'name', label: 'Full name', required: true },
          { key: 'email', label: 'Email address', type: 'email', required: true },
          { key: 'password', label: 'Initial password', type: 'password', required: true, hint: 'At least 8 characters.' },
        ]
      : []
  return [
    ...account,
    { key: 'matric_number', label: 'Matric number', required: true, placeholder: 'CSC/2025/001' },
    { key: 'program_id', label: 'Program', type: 'select', options: programOptions, required: true },
    { key: 'academic_level', label: 'Academic level', type: 'select', options: ACADEMIC_LEVELS, required: true },
    { key: 'entry_year', label: 'Entry year', type: 'number', min: 2000, max: currentYear + 1 },
    ...(mode === 'edit' ? [{ key: 'status', label: 'Status', type: 'select', options: STUDENT_STATUSES, required: true }] : []),
  ]
}

function toForm(record) {
  return {
    name: '',
    email: '',
    password: '',
    matric_number: record?.matric_number ?? '',
    program_id: record?.program_id ?? '',
    academic_level: record?.academic_level ?? '',
    entry_year: record?.entry_year ?? currentYear,
    status: record?.status ?? 'active',
  }
}

function toPayload(form, mode) {
  const payload = {
    matric_number: form.matric_number.trim(),
    program_id: form.program_id || null,
    academic_level: form.academic_level || null,
    entry_year: form.entry_year || null,
  }
  if (mode === 'edit') return { ...payload, status: form.status }
  return {
    ...payload,
    name: form.name.trim(),
    email: form.email.trim(),
    password: form.password,
    current_session_id: current.value?.sessionId ?? null,
  }
}
</script>

<template>
  <ResourceManager
    title="Students"
    subtitle="Register and manage students in your department."
    entity="Student"
    :resource="departmentAdminApi.students"
    :columns="columns"
    :filters="filters"
    :fields="fields"
    :to-form="toForm"
    :to-payload="toPayload"
    :delete-message="(row) => `Remove ${row.user?.name} (${row.matric_number}) from the department? Their login will be disabled.`"
  >
    <template #cell-status="{ value }"><StatusBadge :status="value" /></template>
  </ResourceManager>
</template>
