<script setup>
import { get } from '@/utils/format'
import LoadingState from './LoadingState.vue'
import EmptyState from './EmptyState.vue'

defineProps({
  columns: { type: Array, required: true },
  rows: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  rowKey: { type: String, default: 'id' },
  emptyTitle: { type: String, default: 'No records found' },
  emptyText: { type: String, default: '' },
})
</script>

<template>
  <div class="overflow-x-auto">
    <LoadingState v-if="loading && !rows.length" />
    <EmptyState v-else-if="!rows.length" :title="emptyTitle" :text="emptyText" />
    <table v-else class="table-base" :class="{ 'opacity-60': loading }">
      <thead>
        <tr>
          <th v-for="column in columns" :key="column.key" :class="[column.class, column.align === 'right' && 'text-right']">
            {{ column.label }}
          </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-100 bg-white">
        <tr v-for="(row, index) in rows" :key="get(row, rowKey) ?? index" class="hover:bg-slate-50/60">
          <td v-for="column in columns" :key="column.key" :class="[column.class, column.align === 'right' && 'text-right']">
            <slot :name="`cell-${column.key}`" :row="row" :value="get(row, column.key)" :index="index">
              {{ column.format ? column.format(get(row, column.key), row) : (get(row, column.key) ?? '—') }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
