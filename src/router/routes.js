import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { ROLES } from '@/utils/roles'
import studentRoutes from './student'

function roleArea(path, role, children) {
  return { path, component: DashboardLayout, meta: { roles: [role] }, children }
}

export default [roleArea('/student', ROLES.STUDENT, studentRoutes)]
