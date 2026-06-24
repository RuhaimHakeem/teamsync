# TeamSync

TeamSync is a full-stack technical assessment project: a lightweight project and task tracking platform built with NestJS, Prisma/PostgreSQL, Next.js, and Expo.

The repository is organized as an npm workspaces monorepo:

- `apps/api` — NestJS REST API
- `apps/web` — Next.js App Router web app
- `apps/mobile` — Expo mobile app
- `docker-compose.yml` — local PostgreSQL database and NestJS API

## Tech stack

- NestJS
- Prisma
- PostgreSQL
- Next.js
- Expo React Native
- npm workspaces

## Prerequisites

- Node.js 20+
- npm
- Docker Desktop
- Expo Go or an iOS/Android simulator, if running the mobile app

## Local setup

### 1. Install dependencies

Install dependencies once from the repository root. This project uses npm workspaces, so you do not need to run `npm install` separately inside each app.

```bash
npm install
```

### 2. Environment variables

Copy the example environment files:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
cp apps/mobile/.env.example apps/mobile/.env
```

Backend API env:

```env
PORT=3001
CORS_ORIGIN=http://localhost:3000
DATABASE_URL=postgresql://teamsync:teamsync@localhost:5432/teamsync
JWT_ACCESS_SECRET=change-me-access-secret
JWT_REFRESH_SECRET=change-me-refresh-secret
JWT_ACCESS_EXPIRES_IN_SECONDS=900
JWT_REFRESH_EXPIRES_IN_SECONDS=604800
```

Web env:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Mobile env:

```env
EXPO_PUBLIC_API_URL=http://localhost:3001
EXPO_PUBLIC_EAS_PROJECT_ID=replace-with-your-eas-project-id
```

For Expo Go on a physical device, `localhost` will not point to your computer. Replace `EXPO_PUBLIC_API_URL` with your computer's LAN IP, for example:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.10:3001
```

Expo push-token registration also needs the EAS project ID associated with the
mobile app. After linking the app to a free Expo/EAS project, copy its project
ID into `EXPO_PUBLIC_EAS_PROJECT_ID`. Push tokens require a physical device and
may require a development build because notification support is limited in
Expo Go. If the project ID is not configured, the app logs a clear message and
skips token registration instead of failing login.

Default local ports:

- API: `http://localhost:3001`
- Web: `http://localhost:3000`
- Postgres: `localhost:5432`
- Prisma Studio: `http://localhost:5555`
- API docs: `http://localhost:3001/api/docs`

### 3. Run backend

Start Postgres and the NestJS API with Docker Compose:

```bash
npm run docker:up
```

This builds the API image, waits for Postgres, applies the committed Prisma
migrations, seeds the demo data, and starts the API. It is a shortcut for:

```bash
docker compose up --build -d
```

Verify the API:

```bash
curl http://localhost:3001/health
```

Swagger API docs:

```txt
http://localhost:3001/api/docs
```

For backend development with NestJS hot reload, start only Postgres and run the
API locally:

```bash
docker compose up -d postgres
npm run prisma:generate --workspace=@teamsync/api
npm run prisma:deploy --workspace=@teamsync/api
npm run prisma:seed --workspace=@teamsync/api
npm run dev:api
```

### 4. Run web

From the repository root:

```bash
npm run dev:web
```

Open:

```txt
http://localhost:3000
```

### 5. Run mobile

From the repository root:

```bash
npm run dev:mobile
```

Equivalent direct Expo command:

```bash
cd apps/mobile
npx expo start
```

## Demo accounts

The seed script creates:

| Role    | Email                  | Password       |
| ------- | ---------------------- | -------------- |
| Admin   | `admin@teamsync.dev`   | `Password123!` |
| Manager | `manager@teamsync.dev` | `Password123!` |
| Member  | `member@teamsync.dev`  | `Password123!` |

The seed creates three projects and ten tasks, with assignments distributed
between all three accounts:

- Admin: 4 tasks
- Manager: 3 tasks
- Member: 3 tasks

### Demo role matrix

`UserRole` is global to the application. It controls actions such as whether a
user can create a project. `ProjectRole` belongs to a `ProjectMember` record and
controls what the user can do inside one specific project.

| Account      | Global `UserRole` | TeamSync Launch | Mobile App Improvements | API Stability |
| ------------ | ----------------- | --------------- | ----------------------- | ------------- |
| Ava Admin    | `ADMIN`           | `MEMBER`        | `MANAGER`               | `MEMBER`      |
| Maya Manager | `MANAGER`         | `MANAGER`       | `MEMBER`                | `MANAGER`     |
| Sam Member   | `MEMBER`          | `MEMBER`        | `MANAGER`               | `MEMBER`      |

This intentionally creates useful demo scenarios:

- Ava can update any task because global `ADMIN` overrides project-level roles,
  even where her `ProjectRole` is only `MEMBER`.
- Maya can create new projects because her global `UserRole` is `MANAGER`. She
  can manage every task in TeamSync Launch and API Stability because she is
  also a project `MANAGER` there.
- In Mobile App Improvements, Maya is only a project `MEMBER`, so her global
  `MANAGER` role does not automatically let her manage other users' tasks.
- Sam cannot create projects because his global role is `MEMBER`, but he can
  manage tasks belonging to anyone in Mobile App Improvements because his
  project-specific role there is `MANAGER`.

This separation is why TeamSync needs both the global role on `User` and the
per-project role on `ProjectMember`.

The seed is idempotent for its known demo records, so rerunning it restores this
role matrix and these task assignments. It does not delete projects or tasks
created manually during testing.

## Useful commands

```bash
npm run build
npm run test
npm run typecheck
npm run db:studio
npm run docker:down
```

Use Prisma Studio to inspect the local database:

```bash
npm run db:studio
```

## API docs

Swagger API documentation is available after the API starts:

```txt
http://localhost:3001/api/docs
```

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the proposed AWS deployment approach. This is an architecture plan only; no real AWS resources are provisioned for this assessment.

## Implemented API endpoints

Auth:

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /auth/me`

Projects:

- `GET /projects`
- `POST /projects`

Tasks:

- `GET /projects/:projectId/tasks`
- `POST /projects/:projectId/tasks`
- `GET /tasks/me`
- `GET /tasks/:taskId`
- `PATCH /tasks/:taskId`
- `POST /tasks/:taskId/comments`

## Key decisions and why

### Auth strategy: HttpOnly cookies on web, SecureStore on mobile

The assessment asks for a sensible JWT storage strategy. I chose HttpOnly cookies instead of `localStorage` because access and refresh tokens should not be readable by browser JavaScript. This reduces the impact of XSS: even if malicious script runs in the page, it cannot directly read the JWT values.

For the web app, the API issues:

- a short-lived access-token cookie
- a longer-lived refresh-token cookie

The browser sends those cookies automatically with `credentials: "include"`. When the API returns `401` because the access token is expired, the web client calls `POST /auth/refresh`, receives fresh cookies, and retries the original request once.

The “remember me” checkbox controls refresh-cookie persistence:

- unchecked: refresh cookie is a browser-session cookie
- checked: refresh cookie receives `Max-Age` and survives browser restarts until expiry

The mobile app cannot rely on browser-only HttpOnly cookies in the same way because Expo is a native client, not a browser page. For mobile, the same auth endpoints support an explicit `returnTokens: true` option. When mobile logs in, the backend returns the access token and refresh token in the JSON response. The app stores those tokens with `expo-secure-store`, then sends the access token on API calls using the standard `Authorization: Bearer <token>` header.

This keeps the security decision appropriate for each client:

- web: tokens are hidden from JavaScript in HttpOnly cookies
- mobile: tokens are stored in native secure storage through `expo-secure-store`
- AsyncStorage is not used for auth tokens

### Short-lived access token + longer-lived refresh token

Access tokens are intentionally short-lived so a stolen access token has a small usefulness window. Refresh tokens last longer because they are used to continue the session without forcing the user to log in repeatedly. On the web, the refresh token is stored as an HttpOnly cookie and is verified by the backend before new cookies are issued.

On mobile, the same refresh-token idea is used, but the transport is different. If an API request returns `401`, the mobile API client calls `POST /auth/refresh` with the stored refresh token and `returnTokens: true`. If refresh succeeds, the new tokens replace the old ones in SecureStore and the failed request is retried once. If refresh fails, the stored tokens are cleared and the user is sent back to login.

### Data fetching strategy with React Query

The web app uses React Query because projects, tasks, task detail, comments, and the current user are server state. React Query gives the app consistent loading, error, empty, and refetch behavior without building custom state management.

On login, register, and logout, cached queries are removed with `queryClient.removeQueries()`. This prevents data from one user, such as a manager’s project list, from flashing for another user after switching accounts in the same browser session.

### Mobile offline cache and native token storage

The Expo app stores access and refresh tokens with `expo-secure-store`, not AsyncStorage. SecureStore maps to the platform secure storage mechanism, which is more appropriate for auth tokens than plain key-value storage.

AsyncStorage is used only for cached task data. The mobile task list stores the last successful `GET /tasks/me` response locally. If a later API fetch fails, the app falls back to that cached task list and displays a visible “Showing cached data” indicator so the user knows they are not seeing fresh API data.

The mobile app also requests Expo notification permission after login and uses the configured `EXPO_PUBLIC_EAS_PROJECT_ID` when requesting an Expo push token. The token is logged locally and stored in SecureStore for the assessment; no real push-delivery backend is implemented.

The mobile app uses Expo Router so login, dashboard, and task detail are separate route-based screens.

### NestJS guards and role-based access control

Authentication and role checks are handled with NestJS guards instead of scattered controller-level conditionals. `JwtAuthGuard` protects authenticated routes, while the custom `@Roles()` decorator and `RolesGuard` handle global role checks such as restricting `POST /projects` to `ADMIN` and `MANAGER`.

Task-specific authorization lives in the task service because it depends on business rules: a task can be updated by the task assignee, the project manager, or an admin.

### Prisma schema with explicit join table

Projects use a `ProjectMember` join table instead of a simple many-to-many relation. This is intentional because membership has extra data: the user’s per-project role (`MANAGER` or `MEMBER`). A user can be a global `MEMBER` but still have different membership relationships across projects.

### Validation and error handling

The API uses DTOs with `class-validator` and a global `ValidationPipe`. This keeps invalid payload handling close to the route contract and prevents unknown fields from silently flowing into business logic.

For business-rule failures, services throw NestJS HTTP exceptions such as `ForbiddenException` and `NotFoundException`. A global exception filter normalizes API errors into one predictable response shape with `statusCode`, `message`, `error`, `path`, `method`, and `timestamp`. Validation errors still preserve their useful `message` array from `class-validator`.

### Design tokens in the web app

The web app follows the assessment’s design tokens directly:

- primary `#2563EB`
- primary-dark `#1E40AF`
- success `#16A34A`
- warning `#D97706`
- danger `#DC2626`
- neutral grayscale
- H1 `28px/700`
- H2 `22px/600`
- body `15px/400`
- caption `13px/400`
- cards `8px` radius
- buttons and inputs `6px` radius
- mobile/tablet/desktop breakpoints at `375px`, `768px`, and `1280px`

### What I would improve with more time

- Expand the global exception filter with request IDs and structured production logging.
- Add end-to-end tests for the main web flows: login, project filtering, task detail, and comments.
- Add the remaining frontend mutation flows for creating projects, creating tasks, and editing all task fields. The current Task Detail screen supports status updates, while the backend already supports the broader create and update operations.
- Introduce a more structured frontend component organization, such as Atomic Design or a feature-based variation of it, as the UI grows. This would make shared components easier to reuse and keep larger screens easier to maintain.
- Improve the overall UI polish with stronger empty states, accessibility checks, keyboard focus styles, smoother mobile drawer behavior, and more refined spacing/visual hierarchy.
- Apply Clean Architecture principles incrementally if the backend domain grows. For example, controllers could stay thin, use-case classes could hold application workflows, domain rules could be separated from persistence, and Prisma could sit behind repository-style adapters. I did not start with this because the 2-day assessment benefits more from simple, explainable NestJS services than extra abstraction.
- Persist hashed refresh tokens per user session/device to support explicit token revocation, logout from individual devices, and better auditability.
- Connect Expo push notifications to a real backend notification workflow instead of only requesting and storing the device push token.
- Review and refine code quality and performance beyond the assessment scope. Because this project was completed under a strict time constraint, I prioritized correct, simple, and explainable implementation. With more time, I would profile real usage, reduce unnecessary rendering and requests, improve test coverage, and refactor areas where measured evidence shows a clear maintainability or performance benefit.

## ERD

```mermaid
erDiagram
  User ||--o{ Project : owns
  User ||--o{ ProjectMember : has
  Project ||--o{ ProjectMember : includes
  Project ||--o{ Task : contains
  User ||--o{ Task : assigned
  Task ||--o{ Comment : has
  User ||--o{ Comment : writes

  User {
    uuid id PK
    string email
    string passwordHash
    string name
    UserRole role
    datetime createdAt
  }

  Project {
    uuid id PK
    string name
    string description
    uuid ownerId FK
    datetime createdAt
  }

  ProjectMember {
    uuid projectId PK,FK
    uuid userId PK,FK
    ProjectRole role
  }

  Task {
    uuid id PK
    uuid projectId FK
    string title
    string description
    TaskStatus status
    TaskPriority priority
    uuid assigneeId FK
    datetime dueDate
    datetime createdAt
    datetime updatedAt
  }

  Comment {
    uuid id PK
    uuid taskId FK
    uuid authorId FK
    string body
    datetime createdAt
  }
```

## Indexing note

The task list is the highest-risk query as the dataset grows because it is filtered by project and often narrowed by status and assignee, then sorted by due date. For 1M+ tasks, the main index is a composite index on `projectId`, `status`, `assigneeId`, and `dueDate`. This lets Postgres quickly find tasks for one project, apply equality filters for status and assignee, and read results in due-date order without scanning the full table. The left-to-right order matters: `projectId` comes first because almost every task-list query is scoped to one project; `status` and `assigneeId` are common equality filters; `dueDate` comes last because it supports sorting after filtering.

I also added `@@index([projectId, dueDate])` for project task lists where status or assignee filters are not supplied, and `@@index([assigneeId, status, dueDate])` for a “my tasks” style mobile query. These secondary indexes avoid forcing every query shape through one over-specific composite index. The tradeoff is extra write overhead and storage, but tasks are read and filtered much more frequently than they are bulk-written in this product.

In production, I would verify these choices against real query plans using
`EXPLAIN ANALYZE`, because Postgres may choose a different index depending on
filter selectivity and table statistics. I would also monitor index size,
write latency, and unused-index statistics before adding more indexes. This
keeps the design evidence-based and avoids paying ongoing storage and write
costs for indexes that do not improve actual application queries.

Prisma annotations:

```prisma
model Task {
  // ...
  @@index([projectId, status, assigneeId, dueDate])
  @@index([projectId, dueDate])
  @@index([assigneeId, status, dueDate])
}
```

## Reviewer notes

- No real secrets are committed. Use `.env.example` files as templates.
- The local setup uses free local infrastructure only.
- `npm run docker:up` starts Postgres and the API, applies migrations, and seeds demo data through Docker Compose.
- If Prisma Studio shows stale-client errors, stop the old Studio process and restart it with `npm run db:studio`.

### Dependency audit

At the time of submission, `npm audit` reports known transitive dependency
advisories, mainly within the NestJS, Expo/Metro, Next.js/PostCSS, and Jest
toolchains. TeamSync does not implement file-upload endpoints, so the reported
Multer advisory is not exposed through application functionality.

The available non-breaking Prisma security patch has been applied. Automated force-fixes were intentionally avoided because npm proposes incompatible framework downgrades or major-version upgrades for the remaining findings. In
a production project, these dependencies would be reviewed and upgraded through tested framework releases as compatible fixes become available.
