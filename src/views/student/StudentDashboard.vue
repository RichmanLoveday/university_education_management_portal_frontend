<script setup>
import { computed } from 'vue'
import { studentApi } from '@/api'
import { useAsync } from '@/composables/useAsync'
import { formatNumber, levelLabel, periodLabel } from '@/utils/format'
import PageHeader from '@/components/ui/PageHeader.vue'
import StatCard from '@/components/ui/StatCard.vue'
import SectionCard from '@/components/ui/SectionCard.vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import SemesterResults from '@/components/SemesterResults.vue'

const { data, loading, error, run } = useAsync(studentApi.dashboard)

const profile = computed(() => data.value?.profile)
const standing = computed(() => data.value?.academic_standing ?? {})
const current = computed(() => data.value?.current_semester ?? {})
</script>

<template>
  <div>
    <PageHeader
      :title="`Welcome, ${profile?.user?.name?.split(' ')[0] ?? 'Student'}`"
      :subtitle="data ? `Current period: ${periodLabel(data.current_period?.academic_session, data.current_period?.semester)}` : ''"
    >
      <template #actions>
        <RouterLink :to="{ name: 'student.registration' }" class="btn btn-primary">Register courses</RouterLink>
      </template>
    </PageHeader>

    <LoadingState v-if="loading && !data" />
    <ErrorState v-else-if="error" :message="error" @retry="run" />

    <div v-else-if="data" class="space-y-6">
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="CGPA" :value="formatNumber(standing.cgpa)" :hint="standing.class_of_degree ?? 'No approved results yet'" icon="graduation" />
        <StatCard label="Registered courses" :value="current.registered_courses" hint="This semester" icon="book" tone="sky" />
        <StatCard label="Registered units" :value="current.registered_units" hint="This semester" icon="clipboard" tone="amber" />
        <StatCard label="Total units earned" :value="standing.total_units" :hint="`${standing.total_grade_points} grade points`" icon="chart" tone="green" />
      </div>

      <div class="grid gap-6 lg:grid-cols-3">
        <SectionCard title="Academic profile">
          <dl class="space-y-3 text-sm">
            <div v-for="item in [
              ['Matric number', profile.matric_number],
              ['Faculty', profile.department?.faculty?.name],
              ['Department', profile.department?.name],
              ['Program', profile.program?.name],
              ['Level', levelLabel(profile.academic_level)],
              ['Status', profile.status],
            ]" :key="item[0]" class="flex justify-between gap-4">
              <dt class="text-slate-500">{{ item[0] }}</dt>
              <dd class="text-right font-medium text-slate-800" :class="item[0] === 'Status' && 'capitalize'">{{ item[1] ?? '—' }}</dd>
            </div>
          </dl>
        </SectionCard>

        <SectionCard title="This semester's courses" class="lg:col-span-2" flush>
          <template #actions>
            <RouterLink :to="{ name: 'student.slip' }" class="btn btn-secondary btn-sm">Print slip</RouterLink>
          </template>
          <EmptyState v-if="!current.courses?.length" title="No courses registered" text="Register your courses for the current semester.">
            <RouterLink :to="{ name: 'student.registration' }" class="btn btn-primary btn-sm">Go to registration</RouterLink>
          </EmptyState>
          <ul v-else class="divide-y divide-slate-100">
            <li v-for="course in current.courses" :key="course.id" class="flex items-center justify-between gap-4 px-5 py-3 text-sm">
              <div class="min-w-0">
                <p class="font-medium text-slate-800">{{ course.code }}</p>
                <p class="truncate text-slate-500">{{ course.title }}</p>
              </div>
              <span class="shrink-0 text-slate-600">{{ course.units }} units</span>
            </li>
          </ul>
        </SectionCard>
      </div>

      <SectionCard title="Latest approved results" flush>
        <template #actions>
          <RouterLink :to="{ name: 'student.results' }" class="btn btn-secondary btn-sm">View all results</RouterLink>
        </template>
        <EmptyState v-if="!data.latest_semester" title="No approved results yet" text="Results appear here once approved by your department." />
        <div v-else class="p-4"><SemesterResults :semester="data.latest_semester" compact /></div>
      </SectionCard>
    </div>
  </div>
</template>
