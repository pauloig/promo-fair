# Stage de build: compila con Vite
FROM node:24-alpine AS build

WORKDIR /app

RUN npm install -g pnpm@12.4.2

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json tsconfig.base.json ./
COPY apps apps
COPY packages packages

ARG VITE_API_URL=/api
ENV VITE_API_URL=${VITE_API_URL}

RUN pnpm install --frozen-lockfile \
    --config.network-concurrency=1 \
    --config.fetch-retries=5 \
    --config.fetch-timeout=300000
RUN pnpm --filter @disagro/shared build
RUN pnpm --filter @disagro/web build

# Stage final: sirve los estáticos con nginx
FROM nginx:alpine

COPY --from=build /app/apps/web/dist /usr/share/nginx/html

EXPOSE 80