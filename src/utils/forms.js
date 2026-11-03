import { ACADEMIC_LEVELS, SEMESTER_NUMBERS, levelLabel, semesterLabel } from './format'

// Field and column definitions shared by the Department Admin and Super Admin screens.
// Pass `departments` to add the department selector the Super Admin needs.

export const ACTIVE_FILTER = {
  key: 'is_active',
  placeholder: 'All statuses',
  options: [
    { value: 1, label: 'Active' },
    { value: 0, label: 'Inactive' },
  ],
}

export const programColumns = [
  { key: 'code', label: 'Code', class: 'whitespace-nowrap font-medium' },
  { key: 'name', label: 'Program' },
  { key: 'degree_type', label: 'Degree' },
  { key: 'duration_years', label: 'Duration', format: (value) => (value ? `${value} years` : '—') },
  { key: 'students_count', label: 'Students', align: 'right' },
  { key: 'is_active', label: 'Status' },
]

export function programFields(mode, _form, _record, departments = null) {
  return [
    ...(departments ? [{ key: 'department_id', label: 'Department', type: 'select', options: departments, required: true, full: true }] : []),
    { key: 'name', label: 'Program name', required: true, placeholder: 'B.Sc Computer Science', full: true },
    { key: 'code', label: 'Code', required: true, placeholder: 'BSC-CSC' },
    { key: 'degree_type', label: 'Degree type', placeholder: 'B.Sc' },
    { key: 'duration_years', label: 'Duration (years)', type: 'number', min: 1, max: 7 },
    ...(mode === 'edit' ? [{ key: 'is_active', label: 'Active program', type: 'checkbox', full: true }] : []),
  ]
}

export const programToForm = (record) => ({
  department_id: record?.department_id ?? '',
  name: record?.name ?? '',
  code: record?.code ?? '',
  degree_type: record?.degree_type ?? '',
  duration_years: record?.duration_years ?? 4,
  is_active: record?.is_active ?? true,
})

export const courseColumns = [
  { key: 'code', label: 'Code', class: 'whitespace-nowrap font-medium' },
  { key: 'title', label: 'Title', class: 'min-w-56' },
  { key: 'units', label: 'Units', align: 'right' },
  { key: 'level', label: 'Level', format: levelLabel, class: 'whitespace-nowrap' },
  { key: 'semester', label: 'Semester', format: semesterLabel, class: 'whitespace-nowrap' },
  { key: 'is_active', label: 'Status' },
]

export function courseFields(mode, _form, _record, departments = null) {
  return [
    ...(departments ? [{ key: 'department_id', label: 'Department', type: 'select', options: departments, required: true, full: true }] : []),
    { key: 'code', label: 'Course code', required: true, placeholder: 'CSC 401' },
    { key: 'units', label: 'Credit units', type: 'number', min: 1, max: 10, required: true },
    { key: 'title', label: 'Course title', required: true, full: true },
    { key: 'level', label: 'Level', type: 'select', options: ACADEMIC_LEVELS, required: true },
    { key: 'semester', label: 'Semester', type: 'select', options: SEMESTER_NUMBERS, required: true },
    { key: 'description', label: 'Description', type: 'textarea', full: true },
    ...(mode === 'edit' ? [{ key: 'is_active', label: 'Active course', type: 'checkbox', full: true }] : []),
  ]
}

export const courseToForm = (record) => ({
  department_id: record?.department_id ?? '',
  code: record?.code ?? '',
  title: record?.title ?? '',
  units: record?.units ?? 3,
  level: record?.level ?? '',
  semester: record?.semester ?? '',
  description: record?.description ?? '',
  is_active: record?.is_active ?? true,
})

export const courseFilters = (extra = []) => [
  { key: 'search', type: 'search', placeholder: 'Search code or title' },
  ...extra,
  { key: 'level', options: ACADEMIC_LEVELS, placeholder: 'All levels' },
  { key: 'semester', options: SEMESTER_NUMBERS, placeholder: 'Both semesters' },
]
