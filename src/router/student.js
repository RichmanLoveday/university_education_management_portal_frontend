export default [
  { path: '', redirect: { name: 'student.dashboard' } },
  {
    path: 'dashboard',
    name: 'student.dashboard',
    component: () => import('@/views/student/StudentDashboard.vue'),
    meta: { title: 'Dashboard' },
  },
  {
    path: 'profile',
    name: 'student.profile',
    component: () => import('@/views/student/StudentProfile.vue'),
    meta: { title: 'My Profile' },
  },
  {
    path: 'registration',
    name: 'student.registration',
    component: () => import('@/views/student/CourseRegistration.vue'),
    meta: { title: 'Course Registration' },
  },
  {
    path: 'results',
    name: 'student.results',
    component: () => import('@/views/student/StudentResults.vue'),
    meta: { title: 'Results' },
  },
  {
    path: 'registration-slip',
    name: 'student.slip',
    component: () => import('@/views/student/RegistrationSlip.vue'),
    meta: { title: 'Registration Slip' },
  },
  {
    path: 'statement',
    name: 'student.statement',
    component: () => import('@/views/student/ResultStatement.vue'),
    meta: { title: 'Statement of Result' },
  },
]
