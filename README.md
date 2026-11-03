# University Education Management Portal — Frontend

Vue 3 single-page application for the University Education Management Portal (UEMP). It consumes the
Laravel UEMP API (`university_education_management_portal_backend`) and provides a responsive dashboard
for each of the four user roles: **Student**, **Lecturer**, **Department Admin** and **Super Admin**.

## Technology stack

| Concern | Choice |
| --- | --- |
| Framework | Vue 3 (Composition API, `<script setup>`) |
| Build tool | Vite 8 |
| Routing | Vue Router 4 with role-aware navigation guards |
| State | Pinia (auth session, toasts, confirm dialog) |
| HTTP | Axios with bearer-token and 401 interceptors |
| Styling | Tailwind CSS 4 (mobile-first, print styles for slips and statements) |

## Getting started

Requirements: Node.js `22.18+` (see `.nvmrc`) and the backend API running locally (default `http://127.0.0.1:8000`).

```bash
nvm use
```

```bash
npm install
```

```bash
cp .env.example .env
```

```bash
npm run dev
```

The app runs at `http://localhost:5173`. In development every `/api` request is proxied to `VITE_API_PROXY_TARGET`,
so no CORS configuration is needed.

### Production build

```bash
npm run build
```

Set `VITE_API_BASE_URL` to the API origin (for example `https://api.example.com`) before building when the API is on a
different domain. The output in `dist/` is a static SPA: configure the host to serve `index.html` for unknown paths
(history-mode routing). Set `VITE_SHOW_DEMO_ACCOUNTS=true` to show the demo-account shortcuts on the login page in a
production build.

### Environment variables

| Variable | Purpose |
| --- | --- |
| `VITE_API_PROXY_TARGET` | Backend origin used by the dev server proxy |
| `VITE_API_BASE_URL` | Absolute API origin for production builds (empty = same origin) |
| `VITE_SHOW_DEMO_ACCOUNTS` | Show demo login shortcuts outside development |

## Test credentials

Seeded by the backend (`php artisan migrate:fresh --seed`). All accounts use the password `password`.

| Role | Email | Notes |
| --- | --- | --- |
| Super Admin | `superadmin@uemp.test` | University-wide access |
| Department Admin | `deptadmin.cs@uemp.test` | Computer Science department |
| Lecturer | `lecturer1@uemp.test` | CSC 301, CSC 302 |
| Lecturer | `lecturer2@uemp.test` | CSC 201, CSC 305 |
| Student | `student1@uemp.test` | 300 Level, has approved results |
| Student | `student2@uemp.test` | 200 Level, not yet registered |

## Features by role

### Student
- Dashboard with CGPA, class of degree, current-semester courses and latest approved results.
- Profile with department, faculty, program and matric number; update name and change password.
- Course registration for the current semester: only courses for the student's department, program, level and
  semester are offered, the unit limit is shown, duplicates are blocked and courses can be dropped.
- Approved results per semester with GPA, plus cumulative CGPA.
- Printable course registration slip and statement of result (Print / Save as PDF).

### Lecturer
- Dashboard with assigned courses, student counts, results by status and an alert for returned results.
- Assigned courses (current semester or all sessions) with class lists.
- Result sheet: enter CA (max 30) and exam (max 70) scores, see live totals, save as draft, and submit for approval.
  Submitted or approved results are locked; returned results show the department's feedback and can be corrected.
- Course performance summary (average, highest/lowest, pass rate, grade distribution) and per-result audit history.

### Department Admin
- Departmental dashboard with pending approvals.
- Manage students, lecturer profiles, programs and courses within the department.
- Allocate lecturers to courses for a session and semester.
- View student course registrations.
- Review submitted results per course: approve (optional comment), return to the lecturer with required feedback, or
  reopen approved results, either for the whole course or for selected students. Each result shows its audit trail.
- Departmental reports: student summary, registrations per course and academic performance.

### Super Admin
- University-wide dashboard: totals, users by role, current-semester activity and recent result activity.
- Manage faculties, departments, programs, academic sessions and semesters (including setting the current period).
- Configurable grading scale used for grade and GPA computation.
- Manage courses, course allocations, students, lecturers and department administrators.
- Users & roles: create and edit accounts, change roles, activate or suspend accounts.
- Oversight of course registrations and results, audit logs filterable by action and date, and university reports.

## Architecture

```
src/
├── api/            Axios client (token, 401 handling, error helpers) and one module per role's endpoints
├── stores/         Pinia stores: auth session, toast notifications, confirm dialog
├── router/         Route tables per role; guards in router/index.js
├── layouts/        DashboardLayout — responsive sidebar/drawer, header and user menu
├── components/
│   ├── ui/         Generic building blocks (table, pagination, modal, form field, badges, cards)
│   ├── ResourceManager.vue   Config-driven list/filter/create/edit/delete screen used by most admin pages
│   ├── ResultDetailModal.vue Result details with the audit trail, shared by three roles
│   └── ReportsPanel.vue      Report tabs shared by Department Admin and Super Admin
├── composables/    Data loading (useAsync, usePaginatedList, useOptions) and role lookups
├── utils/          Formatting, role constants, navigation and shared form definitions
└── views/          One folder per role
```

**Data flow.** Views call role API modules (`src/api/index.js`), which mirror the backend routes one to one. List
screens use `usePaginatedList`, which reads Laravel paginator responses, debounces search input and discards stale
responses when filters change quickly.

**Forms and validation.** Inputs carry client-side constraints (required, numeric ranges, score limits) for fast
feedback, but the API is the source of truth: `422` validation errors are mapped back onto the matching form fields,
and business-rule errors (for example "already registered" or "results are locked") are shown as toasts.

## Security

- **Authentication.** The login request returns a Laravel Sanctum personal access token, which is stored in
  `localStorage` and sent as a `Bearer` header. On page load the session is restored with `GET /api/auth/me`.
  Logout revokes the token on the server; "Sign out of all devices" revokes every token for the account.
- **Expired or revoked sessions.** Any `401` response clears the local session and redirects to the login page.
- **Role-based access.** Each role's routes live under its own prefix (`/student`, `/lecturer`, `/department-admin`,
  `/super-admin`) and declare the allowed role. The router guard redirects guests to login and sends users with the
  wrong role to a 403 page. The navigation only shows the signed-in role's pages.
- **Backend enforcement.** Frontend guards are for user experience only. Every permission is enforced again by the API
  (role middleware, department scoping, lecturer course ownership), so a crafted request from the browser cannot
  bypass them.
- **No sensitive output.** Server exception details from `5xx` responses are never displayed to users.

## Key workflows to demo

1. **Course registration.** Sign in as `student2`, open *Course Registration*, select CSC 201 and register. The
   course appears under *Registered courses* and on the printable slip.
2. **Result submission.** Sign in as `lecturer2`, open CSC 201 for 2025/2026, enter CA and exam scores, *Save as draft*,
   then *Submit for approval*.
3. **Departmental approval.** Sign in as `deptadmin.cs`, open *Result Approval*, review CSC 201 and approve it, or
   return it with feedback (the lecturer sees the feedback and can resubmit).
4. **Student results.** Sign back in as `student2` to see the approved result, GPA and statement of result.
5. **Administration.** Sign in as `superadmin` to manage faculties, sessions, the grading scale, users and roles, and to
   review audit logs.
