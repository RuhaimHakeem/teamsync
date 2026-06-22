# TeamSync

TeamSync is a full-stack technical assessment organized as an npm workspaces monorepo.

## Apps

- `apps/api` — NestJS API at `http://localhost:3001`
- `apps/web` — Next.js web app at `http://localhost:3000`
- `apps/mobile` — Expo mobile app
- PostgreSQL — local database at `localhost:5432`

## Requirements

- Node.js 20 or newer
- npm
- Docker Desktop (for PostgreSQL)
- Expo Go or an iOS/Android simulator (for mobile development)

## Setup

Install all workspace dependencies from the repository root:

```bash
npm install
```

Create the API environment file:

```bash
cp apps/api/.env.example apps/api/.env
```

Start PostgreSQL:

```bash
docker compose up -d
```

Apply the database migration and add the demo data:

```bash
npm run prisma:deploy --workspace=@teamsync/api
npm run prisma:seed --workspace=@teamsync/api
```

The seed creates `manager@teamsync.dev` and `member@teamsync.dev`. Both use
`Password123!` for local development.

Run each app in a separate terminal:

```bash
npm run dev:api
npm run dev:web
npm run dev:mobile
```

Verify the API at `GET http://localhost:3001/health`.

## Useful commands

```bash
npm run build
npm run typecheck
npm run db:studio
docker compose down
```
