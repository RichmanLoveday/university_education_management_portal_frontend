<script setup>
import { superAdminApi } from '@/api'
import { useDepartmentOptions } from '@/composables/useSuperAdminLookups'
import ResourceManager from '@/components/ResourceManager.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import { ACTIVE_FILTER } from '@/utils/forms'

const { options: departmentOptions } = useDepartmentOptions()

const columns = [
  { key: 'staff_id', label: 'Staff ID', class: 'whitespace-nowrap font-medium' },
  { key: 'user.name', label: 'Name', class: 'whitespace-nowrap' },
  { key: 'user.email', label: 'Email' },
  { key: 'department.name', label: 'Department' },
  { key: 'rank', label: 'Rank', class: 'whitespace-nowrap' },
  { key: 'is_active', label: 'Status' },
]

const filters = [
  { key: 'search', type: 'search', placeholder: 'Search name, email or staff ID' },
  { key: 'department_id', options: departmentOptions, placeholder: 'All departments' },
  ACTIVE_FILTER,
]

const fields = (mode) => [
  ...(mode === 'create'
    ? [
        { key: 'name', label: 'Full name', required: true, placeholder: 'Dr. Jane Doe' },
        { key: 'email', label: 'Email address', type: 'email', required: true },
        { key: 'password', label: 'Initial password', type: 'password', required: true, hint: 'At least 8 characters.' },
      ]
    : []),
  { key: 'staff_id', label: 'Staff ID', required: true, placeholder: 'STAFF/CSC/010' },
  { key: 'department_id', label: 'Department', type: 'select', options: departmentOptions, required: true },
  { key: 'title', label: 'Title', placeholder: 'Dr, Mr, Mrs, Prof' },
  { key: 'rank', label: 'Rank', placeholder: 'Lecturer II' },
  ...(mode === 'edit' ? [{ key: 'is_active', label: 'Active lecturer', type: 'checkbox', full: true }] : []),
]

const toForm = (record) => ({
  name: '',
  email: '',
  password: '',
  staff_id: record?.staff_id ?? '',
  department_id: record?.department_id ?? '',
  title: record?.title ?? '',
  rank: record?.rank ?? '',
  is_active: record?.is_active ?? true,
})
</script>

<template>
  <ResourceManager
    title="Lecturers"
    subtitle="Lecturer profiles and their departmental assignments."
    entity="Lecturer"
    :resource="superAdminApi.lecturers"
    :columns="columns"
    :filters="filters"
    :fields="fields"
    :to-form="toForm"
    :delete-message="(row) => `Delete ${row.user?.name}? Lecturers with course allocations may not be removable.`"
  >
    <template #cell-is_active="{ value }"><StatusBadge :status="value" /></template>
  </ResourceManager>
</template>
