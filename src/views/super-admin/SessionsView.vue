<script setup>
import { ref } from 'vue'
import { superAdminApi } from '@/api'
import { errorMessage } from '@/api/client'
import { useSessionOptions } from '@/composables/useSuperAdminLookups'
import { useToastStore } from '@/stores/toast'
import { useConfirmStore } from '@/stores/confirm'
import { SEMESTER_NUMBERS, formatDate, toDateInput } from '@/utils/format'
import ResourceManager from '@/components/ResourceManager.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'

const toast = useToastStore()
const confirm = useConfirmStore()
const { options: sessionOptions, load: reloadSessions } = useSessionOptions()

const tab = ref('sessions')

// Keep the semester form's session dropdown in sync with session changes
const sessionResource = {
  ...superAdminApi.sessions,
  create: (payload) => superAdminApi.sessions.create(payload).finally(reloadSessions),
  update: (id, payload) => superAdminApi.sessions.update(id, payload).finally(reloadSessions),
  remove: (id) => superAdminApi.sessions.remove(id).finally(reloadSessions),
}

const sessionColumns = [
  { key: 'name', label: 'Session', class: 'font-medium whitespace-nowrap' },
  { key: 'start_date', label: 'Starts', format: formatDate, class: 'whitespace-nowrap' },
  { key: 'end_date', label: 'Ends', format: formatDate, class: 'whitespace-nowrap' },
  { key: 'semesters_count', label: 'Semesters', align: 'right' },
  { key: 'is_current', label: 'Status' },
]

const semesterColumns = [
  { key: 'name', label: 'Semester', class: 'font-medium whitespace-nowrap' },
  { key: 'academic_session.name', label: 'Session', class: 'whitespace-nowrap' },
  { key: 'start_date', label: 'Starts', format: formatDate, class: 'whitespace-nowrap' },
  { key: 'end_date', label: 'Ends', format: formatDate, class: 'whitespace-nowrap' },
  { key: 'is_current', label: 'Status' },
]

const sessionFields = () => [
  { key: 'name', label: 'Session name', required: true, placeholder: '2026/2027', full: true },
  { key: 'start_date', label: 'Start date', type: 'date' },
  { key: 'end_date', label: 'End date', type: 'date' },
  { key: 'is_current', label: 'Set as the current session', type: 'checkbox', full: true },
]

const semesterFields = () => [
  { key: 'academic_session_id', label: 'Academic session', type: 'select', options: sessionOptions, required: true, full: true },
  { key: 'name', label: 'Semester name', required: true, placeholder: 'First Semester' },
  { key: 'number', label: 'Semester', type: 'select', options: SEMESTER_NUMBERS, required: true, hint: 'Matches the semester set on courses.' },
  { key: 'start_date', label: 'Start date', type: 'date' },
  { key: 'end_date', label: 'End date', type: 'date' },
  { key: 'is_current', label: 'Set as the current semester', type: 'checkbox', full: true },
]

const sessionToForm = (record) => ({
  name: record?.name ?? '',
  start_date: toDateInput(record?.start_date),
  end_date: toDateInput(record?.end_date),
  is_current: record?.is_current ?? false,
})

const semesterToForm = (record) => ({
  academic_session_id: record?.academic_session_id ?? '',
  name: record?.name ?? '',
  number: record?.number ?? '',
  start_date: toDateInput(record?.start_date),
  end_date: toDateInput(record?.end_date),
  is_current: record?.is_current ?? false,
})

async function setCurrent(kind, row, reload) {
  const label = kind === 'session' ? row.name : `${row.name} (${row.academic_session?.name})`
  const ok = await confirm.ask({
    title: `Set current ${kind}?`,
    message: `${label} will become the current ${kind}. Course registration and result entry use the current period.`,
    confirmText: 'Set as current',
  })
  if (!ok) return
  try {
    const api = kind === 'session' ? superAdminApi.sessions : superAdminApi.semesters
    const response = await api.setCurrent(row.id)
    toast.success(response.message ?? `Current ${kind} updated.`)
    reload()
  } catch (err) {
    toast.error(errorMessage(err))
  }
}
</script>

<template>
  <div>
    <div class="mb-6 flex gap-1 border-b border-slate-200" role="tablist">
      <button
        v-for="item in [
          { key: 'sessions', label: 'Academic sessions' },
          { key: 'semesters', label: 'Semesters' },
        ]"
        :key="item.key"
        role="tab"
        :aria-selected="tab === item.key"
        class="-mb-px border-b-2 px-4 py-2.5 text-sm font-medium"
        :class="tab === item.key ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500 hover:text-slate-700'"
        @click="tab = item.key"
      >
        {{ item.label }}
      </button>
    </div>

    <ResourceManager
      v-if="tab === 'sessions'"
      title="Academic sessions"
      subtitle="Only one session can be current at a time."
      entity="Session"
      :resource="sessionResource"
      :columns="sessionColumns"
      :fields="sessionFields"
      :to-form="sessionToForm"
      :delete-message="(row) => `Delete session ${row.name}? Sessions with semesters or records cannot be deleted.`"
    >
      <template #cell-is_current="{ value }"><StatusBadge v-if="value" status="current" /><span v-else class="text-xs text-slate-400">—</span></template>
      <template #row-actions="{ row, reload }">
        <button v-if="!row.is_current" class="btn btn-secondary btn-sm" @click="setCurrent('session', row, reload)">Set current</button>
      </template>
    </ResourceManager>

    <ResourceManager
      v-else
      title="Semesters"
      subtitle="Semesters belong to a session; the current semester drives registration and result entry."
      entity="Semester"
      :resource="superAdminApi.semesters"
      :columns="semesterColumns"
      :filters="[{ key: 'academic_session_id', options: sessionOptions, placeholder: 'All sessions' }]"
      :fields="semesterFields"
      :to-form="semesterToForm"
      :delete-message="(row) => `Delete ${row.name} of ${row.academic_session?.name}?`"
    >
      <template #cell-is_current="{ value }"><StatusBadge v-if="value" status="current" /><span v-else class="text-xs text-slate-400">—</span></template>
      <template #row-actions="{ row, reload }">
        <button v-if="!row.is_current" class="btn btn-secondary btn-sm" @click="setCurrent('semester', row, reload)">Set current</button>
      </template>
    </ResourceManager>
  </div>
</template>
