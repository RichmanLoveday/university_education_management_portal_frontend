<script setup>
import { formatNumber, periodLabel } from '@/utils/format'

defineProps({
  semester: { type: Object, required: true },
  compact: { type: Boolean, default: false },
})
</script>

<template>
  <div class="overflow-hidden rounded-xl border border-slate-200 bg-white">
    <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3">
      <h3 class="text-sm font-semibold text-slate-800">{{ periodLabel(semester.academic_session, semester.semester) }}</h3>
      <p class="text-sm text-slate-600">
        GPA <span class="font-bold text-brand-700">{{ formatNumber(semester.summary?.gpa) }}</span>
      </p>
    </div>
    <div class="overflow-x-auto">
      <table class="table-base">
        <thead>
          <tr>
            <th>Code</th>
            <th>Course title</th>
            <th class="text-right">Units</th>
            <th v-if="!compact" class="text-right">CA</th>
            <th v-if="!compact" class="text-right">Exam</th>
            <th class="text-right">Total</th>
            <th class="text-center">Grade</th>
            <th class="text-right">GP</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="result in semester.results" :key="result.result_id">
            <td class="font-medium whitespace-nowrap">{{ result.course_code }}</td>
            <td class="min-w-48">{{ result.course_title }}</td>
            <td class="text-right">{{ result.units }}</td>
            <td v-if="!compact" class="text-right">{{ formatNumber(result.ca_score, 0) }}</td>
            <td v-if="!compact" class="text-right">{{ formatNumber(result.exam_score, 0) }}</td>
            <td class="text-right">{{ formatNumber(result.total_score, 0) }}</td>
            <td class="text-center font-semibold">{{ result.grade }}</td>
            <td class="text-right">{{ formatNumber(result.grade_point) }}</td>
          </tr>
        </tbody>
        <tfoot class="border-t border-slate-200 bg-slate-50 text-sm">
          <tr>
            <td colspan="2" class="font-medium">Semester summary</td>
            <td class="text-right font-medium">{{ semester.summary?.total_units }}</td>
            <td :colspan="compact ? 2 : 4" class="text-right text-slate-500">Grade points: {{ semester.summary?.total_grade_points }}</td>
            <td class="text-right font-bold text-brand-700">{{ formatNumber(semester.summary?.gpa) }}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
</template>
