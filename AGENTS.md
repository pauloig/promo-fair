# AGENTS.md

## Estado actual del repo

- **Solo documentación por ahora.** El código (monorepo `apps/web`, `apps/api`, `packages/shared`, `docker-compose*.yml`, Prisma, etc.) descrito en el README **aún no existe**: no hay `package.json`, `pnpm-workspace.yaml` ni ningún archivo fuente. El único commit es el análisis inicial, los ADR y los diagramas.
- El README y los ADR son la **especificación a construir**, no la descripción de un código ya existente. No busques archivos de código que falten: están planificados, no implementados.
- `opencode.json` ya inyecta `README.md` y `docs/**/*.md` (incluidos los 11 ADR) en el contexto de cada sesión. No los repitas en respuestas; consúltalos solo cuando apliquen.

## Skills repo-locales (`.agents/skills/`)

Instaladas con la CLI `skills` y versionadas (commitear; `skills-lock.json` las pine). Se cargan bajo demanda según la tarea; cárgalas en vez de reinventar sus directrices. Aplican al stack planificado:

- `nestjs-practices`, `nestjs-e2e-practices` — arquitectura/patrones del backend
- `prisma-postgres-setup`, `prisma-client-api` — schema, migraciones y API del cliente Prisma
- `vercel-react-best-practices`, `frontend-design` — renderizado y diseño del frontend
- `test-driven-development`, `systematic-debugging`, `code-review`, `solid-principles` — flujos de trabajo transversales

Ejecutan con permisos de agente completos; revísalas antes de usarlas.

## Convenciones

- **Idioma: español.** La documentación, los commits y los mensajes se escriben en español. Mantén ese idioma al tocar docs, ADR o README.

## Decisiones de diseño que gobiernan la implementación futura (fuente: ADR)

- Descuentos: por categoría (Servicios / Productos), independientes; ante reglas superpuestas gana el porcentaje mayor (ADR-001/002).
- Email = clave de idempotencia: confirmación duplicada actualiza el registro existente y guarda snapshot previo en `confirmacion_historial` (ADR-006).
- Nombre y precio de ítems se congelan al confirmar; el descuento se persiste, no se recalcula al leer (ADR-007).
- Sesión de cliente: JWT stateless en cookie httpOnly/Secure/SameSite de 30 días, emitido al confirmar; sin sesión en BD (ADR-003).
- Rango fecha/hora del evento por env vars `EVENTO_FECHA_INICIO`/`EVENTO_FECHA_FIN`, validado en API y expuesto al frontend (ADR-010).
- `POST /api/confirmaciones` con rate limiting por IP (ADR-011); enlace público, sin token (ADR-009).

## Comandos esperados (cuando exista el código)

- Stack planificado: pnpm workspaces; `pnpm test` (Vitest + Supertest); `docker compose up --build` con `cp .env.example .env`; local web en `:5173`, API en `:3000/api`, Swagger en `:3000/api/docs`.