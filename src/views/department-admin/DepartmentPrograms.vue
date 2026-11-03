<script setup>
import { departmentAdminApi } from '@/api'
import ResourceManager from '@/components/ResourceManager.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import { programColumns, programFields, programToForm } from '@/utils/forms'
</script>

<template>
  <ResourceManager
    title="Programs"
    subtitle="Academic programs offered by your department."
    entity="Program"
    :resource="departmentAdminApi.programs"
    :columns="programColumns"
    :filters="[{ key: 'search', type: 'search', placeholder: 'Search programs' }]"
    :fields="programFields"
    :to-form="programToForm"
    :delete-message="(row) => `Delete ${row.name}? Programs with enrolled students cannot be deleted.`"
  >
    <template #cell-is_active="{ value }"><StatusBadge :status="value" /></template>
  </ResourceManager>
</template>
