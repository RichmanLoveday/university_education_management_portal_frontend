<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { errorMessage } from '@/api/client'
import { splitPeriod } from '@/composables/useDepartmentPeriods'
import { formatNumber, levelLabel } from '@/utils/format'
import SectionCard from './ui/SectionCard.vue'
import FormField from './ui/FormField.vue'
import LoadingState from './ui/LoadingState.vue'
import ErrorState from './ui/ErrorState.vue'
import BarList from './ui/BarList.vue'
import DataTable from './ui/DataTable.vue'
import AppIcon from './ui/AppIcon.vue'
import PerformanceStats from './PerformanceStats.vue'

const props = defineProps({
  api: { type: Object, required: true },
  periodOptions: { type: Array, default: () => [] },
  departmentOptions: { type: Array, default: null },
})

const tabs = [
  { key: 'students', label: 'Students' },
  { key: 'registrations', label: 'Course registrations' },
  { key: 'performance', label: 'Academic performance' },
]
const activeTab = ref('students')
const filters = reactive({ period: '', department_id: '' })

const report = ref(null)
const loading = ref(false)
const error = ref('')

const params = computed(() => {
  const result = {}
  if (filters.department_id) result.department_id = filters.department_id
  if (filters.period && activeTab.value !== 'students') Object.assign(result, splitPeriod(filters.period))
  return result
})

let requestId = 0
async function load() {
  const current = ++requestId
  loading.value = true
  error.value = ''
  try {
    const data = await props.api[activeTab.value](params.value)
    if (current === requestId) report.value = data
  } catch (err) {
    if (current === requestId) error.value = errorMessage(err)
  } finally {
    if (current === requestId) loading.value = false
  }
}

watch([activeTab, params], () => {
  report.value = null
  load()
}, { immediate: true })

const levelLabels = computed(() =>
  Object.fromEntries(Object.keys(report.value?.by_level ?? {}).map((level) => [level, levelLabel(level)])),
)

const registrationColumns = [
  { key: 'code', label: 'Code', class: 'whitespace-nowrap font-medium' },
  { key: 'title', label: 'Title', class: 'min-w-56' },
  ...(props.departmentOptions ? [{ key: 'department.code', label: 'Dept.' }] : []),
  { key: 'level', label: 'Level', format: levelLabel, class: 'whitespace-nowrap' },
  { key: 'units', label: 'Units', align: 'right' },
  { key: 'registered_students', label: 'Students', align: 'right' },
]
const courseColumns = [
  { key: 'course.code', label: 'Course', class: 'whitespace-nowrap font-medium' },
  { key: 'statistics.total_results', label: 'Results', align: 'right' },
  { key: 'statistics.average_score', label: 'Average', align: 'right', format: (v) => formatNumber(v, 1) },
  { key: 'statistics.highest_score', label: 'Highest', align: 'right', format: (v) => formatNumber(v, 0) },
  { key: 'statistics.lowest_score', label: 'Lowest', align: 'right', format: (v) => formatNumber(v, 0) },
  { key: 'statistics.pass_rate', label: 'Pass rate', align: 'right', format: (v) => `${formatNumber(v, 1)}%` },
]
const studentColumns = [
  { key: 'matric_number', label: 'Matric no.', class: 'whitespace-nowrap font-medium' },
  { key: 'name', label: 'Student', class: 'whitespace-nowrap' },
  { key: 'academic_level', label: 'Level', format: levelLabel, class: 'whitespace-nowrap' },
  { key: 'total_units', label: 'Units', align: 'right' },
  { key: 'total_grade_points', label: 'Grade points', align: 'right' },
  { key: 'gpa', label: 'GPA', align: 'right', format: (v) => formatNumber(v) },
]

const printReport = () => window.print()
</script>

<template>
  <div class="space-y-6">
    <div class="no-print flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div class="flex gap-1 overflow-x-auto border-b border-slate-200" role="tablist">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          role="tab"
          :aria-selected="activeTab === tab.key"
          class="-mb-px border-b-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap"
          :class="activeTab === tab.key ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500 hover:text-slate-700'"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>
      <div class="flex flex-col gap-2 sm:flex-row">
        <FormField v-if="departmentOptions" v-model="filters.department_id" type="select" :options="departmentOptions" placeholder="All departments" class="sm:w-56" />
        <FormField
          v-if="activeTab !== 'students'"
          v-model="filters.period"
          type="select"
          :options="periodOptions"
          placeholder="Current session"
          class="sm:w-64"
        />
        <button class="btn btn-secondary" @click="printReport"><AppIcon name="printer" :size="16" /> Print</button>
      </div>
    </div>

    <LoadingState v-if="loading && !report" />
    <ErrorState v-else-if="error" :message="error" @retry="load" />

    <template v-else-if="report">
      <div v-if="activeTab === 'students'" class="grid gap-6 lg:grid-cols-3">
        <SectionCard title="Students by level">
          <p class="mb-4 text-3xl font-bold text-slate-900">{{ report.total }} <span class="text-sm font-normal text-slate-500">students</span></p>
          <BarList :items="report.by_level" :labels="levelLabels" />
        </SectionCard>
        <SectionCard title="Students by status"><BarList :items="report.by_status" /></SectionCard>
        <SectionCard title="Students by program"><BarList :items="report.by_program" /></SectionCard>
      </div>

      <template v-else-if="activeTab === 'registrations'">
        <div class="grid gap-4 sm:grid-cols-3">
          <div class="card p-5"><p class="text-sm text-slate-500">Total registrations</p><p class="text-2xl font-bold">{{ report.summary?.total_registrations }}</p></div>
          <div class="card p-5"><p class="text-sm text-slate-500">Students registered</p><p class="text-2xl font-bold">{{ report.summary?.students_registered }}</p></div>
          <div class="card p-5"><p class="text-sm text-slate-500">Courses with students</p><p class="text-2xl font-bold">{{ report.summary?.courses_with_students }}</p></div>
        </div>
        <SectionCard title="Registrations per course" flush>
          <DataTable :columns="registrationColumns" :rows="report.courses ?? []" empty-title="No courses" />
        </SectionCard>
      </template>

      <template v-else>
        <SectionCard title="Overall performance" subtitle="Based on approved results">
          <PerformanceStats :statistics="report.overall" />
        </SectionCard>
        <div class="grid gap-6 xl:grid-cols-2">
          <SectionCard title="Performance by course" flush>
            <DataTable :columns="courseColumns" :rows="report.courses ?? []" row-key="course.id" empty-title="No approved results" />
          </SectionCard>
          <SectionCard title="Student GPA summary" flush>
            <DataTable :columns="studentColumns" :rows="report.students ?? []" row-key="student_id" empty-title="No approved results" />
          </SectionCard>
        </div>
      </template>
    </template>
  </div>
</template>
