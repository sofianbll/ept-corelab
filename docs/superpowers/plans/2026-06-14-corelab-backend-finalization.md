# Corelab Backend Finalization Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix and complete the Corelab Express/MongoDB backend so it matches the subject PDF and supports the final `client/`.

**Architecture:** Keep the existing simple Express structure. Fill missing endpoints, protect pedagogical routes, add tests, and deliver a clean README + seed + .env.example.

**Tech Stack:** Express, Mongoose, JWT, bcryptjs, Zod, Swagger, Vitest + Supertest + mongodb-memory-server.

**Work directory:** `/Users/sofian/Developer/40-Epitech/Projets/Corelab/corelab/.worktrees/corelab-finalize`

**Commit author:** Always `GIT_AUTHOR_NAME='Sofian Belloul' GIT_AUTHOR_EMAIL='sofian.belloul@epitech.eu'`

---

## Task B1: Fix CORS, env, rate limiter, and db config

**Files:**
- Modify: `server/src/app.js` — remove duplicate dotenv.config(), remove console.log(FRONTEND_URL), fix CORS fallback to string, remove unused `bcrypt` dep from package.json
- Modify: `server/.env.example` — add FRONTEND_URL, use standard MongoDB port
- Modify: `server/src/config/db.js` — add timeout + try/catch from main branch
- Modify: `server/src/middleware/rateLimiter.js` — restore standardHeaders, keep max:20
- Modify: `server/package.json` — remove unused `bcrypt` dependency

## Task B2: Write seed script

**Files:**
- Create: `server/src/seed.js`

Seed must create:
- 1 admin (admin@corelab.fr / Admin123!)
- 3 students (student1@corelab.fr, student2@corelab.fr, student3@corelab.fr / Student123! each)
- 2 courses (React Fondamentaux, Node.js API REST) with descriptions and categories
- 3 lessons per course with HTML content and order 1-3
- 1 quiz per course with 3 questions each, 2 options per question, 1 correct answer
- 2 quiz attempts per student per course
- Progress records for each student per course
- 2 notifications per student

Use `--prefix server run seed` or `node src/seed.js` from server/.

## Task B3: Implement user import

**Files:**
- Modify: `server/src/controllers/userController.js` — replace stub importUsers with real CSV/JSON parser
- Create: `server/src/schemas/userSchemas.js` — importUsersSchema

## Task B4: Protect pedagogical routes

**Files:**
- Modify: `server/src/routes/courseRoutes.js`
- Modify: `server/src/routes/lessonRoutes.js`
- Modify: `server/src/routes/quizRoutes.js`
- Modify: `server/src/controllers/courseController.js`
- Modify: `server/src/controllers/lessonController.js`
- Modify: `server/src/controllers/quizController.js`

Add auth to GET routes. Filter courses by cohort for students. Filter lessons by course + cohort + availability date. Filter quizzes by course + cohort.

## Task B5: Lesson completion and progress tracking

**Files:**
- Modify: `server/src/routes/progressRoutes.js` — add PUT /progress/me/lessons/:lessonId
- Modify: `server/src/controllers/progressController.js` — mark lesson as completed, recalculate progress
- Modify: `server/src/controllers/quizController.js` — update progress.quizResults after quiz submission

## Task B6: Admin grades endpoint

**Files:**
- Modify: `server/src/routes/quizRoutes.js` — add GET /quizzes/admin/attempts
- Modify: `server/src/controllers/quizController.js` — return all attempts with student/course/quiz info

## Task B7: Align Swagger with real routes

**Files:**
- Modify: `server/docs/swagger.yaml` — fix lesson and quiz paths to match /api/lessons and /api/quizzes, add missing endpoints

## Task B8: Backend tests

**Files:**
- Create: `server/tests/auth.test.js`
- Create: `server/tests/courses.test.js`
- Create: `server/tests/quizzes.test.js`
- Create: `server/tests/progress.test.js`
- Modify: `server/package.json` — ensure vitest config works

## Task B9: README and cleanup

**Files:**
- Replace: `README.md` — complete setup guide
- Verify: `npm install && npm start` from clean env
- Verify: build client OK
- Verify: all tests pass
