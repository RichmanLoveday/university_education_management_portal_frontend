const view = (name) => () => import(`@/views/department-admin/${name}.vue`)

export default [
  { path: '', redirect: { name: 'department-admin.dashboard' } },
  { path: 'dashboard', name: 'department-admin.dashboard', component: view('DepartmentDashboard'), meta: { title: 'Dashboard' } },
  { path: 'students', name: 'department-admin.students', component: view('DepartmentStudents'), meta: { title: 'Students' } },
  { path: 'lecturers', name: 'department-admin.lecturers', component: view('DepartmentLecturers'), meta: { title: 'Lecturers' } },
  { path: 'programs', name: 'department-admin.programs', component: view('DepartmentPrograms'), meta: { title: 'Programs' } },
  { path: 'courses', name: 'department-admin.courses', component: view('DepartmentCourses'), meta: { title: 'Courses' } },
  {
    path: 'course-allocations',
    name: 'department-admin.allocations',
    component: view('DepartmentAllocations'),
    meta: { title: 'Course Allocations' },
  },
  {
    path: 'course-registrations',
    name: 'department-admin.registrations',
    component: view('DepartmentRegistrations'),
    meta: { title: 'Course Registrations' },
  },
  { path: 'results', name: 'department-admin.results', component: view('ResultSubmissions'), meta: { title: 'Result Approval' } },
  {
    path: 'results/:allocationId',
    name: 'department-admin.course-results',
    component: view('CourseResultReview'),
    props: true,
    meta: { title: 'Review Results', navParent: 'department-admin.results' },
  },
  { path: 'reports', name: 'department-admin.reports', component: view('DepartmentReports'), meta: { title: 'Reports' } },
]
