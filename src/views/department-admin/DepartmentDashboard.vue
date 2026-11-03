<script setup>
import { computed } from 'vue'
import { departmentAdminApi } from '@/api'
import { useAsync } from '@/composables/useAsync'
import { periodLabel } from '@/utils/format'
import PageHeader from '@/components/ui/PageHeader.vue'
import StatCard from '@/components/ui/StatCard.vue'
import SectionCard from '@/components/ui/SectionCard.vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import BarList from '@/components/ui/BarList.vue'
import AppIcon from '@/components/ui/AppIcon.vue'

const { data, loading, error, run } = useAsync(departmentAdminApi.dashboard)

const totals = computed(() => data.value?.totals ?? {})
const semester = computed(() => data.value?.current_semester ?? {})

const shortcuts = [
  { label: 'Register a student', to: 'department-admin.students', icon: 'users' },
  { label: 'Allocate a course', to: 'department-admin.allocations', icon: 'link' },
  { label: 'View registrations', to: 'department-admin.registrations', icon: 'clipboard' },
  { label: 'Department reports', to: 'department-admin.reports', icon: 'chart' },
]
</script>

<template>
  <div>
    <PageHeader
      :title="data?.department?.name ? `Department of ${data.department.name}` : 'Department Dashboard'"
      :subtitle="data ? `${data.department?.faculty?.name ?? ''} · ${periodLabel(data.current_period?.academic_session, data.current_period?.semester)}` : ''"
    />

    <LoadingState v-if="loading && !data" />
    <ErrorState v-else-if="error" :message="error" @retry="run" />

    <div v-else-if="data" class="space-y-6">
      <RouterLink
        v-if="data.pending_approvals"
        :to="{ name: 'department-admin.results' }"
        class="flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 hover:bg-amber-100"
      >
        <span class="flex items-center gap-2">
          <AppIcon name="clipboard" :size="18" />
          <span><strong>{{ data.pending_approvals }}</strong> submitted result(s) are waiting for your review.</span>
        </span>
        <span class="font-medium">Review now →</span>
      </RouterLink>

      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Students" :value="totals.students" :hint="`${totals.active_students} active`" icon="users" />
        <StatCard label="Lecturers" :value="totals.lecturers" icon="user" tone="sky" />
        <StatCard label="Programs" :value="totals.programs" icon="layers" tone="green" />
        <StatCard label="Courses" :value="totals.courses" icon="book" tone="amber" />
      </div>

      <div class="grid gap-6 lg:grid-cols-3">
        <SectionCard title="Current semester" class="lg:col-span-2">
          <div class="grid gap-4 sm:grid-cols-3">
            <div class="rounded-lg bg-slate-50 p-4">
              <p class="text-sm text-slate-500">Course allocations</p>
              <p class="text-2xl font-bold text-slate-900">{{ semester.course_allocations }}</p>
            </div>
            <div class="rounded-lg bg-slate-50 p-4">
              <p class="text-sm text-slate-500">Course registrations</p>
              <p class="text-2xl font-bold text-slate-900">{{ semester.course_registrations }}</p>
            </div>
            <div class="rounded-lg bg-amber-50 p-4">
              <p class="text-sm text-amber-700">Pending approvals</p>
              <p class="text-2xl font-bold text-amber-900">{{ data.pending_approvals }}</p>
            </div>
          </div>
          <h3 class="mt-6 mb-3 text-sm font-semibold text-slate-800">Results by status</h3>
          <BarList :items="semester.results_by_status" />
        </SectionCard>

        <SectionCard title="Quick actions">
          <ul class="space-y-2">
            <li v-for="item in shortcuts" :key="item.to">
              <RouterLink :to="{ name: item.to }" class="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2.5 text-sm hover:bg-slate-50">
                <AppIcon :name="item.icon" :size="18" class="text-brand-600" /> {{ item.label }}
              </RouterLink>
            </li>
          </ul>
        </SectionCard>
      </div>
    </div>
  </div>
</template>
