export default [
  { path: '', redirect: { name: 'lecturer.dashboard' } },
  {
    path: 'dashboard',
    name: 'lecturer.dashboard',
    component: () => import('@/views/lecturer/LecturerDashboard.vue'),
    meta: { title: 'Dashboard' },
  },
  {
    path: 'courses',
    name: 'lecturer.courses',
    component: () => import('@/views/lecturer/LecturerCourses.vue'),
    meta: { title: 'My Courses' },
  },
  {
    path: 'courses/:id',
    name: 'lecturer.course',
    component: () => import('@/views/lecturer/LecturerCourse.vue'),
    props: true,
    meta: { title: 'Course', navParent: 'lecturer.courses' },
  },
]
