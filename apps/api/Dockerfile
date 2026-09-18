# Stage de build: instala dependencias y compila
FROM node:24-alpine AS build

WORKDIR /app

RUN npm install -g pnpm@12.4.2

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json tsconfig.base.json ./
COPY apps apps
COPY packages packages

RUN pnpm install --frozen-lockfile
RUN pnpm --filter @disagro/api build
RUN pnpm --filter @disagro/api deploy --prod /prod

# Stage final: solo build compilado y dependencias de producción
FROM node:24-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /prod /app
COPY --from=build /app/apps/api/dist /app/dist

EXPOSE 3000

CMD ["node", "dist/main.js"]