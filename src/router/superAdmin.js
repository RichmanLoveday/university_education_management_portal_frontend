const view = (name) => () => import(`@/views/super-admin/${name}.vue`)

const pages = [
  ['dashboard', 'dashboard', 'AdminDashboard', 'Dashboard'],
  ['faculties', 'faculties', 'FacultiesView', 'Faculties'],
  ['departments', 'departments', 'DepartmentsView', 'Departments'],
  ['programs', 'programs', 'ProgramsView', 'Programs'],
  ['sessions', 'sessions', 'SessionsView', 'Sessions & Semesters'],
  ['grading-scale', 'grading', 'GradingScaleView', 'Grading Scale'],
  ['courses', 'courses', 'CoursesView', 'Courses'],
  ['course-allocations', 'allocations', 'AllocationsView', 'Course Allocations'],
  ['students', 'students', 'StudentsView', 'Students'],
  ['lecturers', 'lecturers', 'LecturersView', 'Lecturers'],
  ['users', 'users', 'UsersView', 'Users & Roles'],
  ['department-admins', 'department-admins', 'DepartmentAdminsView', 'Department Admins'],
  ['course-registrations', 'registrations', 'RegistrationsMonitor', 'Course Registrations'],
  ['results', 'results', 'ResultsMonitor', 'Results'],
  ['audit-logs', 'audit-logs', 'AuditLogsView', 'Audit Logs'],
  ['reports', 'reports', 'AdminReports', 'Reports'],
]

export default [
  { path: '', redirect: { name: 'super-admin.dashboard' } },
  ...pages.map(([path, name, component, title]) => ({
    path,
    name: `super-admin.${name}`,
    component: view(component),
    meta: { title },
  })),
]
