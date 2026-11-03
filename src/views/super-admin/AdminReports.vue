<script setup>
import { superAdminApi } from '@/api'
import { useDepartmentOptions, useSemesterOptions } from '@/composables/useSuperAdminLookups'
import PageHeader from '@/components/ui/PageHeader.vue'
import ReportsPanel from '@/components/ReportsPanel.vue'

const { options: departmentOptions } = useDepartmentOptions()
const { periods } = useSemesterOptions()
</script>

<template>
  <div>
    <PageHeader title="Reports" subtitle="University-wide student, registration and academic performance reports." />
    <ReportsPanel :api="superAdminApi.reports" :period-options="periods" :department-options="departmentOptions" />
  </div>
</template>
