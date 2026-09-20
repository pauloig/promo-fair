# ADR-012: Endurecimiento de seguridad complementario

**Estado:** Aceptada

**Contexto**
La plataforma expone un endpoint público (`POST /api/confirmaciones`, ADR-009) y un endpoint de autenticación para el equipo de Ventas (`POST /api/ventas/login`). El ADR-011 ya cubrió el throttling del endpoint de confirmaciones y el ADR-003 definió el mecanismo de sesión con cookie httpOnly. Quedan refuerzos complementarios pendientes de cerrar: cabeceras de seguridad estándar en todas las respuestas de la API (Helmet), un límite de intentos en el endpoint de login de Ventas — donde el abuso tiene un riesgo distinto al de las confirmaciones: fuerza bruta sobre credenciales — y la protección contra CSRF que las propias cookies de sesión del ADR-003 introducen: al confiar la sesión a cookies, un sitio malicioso podría disparar peticiones de escritura aprovechando que el navegador las envía automáticamente.

**Decisión**
Se aplican dos medidas aditivas sobre la API, sin alterar el mecanismo de sesión del ADR-003 (la cookie httpOnly se mantiene intacta):

1. **Helmet global:** el middleware `helmet()` se aplica al inicio del bootstrap de Nest (`configureApp`), de modo que todas las respuestas de la API llevan las cabeceras de seguridad estándar (CSP, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, entre otras).
2. **Rate limiting en `POST /api/ventas/login`:** se añade throttling con `@nestjs/throttler` con un límite **más estricto** que el de confirmaciones por ser un endpoint de autenticación: **5 intentos cada 10 minutos por IP** (constantes `LIMITE_LOGIN_VENTAS_POR_IP` / `VENTANA_LOGIN_VENTAS_MS`). Ante el límite se responde `429 Too Many Requests`.
3. **Protección CSRF con doble cookie en los endpoints de escritura:** `GET /api/csrf-token` emite un token aleatorio (`randomBytes(32)`) en una cookie **no httpOnly** (`disagro_csrf`, Secure, SameSite=Lax). El frontend lee esa cookie y la reenvía en la cabecera `X-CSRF-Token`; `POST /api/confirmaciones` y `POST /api/ventas/login` exigen que la cabecera coincida con la cookie bajo el guard `CsrfGuard`, respondiendo `403 Forbidden` en caso contrario. Medida **complementaria** del ADR-003: la cookie de sesión sigue siendo httpOnly; la cookie CSRF solo transporta un valor aleatorio sin privilegios.

**Alternativas consideradas**
- *No aplicar Helmet:* descartado porque son cabeceras gratuitas en costo y configuradas en una línea, con beneficio directo de endurecimiento (reducción de superficie de ataques como clickjacking o MIME sniffing).
- *Reutilizar el límite de confirmaciones (10/10min) para el login:* descartado. Un endpoint de autenticación merece un límite menor para dificultar fuerza bruta; el descuento/confirmación admite más margen porque su abuso es de volumen, no de adivinación de credenciales.
- *Confiar solo en SameSite cookie para bloquear CSRF:* descartado como única barrera. SameSite=Lax frena muchas peticiones entre sitios, pero no es infalible (navegadores antiguos, redirecciones, subdominios del mismo sitio o `SameSite=None`); la doble cookie con cabecera exige que el origen también conozca el token, incluso cuando el navegador enviaría la cookie.
- *Token CSRF con estado en el servidor:* descartado: exigiría almacenar el token por sesión y complica el despliegue sin sesión en BD (ADR-003). La doble cookie resuelve la verificación sin estado servidor (el token viaja en la cookie y en la cabecera).

**Consecuencias**

*Positivas*
- Las respuestas de la API incluyen cabeceras de seguridad verificables (por ejemplo, con `curl -I`), mejora transversal que aplica a cualquier endpoint presente o futuro.
- El login de Ventas queda protegido contra intentos automatizados de fuerza bruta por IP, complementando el ADR-011 con la misma técnica pero adaptada al riesgo del endpoint.
- Los endpoints de escritura quedan protegidos contra CSRF (peticiones forzadas desde otros sitios), y la verificación es sin estado en el servidor: encaja con el ADR-003 (JWT stateless).

*Negativas / trade-offs aceptados*
- El middleware Helmet podría exigir ajustes si algún futuro cliente de la API necesitara, por ejemplo, cargar scripts o estilos de orígenes externos con CSP; se acepta porque el frontend actual no lo requiere.
- El throttling por IP del login comparte el trade-off ya documentado en el ADR-011 (clientes legítimos detrás de una misma IP se ven limitados de forma agregada); en el equipo de Ventas el volumen esperado es bajo y un bloqueo temporal por 10 minutos es aceptable.
- Los contadores de throttling viven en memoria del proceso; en despliegues multi-replica cada instancia tiene su propio contador. Se acepta para esta prueba; si se escala, convendría un almacén compartido (Redis).
- La cookie CSRF es no httpOnly por diseño (el JS debe leerla para construir la cabecera). El token no es secreto por sí mismo: su seguridad depende de la comparación servidor cookie-vs-cabecera y de que sitios de terceros no puedan leer la cookie (SameSite=Lax). La cookie de sesión del ADR-003 no se ve afectada.
- Medidas **aditivas**: este endurecimiento no reemplaza ni modifica el mecanismo de sesión del ADR-003 (cookie httpOnly/Secure/SameSite con JWT stateless) ni el rate limiting del ADR-011 sobre `POST /api/confirmaciones`. Solo añade cabeceras de seguridad, un límite propio en el endpoint de login de Ventas y la protección CSRF en los endpoints de escritura.

---