<script setup>
import { superAdminApi } from '@/api'
import { useDepartmentOptions } from '@/composables/useSuperAdminLookups'
import ResourceManager from '@/components/ResourceManager.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import { ACTIVE_FILTER, programColumns, programFields, programToForm } from '@/utils/forms'

const { options: departmentOptions } = useDepartmentOptions()

const columns = [...programColumns.slice(0, 2), { key: 'department.name', label: 'Department' }, ...programColumns.slice(2)]

const filters = [
  { key: 'search', type: 'search', placeholder: 'Search programs' },
  { key: 'department_id', options: departmentOptions, placeholder: 'All departments' },
  ACTIVE_FILTER,
]

const fields = (mode, form, record) => programFields(mode, form, record, departmentOptions.value)
</script>

<template>
  <ResourceManager
    title="Programs"
    subtitle="Academic programs offered across all departments."
    entity="Program"
    :resource="superAdminApi.programs"
    :columns="columns"
    :filters="filters"
    :fields="fields"
    :to-form="programToForm"
    :delete-message="(row) => `Delete ${row.name}? Programs with enrolled students cannot be deleted.`"
  >
    <template #cell-is_active="{ value }"><StatusBadge :status="value" /></template>
  </ResourceManager>
</template>
