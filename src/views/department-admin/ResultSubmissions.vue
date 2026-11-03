<script setup>
import { departmentAdminApi } from '@/api'
import { usePaginatedList } from '@/composables/usePaginatedList'
import { splitPeriod, useDepartmentPeriods } from '@/composables/useDepartmentPeriods'
import { formatDateTime, periodLabel } from '@/utils/format'
import PageHeader from '@/components/ui/PageHeader.vue'
import DataTable from '@/components/ui/DataTable.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import FormField from '@/components/ui/FormField.vue'
import ResultCounts from '@/components/ResultCounts.vue'

const { options: periodOptions } = useDepartmentPeriods()

const { rows, loading, error, filters, load } = usePaginatedList(
  ({ period, page: _page, per_page: _perPage, ...params }) =>
    departmentAdminApi.submissions({ ...params, ...(period ? splitPeriod(period) : {}) }),
  { status: '', period: '' },
)

const columns = [
  { key: 'course.code', label: 'Course', class: 'whitespace-nowrap' },
  { key: 'lecturer.user.name', label: 'Lecturer', class: 'whitespace-nowrap' },
  { key: 'period', label: 'Session', class: 'whitespace-nowrap', format: (_, row) => periodLabel(row.academic_session, row.semester) },
  { key: 'result_counts', label: 'Results' },
  { key: 'last_submitted_at', label: 'Last submitted', format: formatDateTime, class: 'whitespace-nowrap' },
  { key: 'actions', label: '', align: 'right' },
]

// An empty status uses the API default: courses with submitted results
const statusOptions = [
  { value: 'approved', label: 'With approved results' },
  { value: 'rejected', label: 'With returned results' },
  { value: 'draft', label: 'With draft results' },
  { value: 'all', label: 'All courses' },
]
</script>

<template>
  <div>
    <PageHeader title="Result Approval" subtitle="Review results submitted by lecturers, then approve them or return them with feedback." />

    <div class="card overflow-hidden">
      <div class="grid gap-3 border-b border-slate-200 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <FormField v-model="filters.status" type="select" :options="statusOptions" placeholder="Awaiting approval" />
        <FormField v-model="filters.period" type="select" :options="periodOptions" placeholder="All sessions" />
      </div>

      <ErrorState v-if="error" :message="error" class="m-4 border-0 shadow-none" @retry="load" />
      <DataTable
        v-else
        :columns="columns"
        :rows="rows"
        :loading="loading"
        row-key="course_allocation_id"
        :empty-title="filters.status ? 'No results found' : 'Nothing awaiting approval'"
        empty-text="Submitted results from lecturers will appear here."
      >
        <template #cell-course.code="{ row }">
          <RouterLink
            :to="{ name: 'department-admin.course-results', params: { allocationId: row.course_allocation_id } }"
            class="font-medium text-brand-700 hover:underline"
          >
            {{ row.course?.code }}
          </RouterLink>
          <span class="block max-w-56 truncate text-xs text-slate-500">{{ row.course?.title }}</span>
        </template>
        <template #cell-result_counts="{ value }"><ResultCounts :counts="value" /></template>
        <template #cell-actions="{ row }">
          <RouterLink
            :to="{ name: 'department-admin.course-results', params: { allocationId: row.course_allocation_id } }"
            class="btn btn-sm"
            :class="row.result_counts?.submitted ? 'btn-primary' : 'btn-secondary'"
          >
            {{ row.result_counts?.submitted ? 'Review' : 'View' }}
          </RouterLink>
        </template>
      </DataTable>
    </div>
  </div>
</template>
