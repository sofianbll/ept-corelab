# Corelab Finalization Design

## Goal

Finish Corelab as a clean MERN LMS delivery that matches the subject PDF: `client/` + `server/`, API on port 4242, client on port 3000, JWT auth, roles, Zod validation, tests, seed data, README, and a demo-ready student/admin flow.

## Frontend Decision

Use `front/` as the functional base because it already consumes the backend API. Move that work into `client/` because the subject explicitly requires `client/` and `server/`. Keep only one frontend in the final repo.

Reuse from `client/`:
- Login page and protected route idea.
- Vite and lint setup.
- Existing dashboard layout where it is simple and readable.

Reuse from `front/`:
- API service shape.
- Course, lesson, progress, notification, and admin list screens.
- Responsive CSS direction.

Remove:
- `front/` after migration.
- Windows `Zone.Identifier` files.
- Hardcoded demo-only screens when API-backed data is available.

## Final Frontend Scope

The final `client/` must provide:
- Login.
- First-login password change.
- Student dashboard with courses, progress, quiz attempts, and notifications.
- Course detail page with lessons, HTML content, resources, and quizzes.
- Quiz submission flow.
- Admin users page with list and CSV/JSON import.
- Admin courses page with course CRUD and cohort assignment.
- Admin lesson/quiz management for HTML lesson creation, scheduling, quiz import, and passing threshold.

The Vite dev server must run on port 3000.

## Backend Scope

The backend must keep its existing simple Express/Mongoose structure while filling missing behavior:
- Fix `npm start`.
- Add a seed script with admin, students, courses, lessons, quizzes, attempts, progress, and notifications.
- Implement user import.
- Add route(s) to mark lessons complete.
- Update progress when lessons are completed and quizzes are submitted.
- Add admin access to quiz attempts/grades.
- Protect course, lesson, and quiz reads according to auth, role, cohort, and availability date.
- Keep bcrypt cost 10+, JWT expiration, role middleware, and Zod validation.
- Align Swagger with real routes.

## Testing

Use Vitest, Supertest, and mongodb-memory-server for critical API coverage:
- Auth login/register/first-login/me.
- 401/403 behavior.
- Course/cohort access.
- User import.
- Lesson completion/progress.
- Quiz submit/scoring/admin grades.
- Notifications.

Frontend verification must include at least build/lint and manual demo flow checks.

## Delivery Hygiene

Keep code readable and close to the existing style. Prefer small controllers and simple components over abstractions. Do not add comments unless they explain non-obvious behavior. Commit atomically as Sofian Belloul.

## Merge Strategy

Work on `chore/corelab-finalize`, merge all fixes into `dev`, then merge `dev` into `main` after tests/builds pass. Resolve the `Makefile` divergence by keeping tabs and adding `.PHONY`. Preserve the stronger MongoDB connection handling from `main`.
