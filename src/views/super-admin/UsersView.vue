<script setup>
import { ref } from 'vue'
import { superAdminApi } from '@/api'
import { errorMessage } from '@/api/client'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { useConfirmStore } from '@/stores/confirm'
import { ROLE_LABELS } from '@/utils/roles'
import { formatDateTime } from '@/utils/format'
import { ACTIVE_FILTER } from '@/utils/forms'
import ResourceManager from '@/components/ResourceManager.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import AppModal from '@/components/ui/AppModal.vue'
import FormField from '@/components/ui/FormField.vue'

const auth = useAuthStore()
const toast = useToastStore()
const confirm = useConfirmStore()

const roleOptions = Object.entries(ROLE_LABELS).map(([value, label]) => ({ value, label }))

const columns = [
  { key: 'name', label: 'Name', class: 'whitespace-nowrap font-medium' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role', format: (value) => ROLE_LABELS[value] ?? value, class: 'whitespace-nowrap' },
  { key: 'last_login_at', label: 'Last sign in', format: formatDateTime, class: 'whitespace-nowrap' },
  { key: 'is_active', label: 'Status' },
]

const filters = [
  { key: 'search', type: 'search', placeholder: 'Search name or email' },
  { key: 'role', options: roleOptions, placeholder: 'All roles' },
  ACTIVE_FILTER,
]

const fields = (mode) => [
  { key: 'name', label: 'Full name', required: true, full: true },
  { key: 'email', label: 'Email address', type: 'email', required: true, full: true },
  {
    key: 'password',
    label: mode === 'create' ? 'Password' : 'New password',
    type: 'password',
    required: mode === 'create',
    hint: mode === 'create' ? 'At least 8 characters.' : 'Leave blank to keep the current password.',
  },
  ...(mode === 'create'
    ? [
        { key: 'role', label: 'Role', type: 'select', options: roleOptions, required: true },
        { key: 'is_active', label: 'Account is active', type: 'checkbox', full: true },
      ]
    : []),
]

const toForm = (record) => ({
  name: record?.name ?? '',
  email: record?.email ?? '',
  password: '',
  role: record?.role ?? '',
  is_active: record?.is_active ?? true,
})

function toPayload(form, mode) {
  const payload = { name: form.name.trim(), email: form.email.trim() }
  if (form.password) payload.password = form.password
  if (mode === 'create') Object.assign(payload, { role: form.role || null, is_active: form.is_active })
  return payload
}

const isSelf = (row) => row.id === auth.user?.id

async function toggleStatus(row, reload) {
  const activate = !row.is_active
  const ok = await confirm.ask({
    title: `${activate ? 'Activate' : 'Suspend'} account?`,
    message: activate
      ? `${row.name} will be able to sign in again.`
      : `${row.name} will be signed out and blocked from signing in until reactivated.`,
    confirmText: activate ? 'Activate' : 'Suspend',
    tone: activate ? 'success' : 'danger',
  })
  if (!ok) return
  try {
    const response = await superAdminApi.users.updateStatus(row.id, activate)
    toast.success(response.message ?? 'Account status updated.')
    reload()
  } catch (err) {
    toast.error(errorMessage(err))
  }
}

const roleTarget = ref(null)
const newRole = ref('')
const savingRole = ref(false)
let reloadList = () => {}

function openRole(row, reload) {
  roleTarget.value = row
  newRole.value = row.role
  reloadList = reload
}

async function saveRole() {
  savingRole.value = true
  try {
    const response = await superAdminApi.users.updateRole(roleTarget.value.id, newRole.value)
    toast.success(response.message ?? 'Role updated.')
    roleTarget.value = null
    reloadList()
  } catch (err) {
    toast.error(errorMessage(err))
  } finally {
    savingRole.value = false
  }
}
</script>

<template>
  <div>
    <ResourceManager
      title="Users & Roles"
      subtitle="Manage every account, its role and whether it can sign in."
      entity="User"
      :resource="superAdminApi.users"
      :columns="columns"
      :filters="filters"
      :fields="fields"
      :to-form="toForm"
      :to-payload="toPayload"
      :can-delete="false"
    >
      <template #cell-is_active="{ value }"><StatusBadge :status="value" /></template>
      <template #row-actions="{ row, reload }">
        <template v-if="!isSelf(row)">
          <button class="btn btn-ghost btn-sm" @click="openRole(row, reload)">Role</button>
          <button
            class="btn btn-ghost btn-sm"
            :class="row.is_active ? 'text-rose-600 hover:bg-rose-50' : 'text-emerald-700 hover:bg-emerald-50'"
            @click="toggleStatus(row, reload)"
          >
            {{ row.is_active ? 'Suspend' : 'Activate' }}
          </button>
        </template>
        <span v-else class="self-center px-2 text-xs text-slate-400">You</span>
      </template>
    </ResourceManager>

    <AppModal :open="Boolean(roleTarget)" title="Change role" size="sm" @close="roleTarget = null">
      <div class="space-y-4">
        <p class="text-sm text-slate-600">
          Change the role for <strong>{{ roleTarget?.name }}</strong>. Their permissions change on their next request.
        </p>
        <FormField v-model="newRole" type="select" label="Role" :options="roleOptions" required />
      </div>
      <template #footer>
        <button class="btn btn-secondary" @click="roleTarget = null">Cancel</button>
        <button class="btn btn-primary" :disabled="savingRole || !newRole || newRole === roleTarget?.role" @click="saveRole">
          {{ savingRole ? 'Saving…' : 'Update role' }}
        </button>
      </template>
    </AppModal>
  </div>
</template>
