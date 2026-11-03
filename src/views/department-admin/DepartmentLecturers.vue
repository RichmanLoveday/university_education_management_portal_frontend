<script setup>
import { departmentAdminApi } from '@/api'
import ResourceManager from '@/components/ResourceManager.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import { ACTIVE_FILTER } from '@/utils/forms'

const columns = [
  { key: 'staff_id', label: 'Staff ID', class: 'whitespace-nowrap font-medium' },
  { key: 'user.name', label: 'Name', class: 'whitespace-nowrap' },
  { key: 'user.email', label: 'Email' },
  { key: 'rank', label: 'Rank', class: 'whitespace-nowrap' },
  { key: 'course_allocations_count', label: 'Allocations', align: 'right' },
  { key: 'is_active', label: 'Status' },
]

const filters = [
  { key: 'search', type: 'search', placeholder: 'Search name, email or staff ID' },
  ACTIVE_FILTER,
]

function fields(mode) {
  return [
    ...(mode === 'create'
      ? [
          { key: 'name', label: 'Full name', required: true, placeholder: 'Dr. Jane Doe' },
          { key: 'email', label: 'Email address', type: 'email', required: true },
          { key: 'password', label: 'Initial password', type: 'password', required: true, hint: 'At least 8 characters.' },
        ]
      : []),
    { key: 'staff_id', label: 'Staff ID', required: true, placeholder: 'STAFF/CSC/010' },
    { key: 'title', label: 'Title', placeholder: 'Dr, Mr, Mrs, Prof' },
    { key: 'rank', label: 'Rank', placeholder: 'Lecturer II' },
    ...(mode === 'edit' ? [{ key: 'is_active', label: 'Active lecturer', type: 'checkbox', full: true }] : []),
  ]
}

const toForm = (record) => ({
  name: '',
  email: '',
  password: '',
  staff_id: record?.staff_id ?? '',
  title: record?.title ?? '',
  rank: record?.rank ?? '',
  is_active: record?.is_active ?? true,
})
</script>

<template>
  <ResourceManager
    title="Lecturers"
    subtitle="Create lecturer profiles for your department."
    entity="Lecturer"
    :resource="departmentAdminApi.lecturers"
    :columns="columns"
    :filters="filters"
    :fields="fields"
    :to-form="toForm"
    :delete-message="(row) => `Remove ${row.user?.name}? Lecturers with course allocations may not be removable.`"
  >
    <template #cell-is_active="{ value }"><StatusBadge :status="value" /></template>
  </ResourceManager>
</template>
