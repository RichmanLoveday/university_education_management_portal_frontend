<script setup>
import { computed } from 'vue'
import { studentApi } from '@/api'
import { useAsync } from '@/composables/useAsync'
import { formatNumber } from '@/utils/format'
import PageHeader from '@/components/ui/PageHeader.vue'
import StatCard from '@/components/ui/StatCard.vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import SemesterResults from '@/components/SemesterResults.vue'

const { data, loading, error, run } = useAsync(() => studentApi.results())

const cumulative = computed(() => data.value?.cumulative ?? {})
const semesters = computed(() => data.value?.semesters ?? [])
</script>

<template>
  <div>
    <PageHeader title="Results" subtitle="Only results approved by your department are shown.">
      <template #actions>
        <RouterLink :to="{ name: 'student.statement' }" class="btn btn-secondary"><AppIcon name="printer" :size="16" /> Statement of result</RouterLink>
      </template>
    </PageHeader>

    <LoadingState v-if="loading && !data" />
    <ErrorState v-else-if="error" :message="error" @retry="run" />

    <div v-else-if="data" class="space-y-6">
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Cumulative GPA" :value="formatNumber(cumulative.cgpa)" icon="graduation" />
        <StatCard label="Class of degree" :value="cumulative.class_of_degree ?? '—'" icon="chart" tone="green" />
        <StatCard label="Total units" :value="cumulative.total_units" icon="book" tone="sky" />
        <StatCard label="Total grade points" :value="cumulative.total_grade_points" icon="clipboard" tone="amber" />
      </div>

      <div v-if="!semesters.length" class="card">
        <EmptyState title="No approved results yet" text="Your results will appear here once your department approves them." />
      </div>
      <SemesterResults v-for="semester in semesters" :key="`${semester.academic_session?.id}-${semester.semester?.id}`" :semester="semester" />
    </div>
  </div>
</template>
