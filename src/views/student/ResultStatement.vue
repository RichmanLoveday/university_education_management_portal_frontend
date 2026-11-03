<script setup>
import { computed } from 'vue'
import { studentApi } from '@/api'
import { useAsync } from '@/composables/useAsync'
import { formatNumber, levelLabel } from '@/utils/format'
import LoadingState from '@/components/ui/LoadingState.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import PrintableDocument from '@/components/PrintableDocument.vue'
import SemesterResults from '@/components/SemesterResults.vue'

const { data: statement, loading, error, run } = useAsync(studentApi.statement)

const studentRows = computed(() => {
  const s = statement.value?.student ?? {}
  return [
    ['Name', s.name],
    ['Matric number', s.matric_number],
    ['Faculty', s.faculty],
    ['Department', s.department],
    ['Program', s.program],
    ['Level', levelLabel(s.academic_level)],
  ]
})
</script>

<template>
  <LoadingState v-if="loading && !statement" />
  <ErrorState v-else-if="error" :message="error" @retry="run" />
  <PrintableDocument v-else-if="statement" :title="statement.document ?? 'Statement of Result'" :generated-at="statement.generated_at">
    <template #back>
      <RouterLink :to="{ name: 'student.results' }" class="btn btn-secondary">Back to results</RouterLink>
    </template>

    <dl class="mb-8 grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
      <div v-for="[label, value] in studentRows" :key="label" class="flex gap-2 border-b border-dashed border-slate-200 py-1">
        <dt class="w-32 shrink-0 text-slate-500">{{ label }}</dt>
        <dd class="font-medium text-slate-900">{{ value ?? '—' }}</dd>
      </div>
    </dl>

    <p v-if="!statement.semesters?.length" class="py-8 text-center text-sm text-slate-500">No approved results available.</p>
    <div class="space-y-6">
      <SemesterResults
        v-for="semester in statement.semesters"
        :key="`${semester.academic_session?.id}-${semester.semester?.id}`"
        :semester="semester"
        class="break-inside-avoid"
      />
    </div>

    <div class="mt-8 grid gap-4 rounded-xl bg-slate-50 p-5 text-sm sm:grid-cols-4">
      <div><p class="text-slate-500">Total units</p><p class="text-lg font-bold">{{ statement.cumulative?.total_units }}</p></div>
      <div><p class="text-slate-500">Grade points</p><p class="text-lg font-bold">{{ statement.cumulative?.total_grade_points }}</p></div>
      <div><p class="text-slate-500">CGPA</p><p class="text-lg font-bold text-brand-700">{{ formatNumber(statement.cumulative?.cgpa) }}</p></div>
      <div><p class="text-slate-500">Class of degree</p><p class="text-lg font-bold">{{ statement.cumulative?.class_of_degree ?? '—' }}</p></div>
    </div>

    <div v-if="statement.grading_scale?.length" class="mt-8 break-inside-avoid">
      <h3 class="mb-2 text-sm font-semibold text-slate-800">Grading scale</h3>
      <div class="flex flex-wrap gap-2 text-xs">
        <span v-for="band in statement.grading_scale" :key="band.grade" class="rounded border border-slate-200 px-2 py-1">
          <strong>{{ band.grade }}</strong> · {{ band.min_score }}–{{ band.max_score }} · {{ band.grade_point }} GP
        </span>
      </div>
    </div>
  </PrintableDocument>
</template>
