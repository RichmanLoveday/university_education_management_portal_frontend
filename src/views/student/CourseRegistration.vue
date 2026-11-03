<script setup>
import { computed, ref } from 'vue'
import { studentApi } from '@/api'
import { errorMessage } from '@/api/client'
import { useAsync } from '@/composables/useAsync'
import { useToastStore } from '@/stores/toast'
import { useConfirmStore } from '@/stores/confirm'
import { formatDate, levelLabel, periodLabel } from '@/utils/format'
import PageHeader from '@/components/ui/PageHeader.vue'
import SectionCard from '@/components/ui/SectionCard.vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import AppIcon from '@/components/ui/AppIcon.vue'

const toast = useToastStore()
const confirm = useConfirmStore()

const available = useAsync(studentApi.availableCourses)
const registered = useAsync(() => studentApi.registrations())

const selected = ref([])
const submitting = ref(false)
const droppingId = ref(null)

const courses = computed(() => available.data.value?.courses ?? [])
const openCourses = computed(() => courses.value.filter((course) => !course.is_registered))
const limits = computed(() => available.data.value?.unit_limits ?? { min: 0, max: 0 })
const registeredUnits = computed(() => available.data.value?.registered_units ?? 0)
const selectedUnits = computed(() =>
  courses.value.filter((course) => selected.value.includes(course.id)).reduce((sum, course) => sum + course.units, 0),
)
const projectedUnits = computed(() => registeredUnits.value + selectedUnits.value)
const exceedsLimit = computed(() => limits.value.max > 0 && projectedUnits.value > limits.value.max)
const allSelected = computed(() => openCourses.value.length > 0 && selected.value.length === openCourses.value.length)

function toggleAll() {
  selected.value = allSelected.value ? [] : openCourses.value.map((course) => course.id)
}

function reload() {
  selected.value = []
  available.run()
  registered.run()
}

async function register() {
  const ok = await confirm.ask({
    title: 'Confirm course registration',
    message: `Register ${selected.value.length} course(s) totalling ${selectedUnits.value} units for ${periodLabel(available.data.value?.academic_session, available.data.value?.semester)}?`,
    confirmText: 'Register',
  })
  if (!ok) return
  submitting.value = true
  try {
    const response = await studentApi.register(selected.value)
    toast.success(response.message ?? 'Courses registered successfully.')
    reload()
  } catch (err) {
    toast.error(errorMessage(err))
  } finally {
    submitting.value = false
  }
}

async function drop(registration) {
  const ok = await confirm.ask({
    title: 'Drop course?',
    message: `Remove ${registration.course?.code} — ${registration.course?.title} from your registration?`,
    confirmText: 'Drop course',
    tone: 'danger',
  })
  if (!ok) return
  droppingId.value = registration.id
  try {
    const response = await studentApi.drop(registration.id)
    toast.success(response.message ?? 'Course dropped.')
    reload()
  } catch (err) {
    toast.error(errorMessage(err))
  } finally {
    droppingId.value = null
  }
}
</script>

<template>
  <div>
    <PageHeader
      title="Course Registration"
      :subtitle="available.data.value ? periodLabel(available.data.value.academic_session, available.data.value.semester) : 'Register courses for the current semester'"
    >
      <template #actions>
        <RouterLink :to="{ name: 'student.slip' }" class="btn btn-secondary"><AppIcon name="printer" :size="16" /> Registration slip</RouterLink>
      </template>
    </PageHeader>

    <LoadingState v-if="available.loading.value && !available.data.value" />
    <ErrorState v-else-if="available.error.value" :message="available.error.value" @retry="reload" />

    <div v-else-if="available.data.value" class="space-y-6">
      <SectionCard title="Available courses" subtitle="Courses offered for your department, program, level and the current semester." flush>
        <EmptyState v-if="!courses.length" title="No courses available" text="There are no courses open for your level this semester." />
        <template v-else>
          <div class="overflow-x-auto">
            <table class="table-base">
              <thead>
                <tr>
                  <th class="w-10">
                    <input
                      type="checkbox"
                      class="h-4 w-4 rounded border-slate-300"
                      :checked="allSelected"
                      :disabled="!openCourses.length"
                      aria-label="Select all courses"
                      @change="toggleAll"
                    />
                  </th>
                  <th>Code</th>
                  <th>Title</th>
                  <th class="text-right">Units</th>
                  <th>Level</th>
                  <th>Lecturer</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr
                  v-for="course in courses"
                  :key="course.id"
                  :class="course.is_registered ? 'bg-slate-50/60' : 'cursor-pointer hover:bg-brand-50/40'"
                  @click="!course.is_registered && (selected.includes(course.id) ? selected.splice(selected.indexOf(course.id), 1) : selected.push(course.id))"
                >
                  <td>
                    <input
                      v-model="selected"
                      type="checkbox"
                      class="h-4 w-4 rounded border-slate-300"
                      :value="course.id"
                      :disabled="course.is_registered"
                      :aria-label="`Select ${course.code}`"
                      @click.stop
                    />
                  </td>
                  <td class="font-medium whitespace-nowrap">{{ course.code }}</td>
                  <td class="min-w-56">{{ course.title }}</td>
                  <td class="text-right">{{ course.units }}</td>
                  <td class="whitespace-nowrap">{{ levelLabel(course.level) }}</td>
                  <td class="whitespace-nowrap">{{ course.lecturer ?? 'Not assigned' }}</td>
                  <td>
                    <span v-if="course.is_registered" class="text-xs font-medium text-emerald-700">Registered</span>
                    <span v-else class="text-xs text-slate-400">Open</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div class="text-sm text-slate-600">
              <p>
                Selected: <strong>{{ selected.length }}</strong> course(s), <strong>{{ selectedUnits }}</strong> units ·
                Total after registration: <strong :class="exceedsLimit && 'text-rose-600'">{{ projectedUnits }}</strong>
                <span v-if="limits.max"> / {{ limits.max }} max units</span>
              </p>
              <p v-if="exceedsLimit" class="mt-1 text-xs text-rose-600">The selection exceeds the maximum unit load for a semester.</p>
            </div>
            <button class="btn btn-primary" :disabled="!selected.length || exceedsLimit || submitting" @click="register">
              {{ submitting ? 'Registering…' : 'Register selected courses' }}
            </button>
          </div>
        </template>
      </SectionCard>

      <SectionCard
        title="Registered courses"
        :subtitle="registered.data.value ? `${registered.data.value.total_courses} course(s) · ${registered.data.value.total_units} units` : ''"
        flush
      >
        <LoadingState v-if="registered.loading.value && !registered.data.value" />
        <EmptyState v-else-if="!registered.data.value?.registrations?.length" title="No registered courses" text="Select courses above to register for this semester." />
        <div v-else class="overflow-x-auto">
          <table class="table-base">
            <thead>
              <tr>
                <th>Code</th>
                <th>Title</th>
                <th class="text-right">Units</th>
                <th>Registered on</th>
                <th class="text-right"><span class="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="registration in registered.data.value.registrations" :key="registration.id">
                <td class="font-medium whitespace-nowrap">{{ registration.course?.code }}</td>
                <td class="min-w-56">{{ registration.course?.title }}</td>
                <td class="text-right">{{ registration.course?.units }}</td>
                <td class="whitespace-nowrap">{{ formatDate(registration.registration_date) }}</td>
                <td class="text-right">
                  <button
                    class="btn btn-ghost btn-sm text-rose-600 hover:bg-rose-50"
                    :disabled="droppingId === registration.id"
                    @click="drop(registration)"
                  >
                    {{ droppingId === registration.id ? 'Dropping…' : 'Drop' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  </div>
</template>
