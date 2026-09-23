# Stage de build: instala dependencias y compila
FROM node:24-alpine AS build

WORKDIR /app

RUN npm install -g pnpm@12.4.2

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json tsconfig.base.json ./
COPY apps apps
COPY packages packages

RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile \
    --config.package-import-method=copy \
    --config.verifyDepsBeforeRun=false \
    --config.network-concurrency=1 \
    --config.fetch-retries=5 \
    --config.fetch-timeout=300000
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm --filter @disagro/shared build
RUN cd apps/api && DATABASE_URL="postgresql://disagro:disagro@localhost:5432/disagro" pnpm exec prisma generate
RUN pnpm --filter @disagro/api build
RUN pnpm --filter @disagro/api exec tsc -p tsconfig.seed.json
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm --filter @disagro/api deploy --prod /prod --config.package-import-method=copy --config.verifyDepsBeforeRun=false
RUN cp -r apps/api/prisma /prod/prisma \
    && cp -r apps/api/dist-seed /prod/dist-seed \
    && cd /prod \
    && DATABASE_URL="postgresql://disagro:disagro@localhost:5432/disagro" /app/apps/api/node_modules/.bin/prisma generate

# Stage final: solo runtime autocontenido (pnpm deploy) + build compilado
FROM node:24-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /prod /app
COPY --from=build /app/apps/api/dist /app/dist
COPY apps/api/docker-entrypoint.sh /app/docker-entrypoint.sh

RUN chmod +x /app/docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["/app/docker-entrypoint.sh"]