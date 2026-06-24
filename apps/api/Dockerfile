FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY apps/mobile/package.json apps/mobile/package.json

RUN npm ci --workspace=@teamsync/api --include-workspace-root

COPY apps/api apps/api

RUN npm run prisma:generate --workspace=@teamsync/api \
  && npm run build --workspace=@teamsync/api

EXPOSE 3001

CMD ["npm", "run", "start:docker", "--workspace=@teamsync/api"]
