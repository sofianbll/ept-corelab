# Corelab LMS

MERN Learning Management System for Epitech — manage courses, lessons, quizzes, and track student progress.

## Prerequisites

- Node.js 18+
- MongoDB running locally on port 27017

## Quick Start

```bash
git clone https://github.com/EpitechWebAcademiePromo2027/W-WEB-201-PAR-2-1-corelab-12
cd corelab
cp server/.env.example server/.env
# edit server/.env if needed
make install
make seed
make dev
make dev-client
```

Server runs on http://localhost:4242 | Client on http://localhost:3000

### Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `4242` | Server port |
| `MONGODB_URI` | `mongodb://localhost:27017/corelab` | MongoDB connection string |
| `FRONTEND_URL` | `http://localhost:3000` | CORS allowed origin |
| `JWT_SECRET` | `random_string` | JWT signing secret |
| `JWT_EXPIRE` | `7d` | Token expiration |
| `NODE_ENV` | `development` | Environment mode |

## Default Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@corelab.fr | Admin123! |
| Student | student1@corelab.fr | Student123! |

## API Documentation

Swagger UI available at http://localhost:4242/api-docs when the server is running.

## Scripts (Makefile)

| Command | Description |
|---|---|
| `make install` | Install server and client dependencies |
| `make dev` | Start server in dev mode (nodemon) |
| `make dev-client` | Start client in dev mode (Vite) |
| `make start` | Start server in production mode |
| `make seed` | Populate database with demo data |
| `make api-docs` | Open Swagger UI in browser |

### npm Scripts

**Server** (`server/`)

| Script | Description |
|---|---|
| `npm start` | Start production server |
| `npm run dev` | Start with nodemon |
| `npm run seed` | Seed demo data |
| `npm test` | Run test suite |
| `npm run test:watch` | Run tests in watch mode |

**Client** (`client/`)

| Script | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## Tech Stack

- **Backend:** Node.js, Express, Mongoose, JWT (jsonwebtoken), Zod, Swagger
- **Frontend:** React 19, Vite, React Router, React Hook Form, Axios
- **Database:** MongoDB
- **Testing:** Vitest, Supertest, mongodb-memory-server

## Team

- Sofian Belloul — Backend & Frontend final
- Jérôme Etienne — Frontend initial
- Ndoumbe Sall — Frontend initial
