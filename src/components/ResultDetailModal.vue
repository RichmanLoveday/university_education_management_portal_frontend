<script setup>
import { ref, watch } from 'vue'
import { errorMessage } from '@/api/client'
import { formatDateTime, formatNumber } from '@/utils/format'
import { ROLE_LABELS } from '@/utils/roles'
import AppModal from './ui/AppModal.vue'
import StatusBadge from './ui/StatusBadge.vue'
import LoadingState from './ui/LoadingState.vue'

const props = defineProps({
  resultId: { type: [Number, null], default: null },
  loader: { type: Function, required: true },
})
const emit = defineEmits(['close'])

const result = ref(null)
const loading = ref(false)
const error = ref('')

const TRACKED_FIELDS = ['ca_score', 'exam_score', 'total_score', 'grade', 'status']

watch(
  () => props.resultId,
  async (id) => {
    result.value = null
    if (!id) return
    loading.value = true
    error.value = ''
    try {
      result.value = await props.loader(id)
    } catch (err) {
      error.value = errorMessage(err)
    } finally {
      loading.value = false
    }
  },
  { immediate: true },
)

function changes(audit) {
  return TRACKED_FIELDS.filter((field) => audit.old_values?.[field] !== audit.new_values?.[field] && audit.new_values?.[field] !== undefined).map(
    (field) => ({
      field: field.replace('_', ' '),
      from: audit.old_values?.[field] ?? '—',
      to: audit.new_values?.[field] ?? '—',
    }),
  )
}
</script>

<template>
  <AppModal :open="Boolean(resultId)" title="Result details & audit trail" size="lg" @close="emit('close')">
    <LoadingState v-if="loading" />
    <p v-else-if="error" class="text-sm text-rose-600">{{ error }}</p>
    <div v-else-if="result" class="space-y-6">
      <dl class="grid gap-4 text-sm sm:grid-cols-2">
        <div>
          <dt class="text-slate-500">Student</dt>
          <dd class="font-medium text-slate-800">
            {{ result.course_registration?.student?.user?.name }}
            <span class="block text-xs font-normal text-slate-500">{{ result.course_registration?.student?.matric_number }}</span>
          </dd>
        </div>
        <div>
          <dt class="text-slate-500">Course</dt>
          <dd class="font-medium text-slate-800">
            {{ result.course_registration?.course?.code }}
            <span class="block text-xs font-normal text-slate-500">{{ result.course_registration?.course?.title }}</span>
          </dd>
        </div>
        <div class="grid grid-cols-4 gap-2 sm:col-span-2">
          <div v-for="item in [
            ['CA', result.ca_score],
            ['Exam', result.exam_score],
            ['Total', result.total_score],
            ['Grade', result.grade],
          ]" :key="item[0]" class="rounded-lg bg-slate-50 p-3 text-center">
            <p class="text-xs text-slate-500">{{ item[0] }}</p>
            <p class="text-lg font-semibold text-slate-900">{{ item[0] === 'Grade' ? (item[1] ?? '—') : formatNumber(item[1], 0) }}</p>
          </div>
        </div>
        <div>
          <dt class="text-slate-500">Status</dt>
          <dd><StatusBadge :status="result.status" /></dd>
        </div>
        <div>
          <dt class="text-slate-500">Submitted</dt>
          <dd class="text-slate-800">{{ formatDateTime(result.submitted_at) }}</dd>
        </div>
        <div v-if="result.approved_at">
          <dt class="text-slate-500">Approved</dt>
          <dd class="text-slate-800">
            {{ formatDateTime(result.approved_at) }}
            <span v-if="result.approved_by?.name" class="block text-xs text-slate-500">by {{ result.approved_by.name }}</span>
          </dd>
        </div>
        <div v-if="result.rejection_reason" class="sm:col-span-2">
          <dt class="text-slate-500">Feedback</dt>
          <dd class="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-rose-700">{{ result.rejection_reason }}</dd>
        </div>
      </dl>

      <div>
        <h3 class="mb-3 text-sm font-semibold text-slate-900">Audit trail</h3>
        <p v-if="!result.audits?.length" class="text-sm text-slate-500">No recorded activity.</p>
        <ol v-else class="relative space-y-4 border-l border-slate-200 pl-5">
          <li v-for="audit in result.audits" :key="audit.id" class="relative">
            <span class="absolute top-1.5 -left-[25px] h-2.5 w-2.5 rounded-full bg-brand-500 ring-4 ring-white" />
            <div class="flex flex-wrap items-center gap-2 text-sm">
              <StatusBadge :status="audit.action" />
              <span class="font-medium text-slate-800">{{ audit.performed_by?.name ?? 'System' }}</span>
              <span v-if="audit.performed_by?.role" class="text-xs text-slate-500">{{ ROLE_LABELS[audit.performed_by.role] }}</span>
              <span v-if="audit.created_at" class="text-xs text-slate-400">· {{ formatDateTime(audit.created_at) }}</span>
            </div>
            <p v-if="audit.comment" class="mt-1 text-sm text-slate-600">“{{ audit.comment }}”</p>
            <ul v-if="changes(audit).length" class="mt-1 space-y-0.5 text-xs text-slate-500">
              <li v-for="change in changes(audit)" :key="change.field">
                <span class="capitalize">{{ change.field }}</span>: {{ change.from }} → <span class="text-slate-700">{{ change.to }}</span>
              </li>
            </ul>
          </li>
        </ol>
      </div>
    </div>
  </AppModal>
</template>
