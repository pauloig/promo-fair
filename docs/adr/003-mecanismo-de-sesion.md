# ADR-003: Mecanismo de sesión — sesión de cliente vía JWT en cookie httpOnly, emitida al confirmar
*(equivale a D3)*

**Estado:** Aceptada

**Contexto**
El enunciado pide, como plus, "integrar un mecanismo de manejo de sesión", sin especificar para quién ni con qué propósito. El mockup no contempla ningún paso de autenticación previo al formulario.

**Decisión**
Al confirmar su asistencia, el backend emite un JWT de sesión con una vigencia de 30 días, en una cookie `httpOnly`, `Secure` y `SameSite`. Esa sesión permite al cliente volver más tarde, consultar y editar su confirmación sin volver a autenticarse con credenciales.

**Detalle de implementación — por qué no hay una tabla "Sesión" en el modelo de datos:**
El JWT es *stateless*: se firma con un secreto del servidor (`JWT_SECRET`) y contiene el id del cliente y la fecha de expiración a 30 días. El servidor verifica su validez comprobando la firma, sin necesidad de consultar la base de datos ni mantener un registro de sesiones activas. Por eso no existe una entidad `Sesion` en el modelo entidad-relación del documento de diagramas — no es una omisión, es la consecuencia directa de esta elección.

*Trade-off aceptado de este detalle:* al no haber un registro de sesiones en el servidor, no es posible revocar un token individual antes de su expiración natural (por ejemplo, un "cerrar sesión en todos los dispositivos"). Si ese caso de uso se volviera necesario, la alternativa sería una sesión respaldada en base de datos (session store) en vez de un JWT autocontenido — no se justifica para el alcance de esta prueba.

**Alternativas consideradas**
- *Registro con usuario y contraseña antes del formulario:* descartada por contradecir el objetivo de negocio (maximizar confirmaciones, minimizar fricción) y por no tener ningún respaldo en el mockup provisto.
- *Enlace mágico enviado por correo:* evaluada como la evolución natural en un entorno de producción, porque además validaría la existencia real del correo. Descartada para el alcance de esta prueba porque introduce una dependencia de infraestructura de envío de correo que no aporta señal técnica adicional dentro del plazo disponible.
- *Sesión anónima basada solo en almacenamiento local del navegador, sin respaldo en el servidor:* descartada porque no resuelve la posibilidad de que el cliente consulte su confirmación desde otro dispositivo, y no demuestra un mecanismo de sesión real del lado del servidor.

**Consecuencias**

*Positivas*
- Cero fricción añadida al flujo principal del cliente.
- Demuestra el mecanismo completo de sesión (emisión, expiración, transporte seguro, verificación en servidor) sin necesidad de dependencias externas.
- Resuelve, como efecto secundario, la posibilidad de editar una confirmación ya enviada.

*Negativas / trade-offs aceptados*
- No valida que el correo ingresado exista realmente (ese problema quedaría resuelto con la alternativa de enlace mágico, descartada por alcance).
- Si el cliente cambia de navegador o borra cookies, pierde la posibilidad de recuperar su confirmación sin volver a confirmar (lo cual, dado D6, simplemente actualizaría su registro existente).

---
