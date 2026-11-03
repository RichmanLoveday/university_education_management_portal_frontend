<script setup>
import { departmentAdminApi } from '@/api'
import { useDepartmentPeriods } from '@/composables/useDepartmentPeriods'
import PageHeader from '@/components/ui/PageHeader.vue'
import ReportsPanel from '@/components/ReportsPanel.vue'

const { options: periodOptions } = useDepartmentPeriods()
</script>

<template>
  <div>
    <PageHeader title="Reports" subtitle="Student lists, course registration reports and academic performance summaries for your department." />
    <ReportsPanel :api="departmentAdminApi.reports" :period-options="periodOptions" />
  </div>
</template>
