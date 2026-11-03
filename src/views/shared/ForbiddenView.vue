<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { ROLE_HOME } from '@/utils/roles'

const auth = useAuthStore()
const home = computed(() => (auth.isAuthenticated ? { name: ROLE_HOME[auth.role] } : { name: 'login' }))
</script>

<template>
  <div class="flex min-h-screen flex-col items-center justify-center px-4 text-center">
    <p class="text-sm font-semibold text-rose-600">403</p>
    <h1 class="mt-2 text-3xl font-bold text-slate-900">Access denied</h1>
    <p class="mt-2 max-w-md text-slate-500">Your account does not have permission to view this page.</p>
    <RouterLink :to="home" class="btn btn-primary mt-6">Go to my dashboard</RouterLink>
  </div>
</template>
