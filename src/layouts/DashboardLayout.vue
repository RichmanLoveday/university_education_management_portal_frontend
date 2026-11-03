<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { navigation } from '@/utils/navigation'
import { ROLE_LABELS } from '@/utils/roles'
import AppIcon from '@/components/ui/AppIcon.vue'

const auth = useAuthStore()
const toast = useToastStore()
const route = useRoute()
const router = useRouter()

const sidebarOpen = ref(false)
const menuOpen = ref(false)
const signingOut = ref(false)

const sections = computed(() => navigation[auth.role] ?? [])
const initials = computed(() =>
  (auth.user?.name ?? '')
    .replace(/^(Dr|Mr|Mrs|Ms|Prof|Engr)\.?\s+/i, '')
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase(),
)
const subtitle = computed(() => {
  const profile = auth.user?.profile ?? {}
  return profile.matric_number || profile.staff_id || profile.department || ROLE_LABELS[auth.role]
})

watch(
  () => route.fullPath,
  () => {
    sidebarOpen.value = false
    menuOpen.value = false
  },
)

function isActive(name) {
  return route.matched.some((record) => record.name === name || record.meta.navParent === name)
}

async function signOut(allDevices = false) {
  signingOut.value = true
  try {
    await auth.logout({ allDevices })
    toast.success(allDevices ? 'Signed out from all devices.' : 'Signed out successfully.')
  } finally {
    signingOut.value = false
    router.replace({ name: 'login' })
  }
}
</script>

<template>
  <div class="min-h-screen">
    <div
      v-if="sidebarOpen"
      class="no-print fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
      aria-hidden="true"
      @click="sidebarOpen = false"
    />

    <aside
      class="no-print fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-brand-900 text-brand-100 transition-transform duration-200 lg:translate-x-0"
      :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <div class="flex h-16 items-center justify-between px-5">
        <div class="flex items-center gap-3">
          <span class="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 font-bold text-white">U</span>
          <div class="leading-tight">
            <p class="font-semibold text-white">UEMP</p>
            <p class="text-xs text-brand-100/70">{{ ROLE_LABELS[auth.role] }}</p>
          </div>
        </div>
        <button class="rounded p-1 hover:bg-white/10 lg:hidden" aria-label="Close menu" @click="sidebarOpen = false">
          <AppIcon name="close" />
        </button>
      </div>

      <nav class="flex-1 space-y-6 overflow-y-auto px-3 py-4">
        <div v-for="(section, index) in sections" :key="index">
          <p v-if="section.title" class="mb-2 px-3 text-[11px] font-semibold tracking-wider text-brand-100/50 uppercase">
            {{ section.title }}
          </p>
          <ul class="space-y-1">
            <li v-for="item in section.items" :key="item.to">
              <RouterLink
                :to="{ name: item.to }"
                class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition"
                :class="isActive(item.to) ? 'bg-white/15 font-medium text-white' : 'hover:bg-white/5 hover:text-white'"
              >
                <AppIcon :name="item.icon" :size="18" />
                {{ item.label }}
              </RouterLink>
            </li>
          </ul>
        </div>
      </nav>
    </aside>

    <div class="lg:pl-64">
      <header
        class="no-print sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6"
      >
        <button class="btn btn-ghost -ml-2 px-2 lg:hidden" aria-label="Open menu" @click="sidebarOpen = true">
          <AppIcon name="menu" />
        </button>
        <p class="hidden truncate text-sm font-medium text-slate-500 sm:block">{{ route.meta.title }}</p>

        <div class="relative ml-auto">
          <button
            class="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-slate-100"
            :aria-expanded="menuOpen"
            @click="menuOpen = !menuOpen"
          >
            <span class="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
              {{ initials }}
            </span>
            <span class="hidden text-left leading-tight sm:block">
              <span class="block max-w-48 truncate text-sm font-medium text-slate-800">{{ auth.user?.name }}</span>
              <span class="block max-w-48 truncate text-xs text-slate-500">{{ subtitle }}</span>
            </span>
            <AppIcon name="chevronDown" :size="16" class="text-slate-400" />
          </button>

          <div v-if="menuOpen" class="fixed inset-0 z-10" @click="menuOpen = false" />
          <div v-if="menuOpen" class="card absolute right-0 z-20 mt-2 w-60 py-1 text-sm shadow-lg">
            <div class="border-b border-slate-100 px-4 py-3">
              <p class="truncate font-medium text-slate-800">{{ auth.user?.name }}</p>
              <p class="truncate text-xs text-slate-500">{{ auth.user?.email }}</p>
            </div>
            <button class="flex w-full items-center gap-2 px-4 py-2 hover:bg-slate-50" :disabled="signingOut" @click="signOut()">
              <AppIcon name="logout" :size="16" /> Sign out
            </button>
            <button
              class="flex w-full items-center gap-2 px-4 py-2 text-rose-600 hover:bg-rose-50"
              :disabled="signingOut"
              @click="signOut(true)"
            >
              <AppIcon name="shield" :size="16" /> Sign out of all devices
            </button>
          </div>
        </div>
      </header>

      <main class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
        <RouterView />
      </main>
    </div>
  </div>
</template>
