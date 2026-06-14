# Corelab Frontend Finalization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build one final `client/` React app for Corelab that covers student and admin LMS workflows against the backend API.

**Architecture:** Migrate the API-connected `front/` behavior into `client/`, keep the login/protected-route structure from `client/`, then remove the duplicate `front/` tree. The frontend stays simple: one API module, route-level pages, small presentational components, local form state, and no global state library.

**Tech Stack:** React, Vite, React Router v6, Axios or Fetch, CSS modules/global CSS already present, backend REST API on `http://localhost:4242/api`.

---

## File Structure

- Modify: `client/package.json` — pin React Router v6 and configure scripts.
- Modify: `client/vite.config.js` — force port 3000 and simple `/api` proxy.
- Replace: `client/src/api/axios.js` — single API client for auth, users, courses, lessons, quizzes, progress, notifications.
- Modify: `client/src/App.jsx` — final routes for login, first login, student, course detail, quiz, admin users, admin courses.
- Modify: `client/src/main.jsx` — keep BrowserRouter and CSS entry.
- Modify: `client/src/components/auth/ProtectedRoute.jsx` — support role checks.
- Create: `client/src/pages/FirstLoginPage.jsx` — first login password setup.
- Replace: `client/src/pages/StudentDashboard.jsx` — API-backed dashboard.
- Replace: `client/src/pages/CoursesPage.jsx` — API-backed course listing.
- Create: `client/src/pages/CourseDetailPage.jsx` — lessons and quizzes for one course.
- Replace: `client/src/pages/QuizPage.jsx` — quiz submission flow.
- Replace: `client/src/pages/UsersPage.jsx` — admin list and import users.
- Replace: `client/src/pages/CourseManagementPage.jsx` — admin course CRUD and cohorts.
- Modify: `client/src/layouts/DashboardLayout.jsx` — route-aware shell.
- Modify: `client/src/components/dashboard/Sidebar.jsx` — links instead of hardcoded state.
- Modify: `client/src/components/dashboard/Topbar.jsx` — title and user display.
- Replace: `client/src/styles/dashboard.css` — merge useful `front/` styling with existing layout.
- Delete: `front/` — duplicate frontend.
- Delete: `server/corelab_lms_mockup.html:Zone.Identifier` and `front/src/main.jsx:Zone.Identifier` — tracked Windows metadata.

## Task 1: Stabilize Client Tooling

**Files:**
- Modify: `client/package.json`
- Modify: `client/vite.config.js`

- [ ] **Step 1: Update package versions and scripts**

Use React Router v6 and keep scripts simple:

```json
{
  "scripts": {
    "dev": "vite --host 0.0.0.0",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview --port 3000"
  },
  "dependencies": {
    "axios": "^1.16.1",
    "react": "^19.2.6",
    "react-dom": "^19.2.6",
    "react-hook-form": "^7.77.0",
    "react-router-dom": "^6.30.1",
    "zod": "^4.4.3"
  }
}
```

- [ ] **Step 2: Force Vite port 3000**

Set `client/vite.config.js` server config:

```js
server: {
  port: 3000,
  strictPort: true,
  proxy: {
    '/api': {
      target: 'http://localhost:4242',
      changeOrigin: true,
      secure: false,
    },
  },
}
```

- [ ] **Step 3: Verify build**

Run: `npm --prefix client run build`

Expected: Vite build succeeds.

- [ ] **Step 4: Commit**

Run: `git add client/package.json client/vite.config.js && git commit -m "chore: configure client runtime"`

## Task 2: Create Single API Layer

**Files:**
- Replace: `client/src/api/axios.js`

- [ ] **Step 1: Write API client**

Create an axios instance with token injection and named endpoint groups:

```js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const api = {
  auth: {
    login: (email, password) => apiClient.post('/auth/login', { email, password }).then((res) => res.data),
    me: () => apiClient.get('/auth/me').then((res) => res.data),
    firstLogin: (password) => apiClient.post('/auth/first-login', { password }).then((res) => res.data),
  },
  users: {
    list: () => apiClient.get('/users').then((res) => res.data),
    import: (users) => apiClient.post('/users/import', { users }).then((res) => res.data),
  },
  courses: {
    list: () => apiClient.get('/courses').then((res) => res.data),
    get: (id) => apiClient.get(`/courses/${id}`).then((res) => res.data),
    create: (payload) => apiClient.post('/courses', payload).then((res) => res.data),
    update: (id, payload) => apiClient.put(`/courses/${id}`, payload).then((res) => res.data),
    remove: (id) => apiClient.delete(`/courses/${id}`).then((res) => res.data),
    cohorts: (id) => apiClient.get(`/courses/${id}/cohorts`).then((res) => res.data),
    assignCohorts: (id, userIds) => apiClient.post(`/courses/${id}/cohorts`, { userIds }).then((res) => res.data),
  },
  lessons: {
    listByCourse: (courseId) => apiClient.get(`/lessons/courses/${courseId}/lessons`).then((res) => res.data),
    create: (courseId, payload) => apiClient.post(`/lessons/courses/${courseId}/lessons`, payload).then((res) => res.data),
    update: (id, payload) => apiClient.put(`/lessons/${id}`, payload).then((res) => res.data),
    schedule: (id, availableDate) => apiClient.put(`/lessons/${id}/schedule`, { availableDate }).then((res) => res.data),
  },
  quizzes: {
    listByCourse: (courseId) => apiClient.get(`/quizzes/courses/${courseId}/quizzes`).then((res) => res.data),
    import: (courseId, payload) => apiClient.post(`/quizzes/courses/${courseId}/quizzes/import`, payload).then((res) => res.data),
    get: (id) => apiClient.get(`/quizzes/${id}`).then((res) => res.data),
    submit: (id, answers) => apiClient.post(`/quizzes/${id}/submit`, { answers }).then((res) => res.data),
    threshold: (id, passingScore) => apiClient.put(`/quizzes/${id}/threshold`, { passingScore }).then((res) => res.data),
  },
  progress: {
    me: () => apiClient.get('/progress/me').then((res) => res.data),
    students: () => apiClient.get('/progress/students').then((res) => res.data),
  },
  notifications: {
    list: () => apiClient.get('/notifications').then((res) => res.data),
    markAsRead: (id) => apiClient.put(`/notifications/${id}/read`).then((res) => res.data),
  },
};

export default apiClient;
```

- [ ] **Step 2: Verify build**

Run: `npm --prefix client run build`

Expected: imports resolve.

- [ ] **Step 3: Commit**

Run: `git add client/src/api/axios.js && git commit -m "feat: add client api layer"`

## Task 3: Finalize Authentication Routes

**Files:**
- Modify: `client/src/App.jsx`
- Modify: `client/src/components/auth/ProtectedRoute.jsx`
- Modify: `client/src/pages/LoginPage.jsx`
- Create: `client/src/pages/FirstLoginPage.jsx`

- [ ] **Step 1: Add role-aware protected route**

`ProtectedRoute` must redirect unauthenticated users to `/login` and users with the wrong role to `/`.

- [ ] **Step 2: Update login page**

Use `api.auth.login`, store `token` and `user`, and redirect first-login users to `/first-login`.

- [ ] **Step 3: Add first-login page**

Submit password via `api.auth.firstLogin`, update stored user, and redirect to `/`.

- [ ] **Step 4: Wire final routes**

Routes must include `/login`, `/first-login`, `/`, `/courses`, `/courses/:courseId`, `/quizzes/:quizId`, `/admin/users`, `/admin/courses`.

- [ ] **Step 5: Verify build**

Run: `npm --prefix client run build`

Expected: build passes.

- [ ] **Step 6: Commit**

Run: `git add client/src/App.jsx client/src/components/auth/ProtectedRoute.jsx client/src/pages/LoginPage.jsx client/src/pages/FirstLoginPage.jsx && git commit -m "feat: finalize client authentication"`

## Task 4: Build Student Screens

**Files:**
- Replace: `client/src/pages/StudentDashboard.jsx`
- Replace: `client/src/pages/CoursesPage.jsx`
- Create: `client/src/pages/CourseDetailPage.jsx`
- Replace: `client/src/pages/QuizPage.jsx`

- [ ] **Step 1: Student dashboard**

Load `api.courses.list`, `api.progress.me`, and `api.notifications.list`. Display counts, progress bars, recent notifications, and links to courses.

- [ ] **Step 2: Courses page**

Load courses from API and render cards linking to `/courses/:courseId`.

- [ ] **Step 3: Course detail page**

Load course, lessons, and quizzes. Display lesson HTML, media links, and quiz links.

- [ ] **Step 4: Quiz page**

Load one quiz by id, collect checkbox answers per question, submit via `api.quizzes.submit`, and show score/passed result.

- [ ] **Step 5: Verify build**

Run: `npm --prefix client run build`

Expected: build passes.

- [ ] **Step 6: Commit**

Run: `git add client/src/pages/StudentDashboard.jsx client/src/pages/CoursesPage.jsx client/src/pages/CourseDetailPage.jsx client/src/pages/QuizPage.jsx && git commit -m "feat: build student learning flow"`

## Task 5: Build Admin Screens

**Files:**
- Replace: `client/src/pages/UsersPage.jsx`
- Replace: `client/src/pages/CourseManagementPage.jsx`

- [ ] **Step 1: Users admin page**

Load users, render table, parse pasted JSON array or CSV text into users, submit through `api.users.import`.

- [ ] **Step 2: Courses admin page**

Load users and courses. Create courses, create lessons, import quizzes, set lesson schedule, set quiz threshold, and assign cohorts.

- [ ] **Step 3: Verify build**

Run: `npm --prefix client run build`

Expected: build passes.

- [ ] **Step 4: Commit**

Run: `git add client/src/pages/UsersPage.jsx client/src/pages/CourseManagementPage.jsx && git commit -m "feat: build admin management screens"`

## Task 6: Polish Layout and Remove Duplicate Frontend

**Files:**
- Modify: `client/src/layouts/DashboardLayout.jsx`
- Modify: `client/src/components/dashboard/Sidebar.jsx`
- Modify: `client/src/components/dashboard/Topbar.jsx`
- Replace: `client/src/styles/dashboard.css`
- Delete: `front/`
- Delete: `server/corelab_lms_mockup.html:Zone.Identifier`

- [ ] **Step 1: Route-aware layout**

Sidebar uses `NavLink`; Topbar receives title/user; logout clears local storage.

- [ ] **Step 2: Final CSS**

Use a consistent Corelab dark/violet learning cockpit visual language and responsive breakpoints for mobile.

- [ ] **Step 3: Delete duplicate frontend and metadata**

Remove `front/` and `server/corelab_lms_mockup.html:Zone.Identifier`.

- [ ] **Step 4: Verify build and status**

Run: `npm --prefix client run build && git status -sb`

Expected: build passes and only intended files are changed.

- [ ] **Step 5: Commit**

Run: `git add client front server/corelab_lms_mockup.html:Zone.Identifier && git commit -m "refactor: keep single final client app"`

## Self-Review

This frontend plan covers the approved design scope for `client/`: tooling, API layer, auth, student flows, admin flows, layout, and duplicate frontend removal. Backend requirements are intentionally excluded and will get a separate plan after the final frontend builds.
