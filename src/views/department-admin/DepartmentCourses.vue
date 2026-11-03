<script setup>
import { departmentAdminApi } from '@/api'
import ResourceManager from '@/components/ResourceManager.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import { courseColumns, courseFields, courseFilters, courseToForm } from '@/utils/forms'
</script>

<template>
  <ResourceManager
    title="Courses"
    subtitle="Course codes, titles, units, levels and semester allocation for your department."
    entity="Course"
    :resource="departmentAdminApi.courses"
    :columns="courseColumns"
    :filters="courseFilters()"
    :fields="courseFields"
    :to-form="courseToForm"
    :delete-message="(row) => `Delete ${row.code} — ${row.title}? Courses with registrations cannot be deleted.`"
  >
    <template #cell-is_active="{ value }"><StatusBadge :status="value" /></template>
  </ResourceManager>
</template>
