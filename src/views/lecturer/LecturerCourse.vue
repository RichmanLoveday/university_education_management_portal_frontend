<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { lecturerApi } from '@/api'
import { useAsync } from '@/composables/useAsync'
import { formatDate, levelLabel, periodLabel } from '@/utils/format'
import PageHeader from '@/components/ui/PageHeader.vue'
import SectionCard from '@/components/ui/SectionCard.vue'
import DataTable from '@/components/ui/DataTable.vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import PerformanceStats from '@/components/PerformanceStats.vue'
import ResultSheet from './ResultSheet.vue'

const props = defineProps({ id: { type: String, required: true } })
const route = useRoute()
const router = useRouter()

const tabs = [
  { key: 'results', label: 'Result entry' },
  { key: 'students', label: 'Class list' },
  { key: 'summary', label: 'Performance summary' },
]
const activeTab = ref(tabs.some((tab) => tab.key === route.query.tab) ? route.query.tab : 'results')

function selectTab(key) {
  activeTab.value = key
  router.replace({ query: { tab: key } })
  if (key === 'summary') summary.run()
}

const course = useAsync(() => lecturerApi.course(props.id))
const summary = useAsync(() => lecturerApi.summary(props.id), { immediate: activeTab.value === 'summary' })

const allocation = computed(() => course.data.value?.allocation)
const printPage = () => window.print()
const classColumns = [
  { key: 'matric_number', label: 'Matric no.', class: 'whitespace-nowrap font-medium' },
  { key: 'name', label: 'Name', class: 'whitespace-nowrap' },
  { key: 'email', label: 'Email' },
  { key: 'academic_level', label: 'Level', format: levelLabel, class: 'whitespace-nowrap' },
  { key: 'program', label: 'Program' },
  { key: 'registration_date', label: 'Registered', format: formatDate, class: 'whitespace-nowrap' },
]
</script>

<template>
  <div>
    <LoadingState v-if="course.loading.value && !course.data.value" />
    <ErrorState v-else-if="course.error.value" :message="course.error.value" @retry="course.run" />

    <template v-else-if="allocation">
      <PageHeader
        :title="`${allocation.course?.code} · ${allocation.course?.title}`"
        :subtitle="`${allocation.course?.units} units · ${levelLabel(allocation.course?.level)} · ${periodLabel(allocation.academic_session, allocation.semester)}`"
      >
        <template #breadcrumb>
          <RouterLink :to="{ name: 'lecturer.courses' }" class="mb-1 inline-block text-sm text-brand-600 hover:underline">← My courses</RouterLink>
        </template>
      </PageHeader>

      <div class="mb-6 flex gap-1 overflow-x-auto border-b border-slate-200" role="tablist">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          role="tab"
          :aria-selected="activeTab === tab.key"
          class="-mb-px border-b-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition"
          :class="activeTab === tab.key ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500 hover:text-slate-700'"
          @click="selectTab(tab.key)"
        >
          {{ tab.label }}
          <span v-if="tab.key === 'students'" class="ml-1 rounded-full bg-slate-100 px-2 text-xs text-slate-600">{{ course.data.value.total_students }}</span>
        </button>
      </div>

      <!-- Kept mounted so unsaved scores survive tab switches -->
      <ResultSheet v-show="activeTab === 'results'" :allocation-id="id" @saved="course.run" />

      <SectionCard v-if="activeTab === 'students'" title="Class list" :subtitle="`${course.data.value.total_students} registered student(s)`" flush>
        <template #actions>
          <button class="btn btn-secondary btn-sm" @click="printPage">Print class list</button>
        </template>
        <DataTable
          :columns="classColumns"
          :rows="course.data.value.class_list"
          row-key="course_registration_id"
          empty-title="No registered students"
          empty-text="Students who register for this course will appear here."
        />
      </SectionCard>

      <SectionCard v-else-if="activeTab === 'summary'" title="Performance summary">
        <LoadingState v-if="summary.loading.value && !summary.data.value" />
        <ErrorState v-else-if="summary.error.value" :message="summary.error.value" @retry="summary.run" />
        <template v-else-if="summary.data.value">
          <div class="mb-6 grid grid-cols-3 gap-3 text-center text-sm">
            <div class="rounded-lg border border-slate-200 p-3">
              <p class="text-slate-500">Registered</p>
              <p class="text-xl font-bold">{{ summary.data.value.registered_students }}</p>
            </div>
            <div class="rounded-lg border border-slate-200 p-3">
              <p class="text-slate-500">Results entered</p>
              <p class="text-xl font-bold">{{ summary.data.value.results_entered }}</p>
            </div>
            <div class="rounded-lg border border-slate-200 p-3">
              <p class="text-slate-500">Pending entry</p>
              <p class="text-xl font-bold">{{ summary.data.value.results_pending }}</p>
            </div>
          </div>
          <PerformanceStats :statistics="summary.data.value.statistics" />
        </template>
      </SectionCard>
    </template>
  </div>
</template>
