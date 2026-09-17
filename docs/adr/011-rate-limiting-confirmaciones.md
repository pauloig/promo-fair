# ADR-011: Rate limiting en el endpoint público de confirmación

**Estado:** Aceptada

**Contexto**
El ADR-009 estableció que el enlace de acceso a la plataforma es público y sin token de invitación — una decisión razonada y necesaria dado el enunciado, pero que deja abierto un riesgo real: cualquiera puede golpear `POST /api/confirmaciones` sin ninguna barrera previa.

**Decisión**
Se aplica throttling (`@nestjs/throttler`) sobre el endpoint público `POST /api/confirmaciones`, limitando la cantidad de solicitudes aceptadas por dirección IP en una ventana de tiempo.

**Alternativas consideradas**
- *No aplicar ninguna mitigación:* descartada porque sería ignorar un riesgo que el propio ADR-009 ya identificó explícitamente — dejarlo así se leería como una inconsistencia entre lo que se documentó y lo que se implementó.
- *CAPTCHA en el formulario:* descartado para el alcance de esta prueba por la complejidad de integrar un proveedor externo (reCAPTCHA u otro) dentro del plazo disponible; es la mejora natural en un contexto de producción real, y vale la pena tenerla lista como respuesta si preguntan "¿y esto basta?".

**Consecuencias**

*Positivas*
- Mitiga el riesgo de registros automatizados masivos sin requerir infraestructura adicional ni dependencias externas — encaja bien con el resto del proyecto, que evita sobre-ingeniería.
- Es una decisión que cierra el círculo con el ADR-009: identificas el riesgo de un enlace público, y aquí queda la mitigación explícita, no solo mencionada.

*Negativas / trade-offs aceptados*
- El throttling por IP no distingue entre múltiples clientes legítimos detrás de la misma IP (por ejemplo, una red corporativa u oficina). Se acepta este trade-off porque el volumen esperado de confirmaciones legítimas desde una misma IP en un evento de este tipo es bajo.
- No sustituye un CAPTCHA ni otras medidas anti-bot más robustas.

---
