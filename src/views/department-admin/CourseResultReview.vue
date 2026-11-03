<script setup>
import { computed, ref } from 'vue'
import { departmentAdminApi } from '@/api'
import { errorMessage, validationErrors } from '@/api/client'
import { useAsync } from '@/composables/useAsync'
import { useToastStore } from '@/stores/toast'
import { RESULT_STATUSES, formatNumber, levelLabel, periodLabel } from '@/utils/format'
import PageHeader from '@/components/ui/PageHeader.vue'
import SectionCard from '@/components/ui/SectionCard.vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import FormField from '@/components/ui/FormField.vue'
import AppModal from '@/components/ui/AppModal.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import PerformanceStats from '@/components/PerformanceStats.vue'
import ResultDetailModal from '@/components/ResultDetailModal.vue'

const props = defineProps({ allocationId: { type: String, required: true } })
const toast = useToastStore()

const statusFilter = ref('')
const review = useAsync(() => departmentAdminApi.courseResults(props.allocationId, statusFilter.value ? { status: statusFilter.value } : {}))

const selected = ref([])
const detailId = ref(null)

const allocation = computed(() => review.data.value?.allocation)
const results = computed(() => review.data.value?.results ?? [])
const byStatus = (status) => results.value.filter((result) => result.status === status)
const submitted = computed(() => byStatus('submitted'))
const approved = computed(() => byStatus('approved'))

const selectedOf = (status) => results.value.filter((r) => r.status === status && selected.value.includes(r.id)).map((r) => r.id)

const ACTIONS = {
  approve: {
    title: 'Approve results',
    status: 'submitted',
    field: 'comment',
    label: 'Comment (optional)',
    button: 'Approve',
    tone: 'success',
    call: departmentAdminApi.approve,
    help: 'Approved results become visible to students immediately.',
  },
  reject: {
    title: 'Return results to lecturer',
    status: 'submitted',
    field: 'reason',
    label: 'Feedback for the lecturer',
    button: 'Return for correction',
    tone: 'danger',
    required: true,
    call: departmentAdminApi.reject,
    help: 'The lecturer will see this feedback and can correct and resubmit the results.',
  },
  reopen: {
    title: 'Reopen approved results',
    status: 'approved',
    field: 'reason',
    label: 'Reason for reopening',
    button: 'Reopen for editing',
    tone: 'primary',
    required: true,
    call: departmentAdminApi.reopen,
    help: 'Reopened results are hidden from students until they are resubmitted and approved again.',
  },
}

const action = ref(null)
const note = ref('')
const noteError = ref('')
const processing = ref(false)

const actionConfig = computed(() => (action.value ? ACTIONS[action.value] : null))
const targetIds = computed(() => (actionConfig.value ? selectedOf(actionConfig.value.status) : []))
const targetCount = computed(() => targetIds.value.length || (actionConfig.value?.status === 'approved' ? approved.value.length : submitted.value.length))

function openAction(name) {
  action.value = name
  note.value = ''
  noteError.value = ''
}

async function confirmAction() {
  const config = actionConfig.value
  if (config.required && note.value.trim().length < 5) {
    noteError.value = 'Please provide at least 5 characters.'
    return
  }
  processing.value = true
  try {
    const payload = { [config.field]: note.value.trim() || null }
    // Without result_ids the API acts on every eligible result in the course
    if (targetIds.value.length) payload.result_ids = targetIds.value
    const response = await config.call(props.allocationId, payload)
    toast.success(response.message ?? 'Results updated.')
    action.value = null
    selected.value = []
    review.run()
  } catch (err) {
    const errors = validationErrors(err)
    noteError.value = errors[config.field] ?? ''
    if (!noteError.value) toast.error(errorMessage(err))
  } finally {
    processing.value = false
  }
}

function toggleAll(event) {
  selected.value = event.target.checked ? results.value.filter((r) => ['submitted', 'approved'].includes(r.status)).map((r) => r.id) : []
}

function changeFilter(value) {
  statusFilter.value = value
  selected.value = []
  review.run()
}
</script>

<template>
  <div>
    <LoadingState v-if="review.loading.value && !review.data.value" />
    <ErrorState v-else-if="review.error.value && !review.data.value" :message="review.error.value" @retry="review.run" />

    <template v-else-if="allocation">
      <PageHeader
        :title="`${allocation.course?.code} · ${allocation.course?.title}`"
        :subtitle="`${allocation.lecturer?.user?.name} · ${levelLabel(allocation.course?.level)} · ${periodLabel(allocation.academic_session, allocation.semester)} · ${review.data.value.registered_students} registered`"
      >
        <template #breadcrumb>
          <RouterLink :to="{ name: 'department-admin.results' }" class="mb-1 inline-block text-sm text-brand-600 hover:underline">← Result approval</RouterLink>
        </template>
        <template #actions>
          <button class="btn btn-success" :disabled="!submitted.length" @click="openAction('approve')">
            <AppIcon name="check" :size="16" /> Approve
          </button>
          <button class="btn btn-danger" :disabled="!submitted.length" @click="openAction('reject')">Return</button>
          <button class="btn btn-secondary" :disabled="!approved.length" @click="openAction('reopen')">Reopen</button>
        </template>
      </PageHeader>

      <div class="space-y-6">
        <SectionCard title="Course performance">
          <PerformanceStats :statistics="review.data.value.statistics" />
        </SectionCard>

        <SectionCard title="Results" :subtitle="selected.length ? `${selected.length} selected — actions apply to the selection` : 'Select results to act on specific students, or act on the whole course.'" flush>
          <template #actions>
            <FormField :model-value="statusFilter" type="select" :options="RESULT_STATUSES" placeholder="All statuses" class="w-44" @update:model-value="changeFilter" />
          </template>
          <EmptyState v-if="!results.length" title="No results" text="No results match this filter." />
          <div v-else class="overflow-x-auto">
            <table class="table-base">
              <thead>
                <tr>
                  <th class="w-10">
                    <input type="checkbox" class="h-4 w-4 rounded border-slate-300" aria-label="Select all" @change="toggleAll" />
                  </th>
                  <th>Matric no.</th>
                  <th>Student</th>
                  <th class="text-right">CA</th>
                  <th class="text-right">Exam</th>
                  <th class="text-right">Total</th>
                  <th class="text-center">Grade</th>
                  <th>Status</th>
                  <th><span class="sr-only">Details</span></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="result in results" :key="result.id">
                  <td>
                    <input
                      v-model="selected"
                      type="checkbox"
                      class="h-4 w-4 rounded border-slate-300"
                      :value="result.id"
                      :disabled="!['submitted', 'approved'].includes(result.status)"
                      :aria-label="`Select result for ${result.course_registration?.student?.matric_number}`"
                    />
                  </td>
                  <td class="font-medium whitespace-nowrap">{{ result.course_registration?.student?.matric_number }}</td>
                  <td class="whitespace-nowrap">{{ result.course_registration?.student?.user?.name }}</td>
                  <td class="text-right">{{ formatNumber(result.ca_score, 0) }}</td>
                  <td class="text-right">{{ formatNumber(result.exam_score, 0) }}</td>
                  <td class="text-right font-medium">{{ formatNumber(result.total_score, 0) }}</td>
                  <td class="text-center font-semibold">{{ result.grade ?? '—' }}</td>
                  <td>
                    <StatusBadge :status="result.status" />
                    <p v-if="result.rejection_reason" class="mt-1 max-w-48 truncate text-xs text-rose-600" :title="result.rejection_reason">
                      {{ result.rejection_reason }}
                    </p>
                  </td>
                  <td class="text-right">
                    <button class="btn btn-ghost btn-sm" :aria-label="`View audit trail`" @click="detailId = result.id">
                      <AppIcon name="history" :size="16" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>
    </template>

    <AppModal :open="Boolean(action)" :title="actionConfig?.title" @close="action = null">
      <div v-if="actionConfig" class="space-y-4">
        <p class="text-sm text-slate-600">
          This will apply to <strong>{{ targetCount }}</strong> {{ actionConfig.status }} result(s)
          {{ targetIds.length ? 'you selected' : 'in this course' }}. {{ actionConfig.help }}
        </p>
        <FormField v-model="note" type="textarea" :label="actionConfig.label" :required="actionConfig.required" :error="noteError" />
      </div>
      <template #footer>
        <button class="btn btn-secondary" @click="action = null">Cancel</button>
        <button class="btn" :class="`btn-${actionConfig?.tone}`" :disabled="processing || !targetCount" @click="confirmAction">
          {{ processing ? 'Processing…' : actionConfig?.button }}
        </button>
      </template>
    </AppModal>

    <ResultDetailModal :result-id="detailId" :loader="departmentAdminApi.result" @close="detailId = null" />
  </div>
</template>
