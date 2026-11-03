<script setup>
import { superAdminApi } from '@/api'
import { useFacultyOptions } from '@/composables/useSuperAdminLookups'
import ResourceManager from '@/components/ResourceManager.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import { ACTIVE_FILTER } from '@/utils/forms'

const { options: facultyOptions } = useFacultyOptions()

const columns = [
  { key: 'code', label: 'Code', class: 'whitespace-nowrap font-medium' },
  { key: 'name', label: 'Department' },
  { key: 'faculty.name', label: 'Faculty' },
  { key: 'programs_count', label: 'Programs', align: 'right' },
  { key: 'students_count', label: 'Students', align: 'right' },
  { key: 'lecturers_count', label: 'Lecturers', align: 'right' },
  { key: 'courses_count', label: 'Courses', align: 'right' },
  { key: 'is_active', label: 'Status' },
]

const filters = [
  { key: 'search', type: 'search', placeholder: 'Search departments' },
  { key: 'faculty_id', options: facultyOptions, placeholder: 'All faculties' },
  ACTIVE_FILTER,
]

const fields = (mode) => [
  { key: 'faculty_id', label: 'Faculty', type: 'select', options: facultyOptions, required: true, full: true },
  { key: 'name', label: 'Department name', required: true, placeholder: 'Computer Science' },
  { key: 'code', label: 'Code', required: true, placeholder: 'CSC' },
  { key: 'description', label: 'Description', type: 'textarea', full: true },
  ...(mode === 'edit' ? [{ key: 'is_active', label: 'Active department', type: 'checkbox', full: true }] : []),
]

const toForm = (record) => ({
  faculty_id: record?.faculty_id ?? '',
  name: record?.name ?? '',
  code: record?.code ?? '',
  description: record?.description ?? '',
  is_active: record?.is_active ?? true,
})
</script>

<template>
  <ResourceManager
    title="Departments"
    subtitle="Departments within each faculty."
    entity="Department"
    :resource="superAdminApi.departments"
    :columns="columns"
    :filters="filters"
    :fields="fields"
    :to-form="toForm"
    :delete-message="(row) => `Delete ${row.name}? Departments with students, lecturers or courses cannot be deleted.`"
  >
    <template #cell-is_active="{ value }"><StatusBadge :status="value" /></template>
  </ResourceManager>
</template>
