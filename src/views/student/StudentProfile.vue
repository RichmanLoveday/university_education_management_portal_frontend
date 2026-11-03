<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { studentApi } from '@/api'
import { errorMessage, validationErrors } from '@/api/client'
import { useAsync } from '@/composables/useAsync'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { formatDateTime, levelLabel } from '@/utils/format'
import PageHeader from '@/components/ui/PageHeader.vue'
import SectionCard from '@/components/ui/SectionCard.vue'
import FormField from '@/components/ui/FormField.vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'

const auth = useAuthStore()
const toast = useToastStore()
const { data: profile, loading, error, run } = useAsync(studentApi.profile)

const nameForm = reactive({ name: '' })
const passwordForm = reactive({ current_password: '', password: '', password_confirmation: '' })
const nameErrors = ref({})
const passwordErrors = ref({})
const savingName = ref(false)
const savingPassword = ref(false)

watch(profile, (value) => (nameForm.name = value?.user?.name ?? ''), { immediate: true })

const details = computed(() => {
  const p = profile.value
  if (!p) return []
  return [
    ['Matriculation number', p.matric_number],
    ['Email address', p.user?.email],
    ['Faculty', p.department?.faculty?.name],
    ['Department', p.department?.name],
    ['Program', p.program?.name],
    ['Academic level', levelLabel(p.academic_level)],
    ['Entry year', p.entry_year],
    ['Current session', p.current_session?.name],
  ]
})

async function saveName() {
  savingName.value = true
  nameErrors.value = {}
  try {
    const response = await studentApi.updateProfile({ name: nameForm.name.trim() })
    toast.success(response.message ?? 'Profile updated.')
    await Promise.all([run(), auth.refreshUser()])
  } catch (err) {
    nameErrors.value = validationErrors(err)
    if (!Object.keys(nameErrors.value).length) toast.error(errorMessage(err))
  } finally {
    savingName.value = false
  }
}

async function savePassword() {
  savingPassword.value = true
  passwordErrors.value = {}
  try {
    const response = await studentApi.updateProfile({ ...passwordForm })
    toast.success(response.message ?? 'Password changed.')
    Object.assign(passwordForm, { current_password: '', password: '', password_confirmation: '' })
  } catch (err) {
    passwordErrors.value = validationErrors(err)
    if (!Object.keys(passwordErrors.value).length) toast.error(errorMessage(err))
  } finally {
    savingPassword.value = false
  }
}
</script>

<template>
  <div>
    <PageHeader title="My Profile" subtitle="Academic details are managed by your department. You can update your name and password." />

    <LoadingState v-if="loading && !profile" />
    <ErrorState v-else-if="error && !profile" :message="error" @retry="run" />

    <div v-else-if="profile" class="grid gap-6 lg:grid-cols-5">
      <SectionCard title="Academic information" class="lg:col-span-3">
        <template #actions><StatusBadge :status="profile.status" /></template>
        <dl class="grid gap-x-6 gap-y-4 text-sm sm:grid-cols-2">
          <div v-for="[label, value] in details" :key="label">
            <dt class="text-slate-500">{{ label }}</dt>
            <dd class="mt-0.5 font-medium text-slate-800">{{ value ?? '—' }}</dd>
          </div>
        </dl>
        <p class="mt-6 text-xs text-slate-400">Last sign in: {{ formatDateTime(profile.user?.last_login_at) }}</p>
      </SectionCard>

      <div class="space-y-6 lg:col-span-2">
        <SectionCard title="Display name">
          <form class="space-y-4" novalidate @submit.prevent="saveName">
            <FormField v-model="nameForm.name" label="Full name" required :error="nameErrors.name" />
            <button class="btn btn-primary" :disabled="savingName || !nameForm.name.trim()">
              {{ savingName ? 'Saving…' : 'Update name' }}
            </button>
          </form>
        </SectionCard>

        <SectionCard title="Change password">
          <form class="space-y-4" novalidate @submit.prevent="savePassword">
            <FormField
              v-model="passwordForm.current_password"
              type="password"
              label="Current password"
              autocomplete="current-password"
              required
              :error="passwordErrors.current_password"
            />
            <FormField
              v-model="passwordForm.password"
              type="password"
              label="New password"
              autocomplete="new-password"
              hint="At least 8 characters."
              required
              :error="passwordErrors.password"
            />
            <FormField
              v-model="passwordForm.password_confirmation"
              type="password"
              label="Confirm new password"
              autocomplete="new-password"
              required
              :error="passwordErrors.password_confirmation"
            />
            <button class="btn btn-primary" :disabled="savingPassword || !passwordForm.current_password || !passwordForm.password">
              {{ savingPassword ? 'Saving…' : 'Change password' }}
            </button>
          </form>
        </SectionCard>
      </div>
    </div>
  </div>
</template>
