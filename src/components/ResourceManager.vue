<script setup>
import { computed, ref, useSlots } from 'vue'
import { errorMessage, validationErrors } from '@/api/client'
import { usePaginatedList } from '@/composables/usePaginatedList'
import { useToastStore } from '@/stores/toast'
import { useConfirmStore } from '@/stores/confirm'
import PageHeader from './ui/PageHeader.vue'
import DataTable from './ui/DataTable.vue'
import PaginationBar from './ui/PaginationBar.vue'
import AppModal from './ui/AppModal.vue'
import FormField from './ui/FormField.vue'
import ErrorState from './ui/ErrorState.vue'
import AppIcon from './ui/AppIcon.vue'

const props = defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  entity: { type: String, required: true },
  resource: { type: Object, required: true },
  columns: { type: Array, required: true },
  filters: { type: Array, default: () => [] },
  initialFilters: { type: Object, default: () => ({}) },
  fields: { type: Function, default: () => [] },
  toForm: { type: Function, default: (record) => ({ ...(record ?? {}) }) },
  toPayload: { type: Function, default: null },
  canCreate: { type: Boolean, default: true },
  canEdit: { type: [Boolean, Function], default: true },
  canDelete: { type: [Boolean, Function], default: true },
  deleteMessage: { type: Function, default: null },
  emptyText: { type: String, default: '' },
})

const slots = useSlots()
const toast = useToastStore()
const confirm = useConfirmStore()

const { rows, meta, loading, error, filters: activeFilters, load, setPage } = usePaginatedList(props.resource.list, {
  ...Object.fromEntries(props.filters.map((filter) => [filter.key, ''])),
  ...props.initialFilters,
})

const modalOpen = ref(false)
const mode = ref('create')
const editing = ref(null)
const form = ref({})
const formErrors = ref({})
const saving = ref(false)

const formFields = computed(() => props.fields(mode.value, form.value, editing.value))
const tableColumns = computed(() =>
  props.canEdit || props.canDelete || slots['row-actions']
    ? [...props.columns, { key: '__actions', label: '', align: 'right' }]
    : props.columns,
)

const allowed = (rule, row) => (typeof rule === 'function' ? rule(row) : rule)

function openCreate() {
  mode.value = 'create'
  editing.value = null
  form.value = props.toForm(null)
  formErrors.value = {}
  modalOpen.value = true
}

function openEdit(row) {
  mode.value = 'edit'
  editing.value = row
  form.value = props.toForm(row)
  formErrors.value = {}
  modalOpen.value = true
}

function defaultPayload(values) {
  const keys = formFields.value.map((field) => field.key)
  return Object.fromEntries(keys.map((key) => [key, values[key] === '' ? null : values[key]]))
}

async function save() {
  saving.value = true
  formErrors.value = {}
  try {
    const payload = (props.toPayload ?? defaultPayload)(form.value, mode.value, editing.value)
    const response =
      mode.value === 'create'
        ? await props.resource.create(payload)
        : await props.resource.update(editing.value.id, payload)
    toast.success(response?.message ?? `${props.entity} saved.`)
    modalOpen.value = false
    load()
  } catch (err) {
    formErrors.value = validationErrors(err)
    if (!Object.keys(formErrors.value).length) toast.error(errorMessage(err))
  } finally {
    saving.value = false
  }
}

async function destroy(row) {
  const ok = await confirm.ask({
    title: `Delete ${props.entity.toLowerCase()}?`,
    message: props.deleteMessage?.(row) ?? 'This action cannot be undone.',
    confirmText: 'Delete',
    tone: 'danger',
  })
  if (!ok) return
  try {
    const response = await props.resource.remove(row.id)
    toast.success(response?.message ?? `${props.entity} deleted.`)
    if (rows.value.length === 1 && meta.value?.current_page > 1) setPage(meta.value.current_page - 1)
    else load()
  } catch (err) {
    toast.error(errorMessage(err))
  }
}

defineExpose({ reload: load, openEdit })
</script>

<template>
  <div>
    <PageHeader :title="title" :subtitle="subtitle">
      <template #actions>
        <slot name="actions" />
        <button v-if="canCreate" class="btn btn-primary" @click="openCreate">
          <AppIcon name="plus" :size="16" /> New {{ entity.toLowerCase() }}
        </button>
      </template>
    </PageHeader>

    <div class="card overflow-hidden">
      <div v-if="filters.length" class="grid gap-3 border-b border-slate-200 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div v-for="filter in filters" :key="filter.key" :class="filter.type === 'search' && 'sm:col-span-2 lg:col-span-1'">
          <div v-if="filter.type === 'search'" class="relative">
            <AppIcon name="search" :size="16" class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
            <input
              v-model="activeFilters[filter.key]"
              type="search"
              class="input pl-9"
              :placeholder="filter.placeholder ?? 'Search…'"
              :aria-label="filter.placeholder ?? 'Search'"
            />
          </div>
          <FormField
            v-else
            v-model="activeFilters[filter.key]"
            :type="filter.type ?? 'select'"
            :options="filter.options?.value ?? filter.options ?? []"
            :placeholder="filter.placeholder"
          />
        </div>
      </div>

      <ErrorState v-if="error" :message="error" class="m-4 border-0 shadow-none" @retry="load" />
      <DataTable v-else :columns="tableColumns" :rows="rows" :loading="loading" :empty-text="emptyText">
        <template v-for="column in columns" #[`cell-${column.key}`]="slotProps" :key="column.key">
          <slot :name="`cell-${column.key}`" v-bind="slotProps">
            {{ column.format ? column.format(slotProps.value, slotProps.row) : (slotProps.value ?? '—') }}
          </slot>
        </template>
        <template #cell-__actions="{ row }">
          <div class="flex justify-end gap-1">
            <slot name="row-actions" :row="row" :reload="load" />
            <button v-if="allowed(canEdit, row)" class="btn btn-ghost btn-sm" :aria-label="`Edit ${entity}`" @click="openEdit(row)">
              <AppIcon name="edit" :size="16" />
            </button>
            <button
              v-if="allowed(canDelete, row)"
              class="btn btn-ghost btn-sm text-rose-600 hover:bg-rose-50"
              :aria-label="`Delete ${entity}`"
              @click="destroy(row)"
            >
              <AppIcon name="trash" :size="16" />
            </button>
          </div>
        </template>
      </DataTable>
      <PaginationBar :meta="meta" @change="setPage" />
    </div>

    <AppModal :open="modalOpen" :title="`${mode === 'create' ? 'New' : 'Edit'} ${entity.toLowerCase()}`" size="lg" @close="modalOpen = false">
      <form id="resource-form" class="grid gap-4 sm:grid-cols-2" novalidate @submit.prevent="save">
        <FormField
          v-for="field in formFields"
          :key="field.key"
          v-model="form[field.key]"
          :class="field.full && 'sm:col-span-2'"
          :label="field.label"
          :type="field.type ?? 'text'"
          :options="field.options?.value ?? field.options ?? []"
          :placeholder="field.placeholder"
          :required="field.required"
          :disabled="field.disabled"
          :hint="field.hint"
          :min="field.min"
          :max="field.max"
          :step="field.step"
          :autocomplete="field.type === 'password' ? 'new-password' : undefined"
          :error="formErrors[field.key]"
        />
      </form>
      <template #footer>
        <button class="btn btn-secondary" type="button" @click="modalOpen = false">Cancel</button>
        <button class="btn btn-primary" type="submit" form="resource-form" :disabled="saving">
          {{ saving ? 'Saving…' : mode === 'create' ? `Create ${entity.toLowerCase()}` : 'Save changes' }}
        </button>
      </template>
    </AppModal>
  </div>
</template>
