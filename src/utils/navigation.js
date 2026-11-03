export const navigation = {
  student: [
    {
      items: [
        { label: 'Dashboard', to: 'student.dashboard', icon: 'home' },
        { label: 'My Profile', to: 'student.profile', icon: 'user' },
        { label: 'Course Registration', to: 'student.registration', icon: 'clipboard' },
        { label: 'Results', to: 'student.results', icon: 'graduation' },
      ],
    },
    {
      title: 'Documents',
      items: [
        { label: 'Registration Slip', to: 'student.slip', icon: 'printer' },
        { label: 'Statement of Result', to: 'student.statement', icon: 'file' },
      ],
    },
  ],
  lecturer: [
    {
      items: [
        { label: 'Dashboard', to: 'lecturer.dashboard', icon: 'home' },
        { label: 'My Courses', to: 'lecturer.courses', icon: 'book' },
      ],
    },
  ],
  department_admin: [
    {
      items: [{ label: 'Dashboard', to: 'department-admin.dashboard', icon: 'home' }],
    },
    {
      title: 'Academics',
      items: [
        { label: 'Students', to: 'department-admin.students', icon: 'users' },
        { label: 'Lecturers', to: 'department-admin.lecturers', icon: 'user' },
        { label: 'Programs', to: 'department-admin.programs', icon: 'layers' },
        { label: 'Courses', to: 'department-admin.courses', icon: 'book' },
        { label: 'Course Allocations', to: 'department-admin.allocations', icon: 'link' },
        { label: 'Course Registrations', to: 'department-admin.registrations', icon: 'clipboard' },
      ],
    },
    {
      title: 'Results',
      items: [
        { label: 'Result Approval', to: 'department-admin.results', icon: 'check' },
        { label: 'Reports', to: 'department-admin.reports', icon: 'chart' },
      ],
    },
  ],
  super_admin: [
    {
      items: [{ label: 'Dashboard', to: 'super-admin.dashboard', icon: 'home' }],
    },
    {
      title: 'Structure',
      items: [
        { label: 'Faculties', to: 'super-admin.faculties', icon: 'building' },
        { label: 'Departments', to: 'super-admin.departments', icon: 'layers' },
        { label: 'Programs', to: 'super-admin.programs', icon: 'graduation' },
        { label: 'Sessions & Semesters', to: 'super-admin.sessions', icon: 'calendar' },
        { label: 'Grading Scale', to: 'super-admin.grading', icon: 'scale' },
      ],
    },
    {
      title: 'Academics',
      items: [
        { label: 'Courses', to: 'super-admin.courses', icon: 'book' },
        { label: 'Course Allocations', to: 'super-admin.allocations', icon: 'link' },
        { label: 'Students', to: 'super-admin.students', icon: 'users' },
        { label: 'Lecturers', to: 'super-admin.lecturers', icon: 'user' },
      ],
    },
    {
      title: 'Administration',
      items: [
        { label: 'Users & Roles', to: 'super-admin.users', icon: 'shield' },
        { label: 'Department Admins', to: 'super-admin.department-admins', icon: 'user' },
      ],
    },
    {
      title: 'Oversight',
      items: [
        { label: 'Course Registrations', to: 'super-admin.registrations', icon: 'clipboard' },
        { label: 'Results', to: 'super-admin.results', icon: 'check' },
        { label: 'Audit Logs', to: 'super-admin.audit-logs', icon: 'history' },
        { label: 'Reports', to: 'super-admin.reports', icon: 'chart' },
      ],
    },
  ],
}
