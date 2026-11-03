<script setup>
import { superAdminApi } from '@/api'
import { useDepartmentOptions } from '@/composables/useSuperAdminLookups'
import { formatDateTime } from '@/utils/format'
import ResourceManager from '@/components/ResourceManager.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'

const { options: departmentOptions } = useDepartmentOptions()

const columns = [
  { key: 'user.name', label: 'Name', class: 'whitespace-nowrap font-medium' },
  { key: 'user.email', label: 'Email' },
  { key: 'department.name', label: 'Department' },
  { key: 'user.last_login_at', label: 'Last sign in', format: formatDateTime, class: 'whitespace-nowrap' },
  { key: 'user.is_active', label: 'Status' },
]

const filters = [
  { key: 'search', type: 'search', placeholder: 'Search name or email' },
  { key: 'department_id', options: departmentOptions, placeholder: 'All departments' },
]

const fields = (mode) => [
  { key: 'name', label: 'Full name', required: true, full: true },
  ...(mode === 'create'
    ? [
        { key: 'email', label: 'Email address', type: 'email', required: true },
        { key: 'password', label: 'Initial password', type: 'password', required: true, hint: 'At least 8 characters.' },
      ]
    : []),
  { key: 'department_id', label: 'Department', type: 'select', options: departmentOptions, required: true, full: true },
  ...(mode === 'edit' ? [{ key: 'is_active', label: 'Account is active', type: 'checkbox', full: true }] : []),
]

const toForm = (record) => ({
  name: record?.user?.name ?? '',
  email: '',
  password: '',
  department_id: record?.department_id ?? '',
  is_active: record?.user?.is_active ?? true,
})
</script>

<template>
  <ResourceManager
    title="Department Admins"
    subtitle="Assign administrators to manage individual departments."
    entity="Department admin"
    :resource="superAdminApi.departmentAdmins"
    :columns="columns"
    :filters="filters"
    :fields="fields"
    :to-form="toForm"
    :delete-message="(row) => `Remove ${row.user?.name} as administrator of ${row.department?.name}? Their account will be removed.`"
  >
    <template #cell-user.is_active="{ value }"><StatusBadge :status="value" /></template>
  </ResourceManager>
</template>
