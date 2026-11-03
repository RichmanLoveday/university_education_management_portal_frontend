<script setup>
import { superAdminApi } from '@/api'
import ResourceManager from '@/components/ResourceManager.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import { ACTIVE_FILTER } from '@/utils/forms'

const columns = [
  { key: 'code', label: 'Code', class: 'whitespace-nowrap font-medium' },
  { key: 'name', label: 'Faculty' },
  { key: 'description', label: 'Description', class: 'max-w-xs truncate' },
  { key: 'departments_count', label: 'Departments', align: 'right' },
  { key: 'is_active', label: 'Status' },
]

const fields = (mode) => [
  { key: 'name', label: 'Faculty name', required: true, placeholder: 'Faculty of Science', full: true },
  { key: 'code', label: 'Code', required: true, placeholder: 'SCI' },
  { key: 'description', label: 'Description', type: 'textarea', full: true },
  ...(mode === 'edit' ? [{ key: 'is_active', label: 'Active faculty', type: 'checkbox', full: true }] : []),
]

const toForm = (record) => ({
  name: record?.name ?? '',
  code: record?.code ?? '',
  description: record?.description ?? '',
  is_active: record?.is_active ?? true,
})
</script>

<template>
  <ResourceManager
    title="Faculties"
    subtitle="Top-level academic units of the university."
    entity="Faculty"
    :resource="superAdminApi.faculties"
    :columns="columns"
    :filters="[{ key: 'search', type: 'search', placeholder: 'Search faculties' }, ACTIVE_FILTER]"
    :fields="fields"
    :to-form="toForm"
    :delete-message="(row) => `Delete ${row.name}? Faculties that still have departments cannot be deleted.`"
  >
    <template #cell-is_active="{ value }"><StatusBadge :status="value" /></template>
  </ResourceManager>
</template>
