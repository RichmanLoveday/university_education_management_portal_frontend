import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ROLE_HOME } from '@/utils/roles'
import { setUnauthorizedHandler } from '@/api/client'
import roleRoutes from './routes'

const routes = [
  { path: '/', name: 'home', redirect: () => ({ name: 'login' }) },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: { guestOnly: true, title: 'Sign in' },
  },
  ...roleRoutes,
  {
    path: '/forbidden',
    name: 'forbidden',
    component: () => import('@/views/shared/ForbiddenView.vue'),
    meta: { title: 'Access denied' },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/shared/NotFoundView.vue'),
    meta: { title: 'Page not found' },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  await auth.resolveUser()

  if (to.name === 'home' || to.meta.guestOnly) {
    return auth.isAuthenticated ? { name: ROLE_HOME[auth.role] } : to.name === 'home' ? { name: 'login' } : true
  }

  const requiredRoles = to.matched.flatMap((record) => record.meta.roles ?? [])
  if (!requiredRoles.length) return true

  if (!auth.isAuthenticated) return { name: 'login', query: { redirect: to.fullPath } }
  if (!requiredRoles.includes(auth.role)) return { name: 'forbidden' }
  return true
})

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} · UEMP` : 'UEMP Portal'
})

setUnauthorizedHandler(() => {
  const auth = useAuthStore()
  auth.clearSession()
  if (router.currentRoute.value.name !== 'login') {
    router.push({ name: 'login', query: { expired: '1' } })
  }
})

export default router
