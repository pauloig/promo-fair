# ADR-003: Mecanismo de sesión — sesión de cliente vía JWT en cookie httpOnly, emitida al confirmar

**Estado:** Aceptada

**Contexto**
El enunciado pide, como plus, "integrar un mecanismo de manejo de sesión", sin especificar para quién ni con qué propósito. El mockup no contempla ningún paso de autenticación previo al formulario.

**Decisión**
Al confirmar su asistencia, el backend emite un JWT de sesión con una vigencia de 30 días, en una cookie `httpOnly`, `Secure` y `SameSite`. Esa sesión permite al cliente volver más tarde, consultar y editar su confirmación sin volver a autenticarse con credenciales.

**Detalle de implementación**
El JWT es *stateless*: se firma con un secreto del servidor y contiene el id del cliente y la fecha de expiración a 30 días. El servidor verifica su validez comprobando la firma, sin consultar la base de datos ni mantener un registro de sesiones activas. Por esta razón no existe una entidad `Sesion` en el modelo de datos.

**Alternativas consideradas**
- *Registro con usuario y contraseña antes del formulario:* descartada por contradecir el objetivo de negocio (maximizar confirmaciones, minimizar fricción) y por no tener respaldo en el mockup provisto.
- *Enlace mágico enviado por correo:* evaluada como una evolución natural en un entorno de producción, porque además validaría la existencia real del correo. Descartada para el alcance de esta prueba por introducir una dependencia de infraestructura de envío de correo.
- *Sesión anónima basada solo en almacenamiento local del navegador:* descartada porque no resuelve la consulta desde otro dispositivo ni demuestra un mecanismo de sesión del lado del servidor.

**Consecuencias**

*Positivas*
- Cero fricción añadida al flujo principal del cliente.
- Demuestra el mecanismo completo de sesión (emisión, expiración, transporte seguro, verificación en servidor) sin dependencias externas.
- Resuelve, como efecto secundario, la posibilidad de editar una confirmación ya enviada.

*Negativas / trade-offs aceptados*
- No valida que el correo ingresado exista realmente.
- Al ser un JWT stateless, no es posible revocar un token individual antes de su expiración natural.
- Si el cliente cambia de navegador o borra cookies, pierde la posibilidad de recuperar su confirmación sin volver a confirmar (lo cual, dado el ADR-006, simplemente actualiza su registro existente).
