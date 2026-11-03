<script setup>
import { ref } from 'vue'
import { superAdminApi } from '@/api'
import { useDepartmentOptions, useSemesterOptions, useSessionOptions } from '@/composables/useSuperAdminLookups'
import { RESULT_STATUSES, formatNumber, periodLabel } from '@/utils/format'
import ResourceManager from '@/components/ResourceManager.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import ResultDetailModal from '@/components/ResultDetailModal.vue'

const { options: departmentOptions } = useDepartmentOptions()
const { options: sessionOptions } = useSessionOptions()
const { options: semesterOptions } = useSemesterOptions()
const detailId = ref(null)

const columns = [
  { key: 'course_registration.student.matric_number', label: 'Matric no.', class: 'whitespace-nowrap font-medium' },
  { key: 'course_registration.student.user.name', label: 'Student', class: 'whitespace-nowrap' },
  { key: 'course_registration.course.code', label: 'Course', class: 'whitespace-nowrap' },
  { key: 'lecturer.user.name', label: 'Lecturer', class: 'whitespace-nowrap' },
  {
    key: 'period',
    label: 'Session',
    class: 'whitespace-nowrap',
    format: (_, row) => periodLabel(row.course_registration?.academic_session, row.course_registration?.semester),
  },
  { key: 'total_score', label: 'Total', align: 'right', format: (value) => formatNumber(value, 0) },
  { key: 'grade', label: 'Grade', class: 'text-center font-semibold' },
  { key: 'status', label: 'Status' },
]

const filters = [
  { key: 'status', options: RESULT_STATUSES, placeholder: 'All statuses' },
  { key: 'department_id', options: departmentOptions, placeholder: 'All departments' },
  { key: 'academic_session_id', options: sessionOptions, placeholder: 'All sessions' },
  { key: 'semester_id', options: semesterOptions, placeholder: 'All semesters' },
]
</script>

<template>
  <div>
    <ResourceManager
      title="Results"
      subtitle="Oversee departmental result submissions and approvals."
      entity="Result"
      :resource="{ list: superAdminApi.results }"
      :columns="columns"
      :filters="filters"
      :can-create="false"
      :can-edit="false"
      :can-delete="false"
    >
      <template #cell-status="{ row }">
        <StatusBadge :status="row.status" />
        <span v-if="row.approved_by?.name" class="block text-xs text-slate-500">by {{ row.approved_by.name }}</span>
      </template>
      <template #row-actions="{ row }">
        <button class="btn btn-ghost btn-sm" aria-label="View audit trail" @click="detailId = row.id">
          <AppIcon name="history" :size="16" />
        </button>
      </template>
    </ResourceManager>

    <ResultDetailModal :result-id="detailId" :loader="superAdminApi.result" @close="detailId = null" />
  </div>
</template>
