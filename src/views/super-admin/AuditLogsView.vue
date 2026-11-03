<script setup>
import { ref } from 'vue'
import { superAdminApi } from '@/api'
import { formatDateTime } from '@/utils/format'
import { ROLE_LABELS } from '@/utils/roles'
import ResourceManager from '@/components/ResourceManager.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import ResultDetailModal from '@/components/ResultDetailModal.vue'

const detailId = ref(null)

const actionOptions = ['created', 'updated', 'submitted', 'approved', 'rejected', 'reopened'].map((value) => ({
  value,
  label: value[0].toUpperCase() + value.slice(1),
}))

const columns = [
  { key: 'created_at', label: 'When', format: formatDateTime, class: 'whitespace-nowrap' },
  { key: 'action', label: 'Action' },
  { key: 'performed_by.name', label: 'Performed by', class: 'whitespace-nowrap' },
  { key: 'result.course_registration.course.code', label: 'Course', class: 'whitespace-nowrap' },
  { key: 'result.course_registration.student.matric_number', label: 'Student', class: 'whitespace-nowrap' },
  { key: 'comment', label: 'Comment', class: 'max-w-xs truncate' },
]

const filters = [
  { key: 'action', options: actionOptions, placeholder: 'All actions' },
  { key: 'from', type: 'date', placeholder: 'From' },
  { key: 'to', type: 'date', placeholder: 'To' },
]
</script>

<template>
  <div>
    <ResourceManager
      title="Audit Logs"
      subtitle="Every result creation, modification, submission, approval, rejection and reopening is recorded here."
      entity="Log"
      :resource="{ list: superAdminApi.auditLogs }"
      :columns="columns"
      :filters="filters"
      :can-create="false"
      :can-edit="false"
      :can-delete="false"
    >
      <template #cell-action="{ value }"><StatusBadge :status="value" /></template>
      <template #cell-performed_by.name="{ row }">
        {{ row.performed_by?.name ?? 'System' }}
        <span v-if="row.performed_by?.role" class="block text-xs text-slate-500">{{ ROLE_LABELS[row.performed_by.role] }}</span>
      </template>
      <template #row-actions="{ row }">
        <button class="btn btn-ghost btn-sm" aria-label="View result audit trail" @click="detailId = row.result_id">
          <AppIcon name="eye" :size="16" />
        </button>
      </template>
    </ResourceManager>

    <ResultDetailModal :result-id="detailId" :loader="superAdminApi.result" @close="detailId = null" />
  </div>
</template>
