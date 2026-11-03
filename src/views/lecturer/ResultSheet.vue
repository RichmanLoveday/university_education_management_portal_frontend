<script setup>
import { computed, ref, watch } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import { lecturerApi } from '@/api'
import { errorMessage } from '@/api/client'
import { useAsync } from '@/composables/useAsync'
import { useToastStore } from '@/stores/toast'
import { useConfirmStore } from '@/stores/confirm'
import { formatNumber } from '@/utils/format'
import SectionCard from '@/components/ui/SectionCard.vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import ResultDetailModal from '@/components/ResultDetailModal.vue'

const props = defineProps({ allocationId: { type: String, required: true } })
const emit = defineEmits(['saved'])

const toast = useToastStore()
const confirm = useConfirmStore()
const sheet = useAsync(() => lecturerApi.resultSheet(props.allocationId))

const rows = ref([])
const saving = ref(false)
const submitting = ref(false)
const historyId = ref(null)

const toInput = (value) => (value === null || value === undefined ? '' : Number(value))

watch(sheet.data, (data) => {
  rows.value = (data?.results ?? []).map((row) => ({
    ...row,
    ca: toInput(row.result?.ca_score),
    exam: toInput(row.result?.exam_score),
  }))
})

const limits = computed(() => sheet.data.value?.score_limits ?? { max_ca_score: 30, max_exam_score: 70 })

function isDirty(row) {
  return row.is_editable && (row.ca !== toInput(row.result?.ca_score) || row.exam !== toInput(row.result?.exam_score))
}

function scoreError(value, max) {
  if (value === '') return ''
  if (!Number.isFinite(value) || value < 0) return 'Invalid'
  if (value > max) return `Max ${max}`
  return ''
}

const rowErrors = (row) => ({
  ca: scoreError(row.ca, limits.value.max_ca_score),
  exam: scoreError(row.exam, limits.value.max_exam_score),
})

const total = (row) => (row.ca === '' && row.exam === '' ? null : (Number(row.ca) || 0) + (Number(row.exam) || 0))

const dirtyRows = computed(() => rows.value.filter(isDirty))
const hasErrors = computed(() => rows.value.some((row) => row.is_editable && Object.values(rowErrors(row)).some(Boolean)))
const draftCount = computed(() => rows.value.filter((row) => row.is_editable && row.result && ['draft', 'rejected'].includes(row.result.status)).length)
const editableCount = computed(() => rows.value.filter((row) => row.is_editable).length)
const rejectedRows = computed(() => rows.value.filter((row) => row.result?.status === 'rejected' && row.result?.rejection_reason))

async function save() {
  if (!dirtyRows.value.length || hasErrors.value) return
  saving.value = true
  try {
    const payload = dirtyRows.value.map((row) => ({
      course_registration_id: row.course_registration_id,
      ca_score: row.ca === '' ? null : row.ca,
      exam_score: row.exam === '' ? null : row.exam,
    }))
    const response = await lecturerApi.saveResults(props.allocationId, payload)
    toast.success(response.message ?? 'Results saved as draft.')
    await sheet.run()
    emit('saved')
  } catch (err) {
    toast.error(errorMessage(err))
  } finally {
    saving.value = false
  }
}

async function submit() {
  const ok = await confirm.ask({
    title: 'Submit results for approval?',
    message: `${draftCount.value} result(s) will be sent to your department for review. Submitted results cannot be edited unless the department returns or reopens them.`,
    confirmText: 'Submit for approval',
  })
  if (!ok) return
  submitting.value = true
  try {
    const response = await lecturerApi.submitResults(props.allocationId)
    toast.success(response.message ?? 'Results submitted for approval.')
    await sheet.run()
    emit('saved')
  } catch (err) {
    toast.error(errorMessage(err))
  } finally {
    submitting.value = false
  }
}

onBeforeRouteLeave(async () => {
  if (!dirtyRows.value.length) return true
  return confirm.ask({
    title: 'Discard unsaved scores?',
    message: 'You have scores that have not been saved. Leave this page anyway?',
    confirmText: 'Discard changes',
    tone: 'danger',
  })
})
</script>

<template>
  <div class="space-y-4">
    <LoadingState v-if="sheet.loading.value && !sheet.data.value" />
    <ErrorState v-else-if="sheet.error.value" :message="sheet.error.value" @retry="sheet.run" />

    <template v-else-if="sheet.data.value">
      <div v-if="rejectedRows.length" class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800" role="alert">
        <p class="flex items-center gap-2 font-medium"><AppIcon name="alert" :size="16" /> Results returned for correction</p>
        <ul class="mt-2 list-disc space-y-1 pl-6">
          <li v-for="row in rejectedRows" :key="row.course_registration_id">
            <strong>{{ row.matric_number }}</strong>: {{ row.result.rejection_reason }}
          </li>
        </ul>
      </div>

      <SectionCard
        title="Result sheet"
        :subtitle="`CA max ${limits.max_ca_score} · Exam max ${limits.max_exam_score} · Grades are computed by the server when you save.`"
        flush
      >
        <EmptyState v-if="!rows.length" title="No registered students" text="Results can be entered once students register for this course." />
        <div v-else class="overflow-x-auto">
          <table class="table-base">
            <thead>
              <tr>
                <th>Matric no.</th>
                <th>Name</th>
                <th class="w-28">CA</th>
                <th class="w-28">Exam</th>
                <th class="text-right">Total</th>
                <th class="text-center">Grade</th>
                <th>Status</th>
                <th><span class="sr-only">History</span></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="row in rows" :key="row.course_registration_id" :class="isDirty(row) && 'bg-amber-50/50'">
                <td class="font-medium whitespace-nowrap">{{ row.matric_number }}</td>
                <td class="whitespace-nowrap">{{ row.name }}</td>
                <td>
                  <input
                    v-if="row.is_editable"
                    v-model.number="row.ca"
                    type="number"
                    min="0"
                    :max="limits.max_ca_score"
                    step="0.5"
                    class="input w-24 py-1.5"
                    :class="{ 'input-error': rowErrors(row).ca }"
                    :aria-label="`CA score for ${row.matric_number}`"
                  />
                  <span v-else>{{ formatNumber(row.result?.ca_score, 0) }}</span>
                  <p v-if="rowErrors(row).ca" class="field-error">{{ rowErrors(row).ca }}</p>
                </td>
                <td>
                  <input
                    v-if="row.is_editable"
                    v-model.number="row.exam"
                    type="number"
                    min="0"
                    :max="limits.max_exam_score"
                    step="0.5"
                    class="input w-24 py-1.5"
                    :class="{ 'input-error': rowErrors(row).exam }"
                    :aria-label="`Exam score for ${row.matric_number}`"
                  />
                  <span v-else>{{ formatNumber(row.result?.exam_score, 0) }}</span>
                  <p v-if="rowErrors(row).exam" class="field-error">{{ rowErrors(row).exam }}</p>
                </td>
                <td class="text-right font-medium">{{ total(row) === null ? '—' : Number(total(row).toFixed(2)) }}</td>
                <td class="text-center font-semibold">
                  <span v-if="isDirty(row)" class="text-xs font-normal text-amber-700">Unsaved</span>
                  <span v-else>{{ row.result?.grade ?? '—' }}</span>
                </td>
                <td><StatusBadge :status="row.result?.status ?? 'pending'" :label="row.result ? '' : 'Not entered'" /></td>
                <td class="text-right">
                  <button
                    v-if="row.result"
                    class="btn btn-ghost btn-sm"
                    :aria-label="`View history for ${row.matric_number}`"
                    @click="historyId = row.result.id"
                  >
                    <AppIcon name="history" :size="16" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="rows.length" class="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p class="text-sm text-slate-600">
            <template v-if="!editableCount">All results are locked. Ask your department to reopen them if corrections are needed.</template>
            <template v-else-if="dirtyRows.length">{{ dirtyRows.length }} unsaved change(s). Save before submitting.</template>
            <template v-else>{{ draftCount }} draft result(s) ready to submit.</template>
          </p>
          <div class="flex flex-col gap-2 sm:flex-row">
            <button class="btn btn-secondary" :disabled="!dirtyRows.length || hasErrors || saving" @click="save">
              {{ saving ? 'Saving…' : 'Save as draft' }}
            </button>
            <button class="btn btn-primary" :disabled="Boolean(dirtyRows.length) || !draftCount || submitting" @click="submit">
              {{ submitting ? 'Submitting…' : 'Submit for approval' }}
            </button>
          </div>
        </div>
      </SectionCard>
    </template>

    <ResultDetailModal :result-id="historyId" :loader="lecturerApi.result" @close="historyId = null" />
  </div>
</template>
