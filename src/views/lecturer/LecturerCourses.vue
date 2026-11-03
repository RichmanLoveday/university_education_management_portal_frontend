<script setup>
import { lecturerApi } from '@/api'
import { usePaginatedList } from '@/composables/usePaginatedList'
import { levelLabel, periodLabel } from '@/utils/format'
import PageHeader from '@/components/ui/PageHeader.vue'
import DataTable from '@/components/ui/DataTable.vue'
import PaginationBar from '@/components/ui/PaginationBar.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import ResultCounts from '@/components/ResultCounts.vue'

const { rows, meta, loading, error, filters, load, setPage } = usePaginatedList(lecturerApi.courses, { current: 1 })

const columns = [
  { key: 'course.code', label: 'Code', class: 'whitespace-nowrap font-medium' },
  { key: 'course.title', label: 'Title', class: 'min-w-56' },
  { key: 'course.units', label: 'Units', align: 'right' },
  { key: 'course.level', label: 'Level', format: levelLabel, class: 'whitespace-nowrap' },
  { key: 'period', label: 'Session', class: 'whitespace-nowrap' },
  { key: 'registered_students', label: 'Students', align: 'right' },
  { key: 'result_counts', label: 'Results' },
  { key: 'actions', label: '', align: 'right' },
]
</script>

<template>
  <div>
    <PageHeader title="My Courses" subtitle="Courses allocated to you by your department." />

    <div class="card overflow-hidden">
      <div class="flex flex-wrap items-center gap-2 border-b border-slate-200 p-4">
        <button class="btn btn-sm" :class="filters.current ? 'btn-primary' : 'btn-secondary'" @click="filters.current = 1">
          Current semester
        </button>
        <button class="btn btn-sm" :class="!filters.current ? 'btn-primary' : 'btn-secondary'" @click="filters.current = ''">
          All sessions
        </button>
      </div>

      <ErrorState v-if="error" :message="error" class="m-4 border-0 shadow-none" @retry="load" />
      <DataTable v-else :columns="columns" :rows="rows" :loading="loading" empty-text="No courses have been allocated to you for this period.">
        <template #cell-course.code="{ row, value }">
          <RouterLink :to="{ name: 'lecturer.course', params: { id: row.id } }" class="text-brand-700 hover:underline">{{ value }}</RouterLink>
        </template>
        <template #cell-period="{ row }">
          {{ periodLabel(row.academic_session, row.semester) }}
          <StatusBadge v-if="row.academic_session?.is_current && row.semester?.is_current" status="current" class="ml-1" />
        </template>
        <template #cell-result_counts="{ value }"><ResultCounts :counts="value" /></template>
        <template #cell-actions="{ row }">
          <RouterLink :to="{ name: 'lecturer.course', params: { id: row.id } }" class="btn btn-secondary btn-sm">Open</RouterLink>
        </template>
      </DataTable>
      <PaginationBar :meta="meta" @change="setPage" />
    </div>
  </div>
</template>
