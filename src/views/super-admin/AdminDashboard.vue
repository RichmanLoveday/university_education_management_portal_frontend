<script setup>
import { computed } from 'vue'
import { superAdminApi } from '@/api'
import { useAsync } from '@/composables/useAsync'
import { formatDateTime, periodLabel } from '@/utils/format'
import { ROLE_LABELS } from '@/utils/roles'
import PageHeader from '@/components/ui/PageHeader.vue'
import StatCard from '@/components/ui/StatCard.vue'
import SectionCard from '@/components/ui/SectionCard.vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import BarList from '@/components/ui/BarList.vue'
import DataTable from '@/components/ui/DataTable.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'

const { data, loading, error, run } = useAsync(superAdminApi.dashboard)

const totals = computed(() => data.value?.totals ?? {})
const semester = computed(() => data.value?.current_semester ?? {})

const departmentColumns = [
  { key: 'name', label: 'Department' },
  { key: 'faculty.name', label: 'Faculty' },
  { key: 'students_count', label: 'Students', align: 'right' },
  { key: 'lecturers_count', label: 'Lecturers', align: 'right' },
  { key: 'courses_count', label: 'Courses', align: 'right' },
]
</script>

<template>
  <div>
    <PageHeader
      title="University overview"
      :subtitle="data ? `Current period: ${periodLabel(data.current_period?.academic_session, data.current_period?.semester)}` : ''"
    />

    <LoadingState v-if="loading && !data" />
    <ErrorState v-else-if="error" :message="error" @retry="run" />

    <div v-else-if="data" class="space-y-6">
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Students" :value="totals.students" icon="users" />
        <StatCard label="Lecturers" :value="totals.lecturers" icon="user" tone="sky" />
        <StatCard label="Faculties / Departments" :value="`${totals.faculties} / ${totals.departments}`" icon="building" tone="green" />
        <StatCard label="Programs / Courses" :value="`${totals.programs} / ${totals.courses}`" icon="book" tone="amber" />
      </div>

      <div class="grid gap-6 lg:grid-cols-3">
        <SectionCard title="Current semester activity">
          <dl class="space-y-3 text-sm">
            <div class="flex justify-between"><dt class="text-slate-500">Course allocations</dt><dd class="font-semibold">{{ semester.course_allocations }}</dd></div>
            <div class="flex justify-between"><dt class="text-slate-500">Course registrations</dt><dd class="font-semibold">{{ semester.course_registrations }}</dd></div>
            <div class="flex justify-between"><dt class="text-slate-500">Students registered</dt><dd class="font-semibold">{{ semester.students_registered }}</dd></div>
          </dl>
          <h3 class="mt-6 mb-3 text-sm font-semibold text-slate-800">Results by status</h3>
          <BarList :items="data.results_by_status" />
        </SectionCard>

        <SectionCard title="Users by role">
          <p class="mb-4 text-sm text-slate-500">
            {{ totals.users }} accounts · <span :class="totals.inactive_users && 'text-rose-600'">{{ totals.inactive_users }} inactive</span>
          </p>
          <BarList :items="data.users_by_role" :labels="ROLE_LABELS" />
          <RouterLink :to="{ name: 'super-admin.users' }" class="btn btn-secondary btn-sm mt-5 w-full">Manage users</RouterLink>
        </SectionCard>

        <SectionCard title="Recent result activity" flush>
          <template #actions>
            <RouterLink :to="{ name: 'super-admin.audit-logs' }" class="btn btn-secondary btn-sm">All logs</RouterLink>
          </template>
          <ul class="max-h-96 divide-y divide-slate-100 overflow-y-auto">
            <li v-if="!data.recent_activity?.length" class="px-5 py-6 text-center text-sm text-slate-500">No activity yet.</li>
            <li v-for="activity in data.recent_activity" :key="activity.id" class="px-5 py-3 text-sm">
              <div class="flex items-center justify-between gap-2">
                <StatusBadge :status="activity.action" />
                <span class="text-xs text-slate-400">{{ formatDateTime(activity.created_at) }}</span>
              </div>
              <p class="mt-1 text-slate-700">
                {{ activity.performed_by?.name }} · {{ activity.result?.course_registration?.course?.code }}
              </p>
            </li>
          </ul>
        </SectionCard>
      </div>

      <SectionCard title="Departments" flush>
        <template #actions>
          <RouterLink :to="{ name: 'super-admin.departments' }" class="btn btn-secondary btn-sm">Manage departments</RouterLink>
        </template>
        <DataTable :columns="departmentColumns" :rows="data.departments ?? []" />
      </SectionCard>
    </div>
  </div>
</template>
