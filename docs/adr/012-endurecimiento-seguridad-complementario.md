# ADR-012: Endurecimiento de seguridad complementario

**Estado:** Aceptada

**Contexto**
La plataforma expone un endpoint público (`POST /api/confirmaciones`, ADR-009) y un endpoint de autenticación para el equipo de Ventas (`POST /api/ventas/login`). El ADR-011 ya cubrió el throttling del endpoint de confirmaciones y el ADR-003 definió el mecanismo de sesión con cookie httpOnly. Quedan dos refuerzos complementarios pendientes de cerrar: cabeceras de seguridad estándar en todas las respuestas de la API (Helmet) y un límite de intentos en el endpoint de login de Ventas, donde el abuso tiene un riesgo distinto al de las confirmaciones: fuerza bruta sobre credenciales.

**Decisión**
Se aplican dos medidas aditivas sobre la API, sin alterar el mecanismo de sesión del ADR-003 (la cookie httpOnly se mantiene intacta):

1. **Helmet global:** el middleware `helmet()` se aplica al inicio del bootstrap de Nest (`configureApp`), de modo que todas las respuestas de la API llevan las cabeceras de seguridad estándar (CSP, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, entre otras).
2. **Rate limiting en `POST /api/ventas/login`:** se añade throttling con `@nestjs/throttler` con un límite **más estricto** que el de confirmaciones por ser un endpoint de autenticación: **5 intentos cada 10 minutos por IP** (constantes `LIMITE_LOGIN_VENTAS_POR_IP` / `VENTANA_LOGIN_VENTAS_MS`). Ante el límite se responde `429 Too Many Requests`.

**Alternativas consideradas**
- *No aplicar Helmet:* descartado porque son cabeceras gratuitas en costo y configuradas en una línea, con beneficio directo de endurecimiento (reducción de superficie de ataques como clickjacking o MIME sniffing).
- *Reutilizar el límite de confirmaciones (10/10min) para el login:* descartado. Un endpoint de autenticación merece un límite menor para dificultar fuerza bruta; el descuento/confirmación admite más margen porque su abuso es de volumen, no de adivinación de credenciales.

**Consecuencias**

*Positivas*
- Las respuestas de la API incluyen cabeceras de seguridad verificables (por ejemplo, con `curl -I`), mejora transversal que aplica a cualquier endpoint presente o futuro.
- El login de Ventas queda protegido contra intentos automatizados de fuerza bruta por IP, complementando el ADR-011 con la misma técnica pero adaptada al riesgo del endpoint.

*Negativas / trade-offs aceptados*
- El middleware Helmet podría exigir ajustes si algún futuro cliente de la API necesitara, por ejemplo, cargar scripts o estilos de orígenes externos con CSP; se acepta porque el frontend actual no lo requiere.
- El throttling por IP del login comparte el trade-off ya documentado en el ADR-011 (clientes legítimos detrás de una misma IP se ven limitados de forma agregada); en el equipo de Ventas el volumen esperado es bajo y un bloqueo temporal por 10 minutos es aceptable.
- Los contadores de throttling viven en memoria del proceso; en despliegues multi-replica cada instancia tiene su propio contador. Se acepta para esta prueba; si se escala, convendría un almacén compartido (Redis).
- Medidas **aditivas**: este endurecimiento no reemplaza ni modifica el mecanismo de sesión del ADR-003 (cookie httpOnly/Secure/SameSite con JWT stateless) ni el rate limiting del ADR-011 sobre `POST /api/confirmaciones`. Solo añade cabeceras de seguridad y un límite propio en el endpoint de login de Ventas.

---