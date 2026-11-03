import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { ROLES } from '@/utils/roles'
import studentRoutes from './student'
import lecturerRoutes from './lecturer'
import departmentAdminRoutes from './departmentAdmin'

function roleArea(path, role, children) {
  return { path, component: DashboardLayout, meta: { roles: [role] }, children }
}

export default [
  roleArea('/student', ROLES.STUDENT, studentRoutes),
  roleArea('/lecturer', ROLES.LECTURER, lecturerRoutes),
  roleArea('/department-admin', ROLES.DEPARTMENT_ADMIN, departmentAdminRoutes),
]
