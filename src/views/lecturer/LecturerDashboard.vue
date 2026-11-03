<script setup>
import { computed } from 'vue'
import { lecturerApi } from '@/api'
import { useAsync } from '@/composables/useAsync'
import { levelLabel, periodLabel } from '@/utils/format'
import PageHeader from '@/components/ui/PageHeader.vue'
import StatCard from '@/components/ui/StatCard.vue'
import SectionCard from '@/components/ui/SectionCard.vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import BarList from '@/components/ui/BarList.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import ResultCounts from '@/components/ResultCounts.vue'

const { data, loading, error, run } = useAsync(lecturerApi.dashboard)

const profile = computed(() => data.value?.profile)
const totals = computed(() => data.value?.totals ?? {})
</script>

<template>
  <div>
    <PageHeader
      :title="`Welcome, ${profile?.user?.name ?? 'Lecturer'}`"
      :subtitle="data ? `${profile?.rank ?? ''} · ${profile?.department?.name ?? ''} · ${periodLabel(data.current_period?.academic_session, data.current_period?.semester)}` : ''"
    />

    <LoadingState v-if="loading && !data" />
    <ErrorState v-else-if="error" :message="error" @retry="run" />

    <div v-else-if="data" class="space-y-6">
      <div
        v-if="data.rejected_results_needing_attention"
        class="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
        role="alert"
      >
        <AppIcon name="alert" class="mt-0.5 shrink-0" />
        <p>
          <strong>{{ data.rejected_results_needing_attention }}</strong> result(s) were returned by your department for correction.
          Open the course to review the feedback and resubmit.
        </p>
      </div>

      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Courses this semester" :value="totals.assigned_courses_current" icon="book" />
        <StatCard label="Students this semester" :value="totals.students_current" icon="users" tone="sky" />
        <StatCard label="Results awaiting approval" :value="data.results_by_status?.submitted" icon="clipboard" tone="amber" />
        <StatCard label="All-time allocations" :value="totals.assigned_courses_all_time" icon="layers" tone="green" />
      </div>

      <div class="grid gap-6 lg:grid-cols-3">
        <SectionCard title="Current courses" class="lg:col-span-2" flush>
          <template #actions>
            <RouterLink :to="{ name: 'lecturer.courses' }" class="btn btn-secondary btn-sm">All courses</RouterLink>
          </template>
          <EmptyState v-if="!data.current_courses?.length" title="No courses assigned" text="You have no course allocations this semester." />
          <ul v-else class="divide-y divide-slate-100">
            <li v-for="item in data.current_courses" :key="item.course_allocation_id">
              <RouterLink
                :to="{ name: 'lecturer.course', params: { id: item.course_allocation_id } }"
                class="flex flex-col gap-2 px-5 py-4 hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
              >
                <div class="min-w-0">
                  <p class="font-medium text-slate-800">{{ item.course?.code }} · {{ item.course?.title }}</p>
                  <p class="text-xs text-slate-500">
                    {{ item.course?.units }} units · {{ levelLabel(item.course?.level) }} · {{ item.registered_students }} student(s)
                  </p>
                </div>
                <ResultCounts :counts="item.result_counts" />
              </RouterLink>
            </li>
          </ul>
        </SectionCard>

        <SectionCard title="My results by status">
          <BarList :items="data.results_by_status" />
        </SectionCard>
      </div>
    </div>
  </div>
</template>
