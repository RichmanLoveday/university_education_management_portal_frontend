<script setup>
import { computed } from 'vue'
import { studentApi } from '@/api'
import { useAsync } from '@/composables/useAsync'
import { levelLabel } from '@/utils/format'
import LoadingState from '@/components/ui/LoadingState.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import PrintableDocument from '@/components/PrintableDocument.vue'

const { data: slip, loading, error, run } = useAsync(studentApi.slip)

const studentRows = computed(() => {
  const s = slip.value?.student ?? {}
  return [
    ['Name', s.name],
    ['Matric number', s.matric_number],
    ['Faculty', s.faculty],
    ['Department', s.department],
    ['Program', s.program],
    ['Level', levelLabel(s.academic_level)],
    ['Session', slip.value?.academic_session],
    ['Semester', slip.value?.semester],
  ]
})
</script>

<template>
  <LoadingState v-if="loading && !slip" />
  <ErrorState v-else-if="error" :message="error" @retry="run" />
  <PrintableDocument v-else-if="slip" :title="slip.document ?? 'Course Registration Slip'" :generated-at="slip.generated_at">
    <template #back>
      <RouterLink :to="{ name: 'student.registration' }" class="btn btn-secondary">Back to registration</RouterLink>
    </template>

    <dl class="mb-8 grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
      <div v-for="[label, value] in studentRows" :key="label" class="flex gap-2 border-b border-dashed border-slate-200 py-1">
        <dt class="w-32 shrink-0 text-slate-500">{{ label }}</dt>
        <dd class="font-medium text-slate-900">{{ value ?? '—' }}</dd>
      </div>
    </dl>

    <div class="overflow-x-auto">
      <table class="table-base border border-slate-200">
        <thead>
          <tr>
            <th class="w-12">S/N</th>
            <th>Course code</th>
            <th>Course title</th>
            <th class="text-right">Units</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-if="!slip.courses?.length">
            <td colspan="4" class="py-6 text-center text-slate-500">No courses registered for this semester.</td>
          </tr>
          <tr v-for="(course, index) in slip.courses" :key="course.code">
            <td>{{ index + 1 }}</td>
            <td class="font-medium">{{ course.code }}</td>
            <td>{{ course.title }}</td>
            <td class="text-right">{{ course.units }}</td>
          </tr>
        </tbody>
        <tfoot class="border-t-2 border-slate-300 font-semibold">
          <tr>
            <td colspan="3">Total: {{ slip.total_courses }} course(s)</td>
            <td class="text-right">{{ slip.total_units }}</td>
          </tr>
        </tfoot>
      </table>
    </div>

    <div class="mt-16 grid grid-cols-2 gap-10 text-center text-xs text-slate-500">
      <div class="border-t border-slate-400 pt-2">Student's signature</div>
      <div class="border-t border-slate-400 pt-2">Head of Department</div>
    </div>
  </PrintableDocument>
</template>
