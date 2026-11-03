<script setup>
import { superAdminApi } from '@/api'
import { useOptions } from '@/composables/useOptions'
import { useDepartmentOptions, useSemesterOptions, useSessionOptions } from '@/composables/useSuperAdminLookups'
import { periodLabel } from '@/utils/format'
import ResourceManager from '@/components/ResourceManager.vue'

const { options: departmentOptions } = useDepartmentOptions()
const { options: sessionOptions } = useSessionOptions()
const { options: semesterOptions, forSession } = useSemesterOptions()
const { options: courseOptions } = useOptions(superAdminApi.courses.list, (course) => ({
  value: course.id,
  label: `${course.code} — ${course.title}`,
  departmentId: course.department_id,
}))
const { options: lecturerOptions } = useOptions(superAdminApi.lecturers.list, (lecturer) => ({
  value: lecturer.id,
  label: `${lecturer.user?.name} (${lecturer.department?.code ?? lecturer.staff_id})`,
  departmentId: lecturer.department_id,
}))

const columns = [
  { key: 'course.code', label: 'Course', class: 'whitespace-nowrap font-medium' },
  { key: 'course.title', label: 'Title', class: 'min-w-56' },
  { key: 'course.department.code', label: 'Dept.' },
  { key: 'lecturer.user.name', label: 'Lecturer', class: 'whitespace-nowrap' },
  { key: 'period', label: 'Session', class: 'whitespace-nowrap', format: (_, row) => periodLabel(row.academic_session, row.semester) },
]

const filters = [
  { key: 'search', type: 'search', placeholder: 'Search course code or title' },
  { key: 'department_id', options: departmentOptions, placeholder: 'All departments' },
  { key: 'academic_session_id', options: sessionOptions, placeholder: 'All sessions' },
  { key: 'semester_id', options: semesterOptions, placeholder: 'All semesters' },
]

// Lecturers are limited to the course's department and semesters to the chosen session
function fields(_mode, form) {
  const departmentId = courseOptions.value.find((course) => course.value === form.course_id)?.departmentId
  return [
    { key: 'course_id', label: 'Course', type: 'select', options: courseOptions, required: true, full: true },
    {
      key: 'lecturer_id',
      label: 'Lecturer',
      type: 'select',
      options: lecturerOptions.value.filter((lecturer) => !departmentId || lecturer.departmentId === departmentId),
      required: true,
      full: true,
    },
    { key: 'academic_session_id', label: 'Academic session', type: 'select', options: sessionOptions, required: true },
    { key: 'semester_id', label: 'Semester', type: 'select', options: forSession(form.academic_session_id), required: true },
  ]
}

const toForm = (record) => ({
  course_id: record?.course_id ?? '',
  lecturer_id: record?.lecturer_id ?? '',
  academic_session_id: record?.academic_session_id ?? sessionOptions.value.find((option) => option.isCurrent)?.value ?? '',
  semester_id: record?.semester_id ?? '',
})
</script>

<template>
  <ResourceManager
    title="Course Allocations"
    subtitle="Assign lecturers to courses for a session and semester."
    entity="Allocation"
    :resource="superAdminApi.allocations"
    :columns="columns"
    :filters="filters"
    :fields="fields"
    :to-form="toForm"
    :delete-message="(row) => `Remove ${row.lecturer?.user?.name} from ${row.course?.code} for ${periodLabel(row.academic_session, row.semester)}?`"
  />
</template>
