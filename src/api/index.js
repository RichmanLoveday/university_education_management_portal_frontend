import client from './client'

const data = (request) => request.then((response) => response.data.data)
const message = (request) => request.then((response) => response.data)

function resource(base) {
  return {
    list: (params) => data(client.get(base, { params })),
    get: (id) => data(client.get(`${base}/${id}`)),
    create: (payload) => message(client.post(base, payload)),
    update: (id, payload) => message(client.put(`${base}/${id}`, payload)),
    remove: (id) => message(client.delete(`${base}/${id}`)),
  }
}

export const authApi = {
  login: (credentials) => client.post('/auth/login', credentials).then((r) => r.data),
  me: () => client.get('/auth/me').then((r) => r.data.user),
  logout: () => client.post('/auth/logout'),
  logoutAll: () => client.post('/auth/logout-all'),
}

export const studentApi = {
  dashboard: () => data(client.get('/student/dashboard')),
  profile: () => data(client.get('/student/profile')),
  updateProfile: (payload) => message(client.patch('/student/profile', payload)),
  availableCourses: () => data(client.get('/student/courses/available')),
  registrations: (params) => data(client.get('/student/course-registrations', { params })),
  register: (courseIds) => message(client.post('/student/course-registrations', { course_ids: courseIds })),
  drop: (id) => message(client.delete(`/student/course-registrations/${id}`)),
  slip: () => data(client.get('/student/course-registrations/slip')),
  results: (params) => data(client.get('/student/results', { params })),
  statement: () => data(client.get('/student/results/statement')),
}

export const lecturerApi = {
  dashboard: () => data(client.get('/lecturer/dashboard')),
  courses: (params) => data(client.get('/lecturer/courses', { params })),
  course: (id) => data(client.get(`/lecturer/courses/${id}`)),
  summary: (id) => data(client.get(`/lecturer/courses/${id}/summary`)),
  resultSheet: (id) => data(client.get(`/lecturer/courses/${id}/results`)),
  saveResults: (id, results) => message(client.post(`/lecturer/courses/${id}/results`, { results })),
  submitResults: (id, resultIds) =>
    message(client.post(`/lecturer/courses/${id}/results/submit`, resultIds?.length ? { result_ids: resultIds } : {})),
  result: (id) => data(client.get(`/lecturer/results/${id}`)),
}

const DA = '/department-admin'
export const departmentAdminApi = {
  dashboard: () => data(client.get(`${DA}/dashboard`)),
  students: resource(`${DA}/students`),
  lecturers: resource(`${DA}/lecturers`),
  programs: resource(`${DA}/programs`),
  courses: resource(`${DA}/courses`),
  allocations: resource(`${DA}/course-allocations`),
  registrations: (params) => data(client.get(`${DA}/course-registrations`, { params })),
  submissions: (params) => data(client.get(`${DA}/results/submissions`, { params })),
  courseResults: (allocationId, params) => data(client.get(`${DA}/results/courses/${allocationId}`, { params })),
  approve: (allocationId, payload) => message(client.post(`${DA}/results/courses/${allocationId}/approve`, payload)),
  reject: (allocationId, payload) => message(client.post(`${DA}/results/courses/${allocationId}/reject`, payload)),
  reopen: (allocationId, payload) => message(client.post(`${DA}/results/courses/${allocationId}/reopen`, payload)),
  result: (id) => data(client.get(`${DA}/results/${id}`)),
  reports: {
    students: (params) => data(client.get(`${DA}/reports/students`, { params })),
    registrations: (params) => data(client.get(`${DA}/reports/course-registrations`, { params })),
    performance: (params) => data(client.get(`${DA}/reports/academic-performance`, { params })),
  },
}

const SA = '/super-admin'
export const superAdminApi = {
  dashboard: () => data(client.get(`${SA}/dashboard`)),
  faculties: resource(`${SA}/faculties`),
  departments: resource(`${SA}/departments`),
  departmentAdmins: resource(`${SA}/department-admins`),
  programs: resource(`${SA}/programs`),
  sessions: {
    ...resource(`${SA}/academic-sessions`),
    setCurrent: (id) => message(client.post(`${SA}/academic-sessions/${id}/set-current`)),
  },
  semesters: {
    ...resource(`${SA}/semesters`),
    setCurrent: (id) => message(client.post(`${SA}/semesters/${id}/set-current`)),
  },
  students: resource(`${SA}/students`),
  lecturers: resource(`${SA}/lecturers`),
  courses: resource(`${SA}/courses`),
  allocations: resource(`${SA}/course-allocations`),
  gradingScales: resource(`${SA}/grading-scales`),
  users: {
    ...resource(`${SA}/users`),
    updateStatus: (id, isActive) => message(client.patch(`${SA}/users/${id}/status`, { is_active: isActive })),
    updateRole: (id, role) => message(client.patch(`${SA}/users/${id}/role`, { role })),
  },
  registrations: (params) => data(client.get(`${SA}/course-registrations`, { params })),
  results: (params) => data(client.get(`${SA}/results`, { params })),
  result: (id) => data(client.get(`${SA}/results/${id}`)),
  auditLogs: (params) => data(client.get(`${SA}/audit-logs`, { params })),
  reports: {
    students: (params) => data(client.get(`${SA}/reports/students`, { params })),
    registrations: (params) => data(client.get(`${SA}/reports/course-registrations`, { params })),
    performance: (params) => data(client.get(`${SA}/reports/academic-performance`, { params })),
  },
}
