<script setup>
import { superAdminApi } from '@/api'
import { useDepartmentOptions } from '@/composables/useSuperAdminLookups'
import ResourceManager from '@/components/ResourceManager.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import { courseColumns, courseFields, courseFilters, courseToForm } from '@/utils/forms'

const { options: departmentOptions } = useDepartmentOptions()

const columns = [...courseColumns.slice(0, 2), { key: 'department.code', label: 'Dept.' }, ...courseColumns.slice(2)]
const filters = courseFilters([{ key: 'department_id', options: departmentOptions, placeholder: 'All departments' }])
const fields = (mode, form, record) => courseFields(mode, form, record, departmentOptions.value)
</script>

<template>
  <ResourceManager
    title="Courses"
    subtitle="Course catalogue across all departments."
    entity="Course"
    :resource="superAdminApi.courses"
    :columns="columns"
    :filters="filters"
    :fields="fields"
    :to-form="courseToForm"
    :delete-message="(row) => `Delete ${row.code} — ${row.title}? Courses with registrations cannot be deleted.`"
  >
    <template #cell-is_active="{ value }"><StatusBadge :status="value" /></template>
  </ResourceManager>
</template>
