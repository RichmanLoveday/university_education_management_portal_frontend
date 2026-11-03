import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { authApi } from '@/api'
import { tokenStorage } from '@/api/client'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(tokenStorage.get())
  const resolved = ref(false)

  const isAuthenticated = computed(() => Boolean(token.value && user.value))
  const role = computed(() => user.value?.role ?? null)

  function setSession(newToken, newUser) {
    token.value = newToken
    user.value = newUser
    tokenStorage.set(newToken)
    resolved.value = true
  }

  function clearSession() {
    token.value = null
    user.value = null
    tokenStorage.clear()
  }

  async function login(credentials) {
    const { token: newToken, user: newUser } = await authApi.login(credentials)
    setSession(newToken, newUser)
    return newUser
  }

  // Restores the user from a stored token once per page load
  async function resolveUser() {
    if (resolved.value) return user.value
    resolved.value = true
    if (!token.value) return null
    try {
      user.value = await authApi.me()
    } catch {
      clearSession()
    }
    return user.value
  }

  async function refreshUser() {
    user.value = await authApi.me()
  }

  async function logout({ allDevices = false } = {}) {
    try {
      await (allDevices ? authApi.logoutAll() : authApi.logout())
    } finally {
      clearSession()
    }
  }

  return { user, token, role, isAuthenticated, login, logout, resolveUser, refreshUser, clearSession }
})
