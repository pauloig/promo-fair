# Plataforma de Confirmación de Asistencia — Feria de Promociones DISAGRO

Plataforma para que los clientes de DISAGRO confirmen su asistencia a la Feria de Promociones anual, seleccionen los servicios y/o productos de su interés, y vean en el momento el descuento al que acceden según las reglas de la campaña. Con esa información, el equipo de Ventas puede preparar un portafolio de promociones personalizado por cliente.

## Índice

- [Arquitectura](#arquitectura)
- [Modelo de datos](#modelo-de-datos)
- [Flujos principales](#flujos-principales)
- [Reglas de descuento](#reglas-de-descuento)
- [Decisiones y supuestos](#decisiones-y-supuestos)
- [Stack tecnológico](#stack-tecnológico)
- [Estructura del repositorio](#estructura-del-repositorio)
- [Ejecución local](#ejecución-local)
- [Variables de entorno](#variables-de-entorno)
- [Pruebas](#pruebas)
- [Despliegue](#despliegue)
- [Plataforma en línea](#plataforma-en-línea)

---

## Arquitectura

### Contexto

```mermaid
graph TB
    Cliente["👤 Cliente de DISAGRO"]
    Ventas["👤 Equipo de Ventas"]

    Plataforma["🖥️ Plataforma de Confirmación<br/>de Asistencia"]

    Cliente -->|"Confirma asistencia,<br/>busca y selecciona<br/>servicios/productos"| Plataforma
    Ventas -->|"Consulta confirmaciones,<br/>exporta resultados"| Plataforma

    style Plataforma fill:#4A5568,color:#fff
    style Cliente fill:#2B6CB0,color:#fff
    style Ventas fill:#2B6CB0,color:#fff
```

### Contenedores

```mermaid
graph TB
    Cliente["👤 Cliente"]
    Ventas["👤 Equipo de Ventas"]

    subgraph Droplet["Droplet DigitalOcean — Docker Compose"]
        Proxy["proxy<br/>Nginx<br/>Reverse proxy + TLS"]
        Web["web<br/>React 19 + Vite"]
        Api["api<br/>NestJS + TypeScript"]
        Db[("db<br/>PostgreSQL")]
    end

    Cliente -->|"HTTPS"| Proxy
    Ventas -->|"HTTPS"| Proxy
    Proxy -->|"/"| Web
    Proxy -->|"/api"| Api
    Api -->|"SQL"| Db

    style Proxy fill:#805AD5,color:#fff
    style Web fill:#2B6CB0,color:#fff
    style Api fill:#2C7A7B,color:#fff
    style Db fill:#975A16,color:#fff
```

### Despliegue

```mermaid
graph TB
    Internet(["Internet"])

    subgraph VPS["Droplet DigitalOcean"]
        subgraph Network["Red interna Docker Compose"]
            NginxC["proxy<br/>nginx:alpine<br/>Puertos: 80, 443"]
            WebC["web<br/>build de producción"]
            ApiC["api<br/>Node.js 24 + NestJS"]
            DbC[("db<br/>postgres:16")]
            Vol[("Volumen: pgdata")]
        end
    end

    Internet -->|"HTTPS :443"| NginxC
    NginxC --> WebC
    NginxC --> ApiC
    ApiC --> DbC
    DbC -.-> Vol

    style NginxC fill:#805AD5,color:#fff
    style WebC fill:#2B6CB0,color:#fff
    style ApiC fill:#2C7A7B,color:#fff
    style DbC fill:#975A16,color:#fff
```

Diagramas adicionales (secuencias completas) en [`/docs/diagramas`](./docs/diagramas).

---

## Modelo de datos

```mermaid
erDiagram
    CLIENTE ||--o| CONFIRMACION : "confirma"
    CONFIRMACION ||--o{ CONFIRMACION_ITEM : "contiene"
    CATALOGO_ITEM ||--o{ CONFIRMACION_ITEM : "referenciado por"
    CONFIRMACION ||--o{ CONFIRMACION_HISTORIAL : "genera al editarse"

    CLIENTE {
        uuid id PK
        string nombre
        string apellidos
        string email UK
        timestamp creadoEn
        timestamp actualizadoEn
    }

    CATALOGO_ITEM {
        uuid id PK
        enum tipo "SERVICIO | PRODUCTO"
        string nombre
        int precioActualCentavos
        boolean activo
    }

    CONFIRMACION {
        uuid id PK
        uuid clienteId FK
        timestamp fechaHoraEvento
        int descuentoServiciosPct
        int descuentoProductosPct
        timestamp creadoEn
        timestamp actualizadoEn
    }

    CONFIRMACION_ITEM {
        uuid id PK
        uuid confirmacionId FK
        uuid catalogoItemId FK
        enum tipo
        string nombreCongelado
        int precioCongeladoCentavos
    }

    CONFIRMACION_HISTORIAL {
        uuid id PK
        uuid confirmacionId FK
        jsonb estadoAnterior
        timestamp editadoEn
    }

    USUARIO_VENTAS {
        uuid id PK
        string username UK
        string passwordHash
    }
```

---

## Flujos principales

### Confirmación de asistencia

```mermaid
sequenceDiagram
    actor Cliente
    participant Web as web (React)
    participant Api as api (NestJS)
    participant DB as db (PostgreSQL)

    Cliente->>Web: Abre la plataforma
    Web->>Api: GET /catalogo?buscar=...
    Api->>DB: SELECT catalogo_item WHERE activo
    DB-->>Api: Servicios y productos
    Api-->>Web: Catálogo con precios vigentes
    Web-->>Cliente: Buscador + resultados

    Cliente->>Web: Selecciona ítems, completa datos y confirma
    Web->>Api: POST /confirmaciones

    Api->>DB: SELECT cliente WHERE email = ?
    alt Cliente existente
        Api->>DB: INSERT confirmacion_historial (snapshot previo)
        Api->>DB: UPDATE confirmacion + confirmacion_item
    else Cliente nuevo
        Api->>DB: INSERT cliente
        Api->>DB: INSERT confirmacion + confirmacion_item
    end

    Api->>Api: Calcula descuento y congela precios
    Api->>Api: Genera JWT de sesión
    Api-->>Web: 200 OK + cookie de sesión + resumen
    Web-->>Cliente: Confirmación con desglose de descuento
```

### Panel de Ventas

```mermaid
sequenceDiagram
    actor Ventas as Equipo de Ventas
    participant Web as web (React)
    participant Api as api (NestJS)
    participant DB as db (PostgreSQL)

    Ventas->>Web: Ingresa a /ventas
    Web->>Api: POST /ventas/login
    Api-->>Web: 200 OK + cookie de sesión de Ventas

    Ventas->>Web: Aplica filtros
    Web->>Api: GET /ventas/confirmaciones?filtros...
    Api->>DB: SELECT confirmaciones + items
    DB-->>Api: Resultados + agregados
    Api-->>Web: Listado y resumen
    Web-->>Ventas: Tabla, resumen y exportación CSV
```

---

## Reglas de descuento

| Categoría | Condición | Descuento |
|---|---|---|
| Servicios | 2 o más servicios seleccionados | 3% |
| Servicios | 2 o más servicios y la suma de sus precios supera Q1,500 | 5% |
| Productos | 3 o más productos seleccionados | 3% |
| Productos | 5 o más productos seleccionados | 5% |

- Los descuentos de Servicios y Productos se calculan de forma independiente, cada uno sobre el subtotal de su propia categoría.
- Cuando una categoría cumple más de una condición simultáneamente, se aplica el porcentaje mayor.
- El cálculo es recalculado y validado siempre en el servidor; el valor mostrado en el cliente antes de confirmar es únicamente informativo.

---

## Decisiones y supuestos

El enunciado dejaba varios aspectos a mi criterio (reglas de descuento superpuestas, mecanismo de sesión, destino de despliegue, entre otros). Fui documentando cada decisión que tomé, con su justificación, como un Architecture Decision Record en [`/docs/adr`](./docs/adr):

| ADR | Decisión |
|---|---|
| [001](./docs/adr/001-superposicion-reglas-descuento.md) | Superposición de reglas de descuento: aplica el porcentaje mayor |
| [002](./docs/adr/002-descuentos-independientes-por-categoria.md) | Descuentos de Servicios y Productos calculados de forma independiente |
| [003](./docs/adr/003-mecanismo-de-sesion.md) | Sesión de cliente vía JWT en cookie httpOnly, emitida al confirmar |
| [004](./docs/adr/004-servicios-desplegables-independientes.md) | Frontend y backend como servicios desplegables independientes |
| [005](./docs/adr/005-seleccion-minima-obligatoria.md) | Selección de al menos un ítem obligatoria para confirmar |
| [006](./docs/adr/006-idempotencia-por-email.md) | Confirmación duplicada por email: actualiza el registro existente |
| [007](./docs/adr/007-congelamiento-de-precio.md) | Nombre y precio de cada ítem se congelan al momento de confirmar |
| [008](./docs/adr/008-destino-de-despliegue-digitalocean.md) | Despliegue en DigitalOcean (Droplet) |
| [009](./docs/adr/009-distribucion-del-enlace-de-acceso.md) | El enlace de acceso a la plataforma es único y público, no personalizado por cliente |
| [010](./docs/adr/010-rango-fecha-hora-evento.md) | Rango de fecha/hora del evento configurable por variables de entorno |
| [011](./docs/adr/011-rate-limiting-confirmaciones.md) | Rate limiting en el endpoint público de confirmación |
| [012](./docs/adr/012-endurecimiento-seguridad-complementario.md) | Helmet, rate limiting en login de Ventas y protección CSRF |

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Runtime | Node.js 24 LTS |
| Lenguaje | TypeScript (modo `strict`) |
| Backend | NestJS |
| ORM / Base de datos | Prisma + PostgreSQL |
| Frontend | React 19 + Vite |
| Estado de servidor | TanStack Query |
| Formularios | React Hook Form + Zod |
| Estilos | Tailwind CSS |
| Monorepo | pnpm workspaces |
| Pruebas | Vitest (+ Supertest en la API) |
| Contenedores | Docker (multi-stage) + Docker Compose |
| Proxy / TLS | Nginx + Let's Encrypt |
| Despliegue | DigitalOcean Droplet — `disagro.endtoendsolutions.dev` |

---

## Estructura del repositorio

```
.
├── apps/
│   ├── web/              # Frontend — React + Vite
│   └── api/              # Backend — NestJS
├── packages/
│   └── shared/           # Esquemas Zod, tipos y motor de descuentos compartidos
├── docs/
│   ├── diagramas/        # Diagramas de arquitectura, datos y flujos
│   └── adr/              # Registro de decisiones de arquitectura
├── docker-compose.yml
├── docker-compose.prod.yml
└── README.md
```

---

## Ejecución local

Requisitos: Docker y Docker Compose (y Node.js/pnpm si vas a usar el flujo de recarga en caliente).

Hay tres formas de correr el proyecto, según lo que necesites:

### Desarrollo con recarga en caliente (recomendado para trabajar en el código)

Solo la base de datos corre en Docker; `shared`, `api` y `web` corren en local con watch:

```bash
docker compose up -d db
cp .env.example apps/api/.env
cp .env.example apps/web/.env
pnpm install
pnpm dev
```

`shared` compila con `tsc -w`, `api` corre vía `dev.sh` (`tsc -w` + `node --watch`, no `tsx`, porque NestJS necesita `emitDecoratorMetadata` y `esbuild` no lo emite) y `web` corre con Vite (HMR). Un cambio en `apps/api/src/**` reinicia la API; un cambio en `apps/web/src/**` recarga el navegador; un cambio en `packages/shared/**` se recompila y llega a ambos.

- Frontend: `http://localhost:5173`
- API: `http://localhost:3000/api`
- Documentación de la API (OpenAPI/Swagger): `http://localhost:3000/api/docs`

### Stack completo en contenedores, sin TLS (para probar el build de punta a punta)

```bash
docker compose up --build
```

Levanta los cuatro contenedores (`proxy`, `web`, `api`, `db`) con las mismas imágenes multi-stage de producción. **No tiene hot reload** — cualquier cambio de código requiere reconstruir. Sirve para verificar que el proyecto arranca igual que en un servidor real, sin necesidad de TLS.

- Acceso: `http://localhost` (vía el proxy Nginx, puerto 80)

### Réplica exacta de producción (con TLS)

```bash
git clone <url-del-repositorio>
cd <nombre-del-repositorio>
cp .env.example .env
docker compose -f docker-compose.prod.yml up --build -d
```

Es el mismo `docker-compose.prod.yml` que corre en el Droplet.

El primer arranque de cualquiera de los tres flujos ejecuta las migraciones de Prisma y siembra el catálogo con datos de ejemplo.

---

## Variables de entorno

Ver `.env.example` para el detalle completo. Las principales:

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Cadena de conexión a PostgreSQL |
| `JWT_SECRET` | Secreto para firmar las sesiones de cliente y de Ventas |
| `VENTAS_USERNAME` / `VENTAS_PASSWORD` | Credenciales del panel de Ventas |
| `EVENTO_FECHA_INICIO` / `EVENTO_FECHA_FIN` | Rango de fechas válido para el campo "Fecha y Hora" de la confirmación (ver ADR-010); expuesto al frontend por la API para validar el selector |
| `VITE_API_URL` | URL base de la API consumida por el frontend |

---

## Pruebas

```bash
pnpm test
```

Incluye pruebas unitarias del motor de descuentos con los casos límite de las reglas (2 y 3 servicios, montos exactamente en Q1,500, 3 y 5 productos, selección vacía) y pruebas de integración de los endpoints principales de la API.

---

## Despliegue

La plataforma corre en un Droplet de DigitalOcean con `docker-compose.prod.yml`: cuatro contenedores (`proxy`, `web`, `api`, `db`) en una red interna de Docker. Solo `proxy` expone puertos al exterior (80 y 443); el resto solo es alcanzable dentro de la red interna. Usa el subdominio `disagro.endtoendsolutions.dev` (sobre el dominio propio `endtoendsolutions.dev`), con certificado TLS real vía Let's Encrypt.

---

## Plataforma en línea

`https://disagro.endtoendsolutions.dev`

## Acceso al Panel de Ventas

- URL: `https://disagro.endtoendsolutions.dev/ventas`
- Usuario: `ventas`
- Contraseña: `ds-ventas`

Son credenciales de un entorno de prueba, con datos sembrados — no corresponden a ningún dato real de producción.
