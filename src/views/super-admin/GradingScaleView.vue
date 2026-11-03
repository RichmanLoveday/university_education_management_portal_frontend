<script setup>
import { superAdminApi } from '@/api'
import { formatNumber } from '@/utils/format'
import ResourceManager from '@/components/ResourceManager.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'

const columns = [
  { key: 'grade', label: 'Grade', class: 'font-bold' },
  { key: 'range', label: 'Score range', format: (_, row) => `${formatNumber(row.min_score)} – ${formatNumber(row.max_score)}` },
  { key: 'grade_point', label: 'Grade point', format: (value) => formatNumber(value) },
  { key: 'is_active', label: 'Status' },
]

const fields = () => [
  { key: 'grade', label: 'Grade', required: true, placeholder: 'A' },
  { key: 'grade_point', label: 'Grade point', type: 'number', min: 0, max: 5, step: 0.01, required: true },
  { key: 'min_score', label: 'Minimum score', type: 'number', min: 0, max: 100, step: 0.01, required: true },
  { key: 'max_score', label: 'Maximum score', type: 'number', min: 0, max: 100, step: 0.01, required: true },
  { key: 'is_active', label: 'Use this band when computing grades', type: 'checkbox', full: true },
]

const toForm = (record) => ({
  grade: record?.grade ?? '',
  grade_point: record ? Number(record.grade_point) : '',
  min_score: record ? Number(record.min_score) : '',
  max_score: record ? Number(record.max_score) : '',
  is_active: record?.is_active ?? true,
})
</script>

<template>
  <ResourceManager
    title="Grading Scale"
    subtitle="Score bands used to compute grades and grade points. GPA = Σ(units × grade point) ÷ Σ units."
    entity="Grade band"
    :resource="superAdminApi.gradingScales"
    :columns="columns"
    :fields="fields"
    :to-form="toForm"
    :delete-message="(row) => `Delete grade band ${row.grade}? Existing results keep their computed grades.`"
  >
    <template #cell-is_active="{ value }"><StatusBadge :status="value" /></template>
  </ResourceManager>
</template>
