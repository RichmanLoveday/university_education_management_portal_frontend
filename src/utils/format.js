export function get(object, path) {
  return path.split('.').reduce((value, key) => (value == null ? undefined : value[key]), object)
}

export function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

export function formatDateTime(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

// Converts an API timestamp to the yyyy-mm-dd value a date input expects
export function toDateInput(value) {
  return value ? String(value).slice(0, 10) : ''
}

export function formatNumber(value, digits = 2) {
  if (value === null || value === undefined || value === '') return '—'
  const number = Number(value)
  return Number.isFinite(number) ? number.toFixed(digits) : value
}

export const levelLabel = (level) => (level ? `${level} Level` : '—')
export const semesterLabel = (number) => ({ 1: 'First Semester', 2: 'Second Semester' })[number] ?? '—'

export const ACADEMIC_LEVELS = [100, 200, 300, 400, 500].map((value) => ({ value, label: `${value} Level` }))
export const SEMESTER_NUMBERS = [
  { value: 1, label: 'First Semester' },
  { value: 2, label: 'Second Semester' },
]
export const STUDENT_STATUSES = ['active', 'graduated', 'suspended', 'withdrawn'].map((value) => ({
  value,
  label: value[0].toUpperCase() + value.slice(1),
}))
export const RESULT_STATUSES = ['draft', 'submitted', 'approved', 'rejected'].map((value) => ({
  value,
  label: value[0].toUpperCase() + value.slice(1),
}))

export function personName(record) {
  return record?.user?.name ?? record?.name ?? '—'
}

export function periodLabel(session, semester) {
  return [session?.name, semester?.name].filter(Boolean).join(' · ') || '—'
}
