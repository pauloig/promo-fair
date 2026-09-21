# ADR-011: Rate limiting en el endpoint público de confirmación

**Estado:** Aceptada

**Contexto**
El ADR-009 establece que el enlace de acceso a la plataforma es público y sin token de invitación. Esto significa que el endpoint `POST /api/confirmaciones` es alcanzable por cualquiera sin ninguna barrera previa, exponiendo el sistema a registros automatizados masivos o abuso del formulario.

**Decisión**
Se aplica throttling (`@nestjs/throttler`) sobre el endpoint público `POST /api/confirmaciones`, limitando la cantidad de solicitudes aceptadas por dirección IP en una ventana de tiempo.

**Alternativas consideradas**
- *No aplicar ninguna mitigación:* descartada porque el ADR-009 ya identifica la ausencia de token de invitación como un límite conocido; dejarlo sin ninguna mitigación adicional habría sido ignorar un riesgo ya detectado.
- *CAPTCHA en el formulario:* no adoptado para el alcance de esta prueba por la complejidad adicional de integrar un proveedor externo (por ejemplo, reCAPTCHA) dentro del plazo disponible; queda como una mejora natural en un contexto de producción real.

**Consecuencias**

*Positivas*
- Mitiga el riesgo de registros automatizados masivos sin requerir infraestructura adicional ni dependencias externas.
- Es una medida de seguridad barata de implementar y de explicar, coherente con el resto de decisiones de la prueba.

*Negativas / trade-offs aceptados*
- El throttling por IP no distingue entre múltiples clientes legítimos detrás de la misma IP (por ejemplo, una red corporativa), lo cual podría bloquear a un cliente real en un caso extremo. Se acepta este trade-off porque el volumen esperado de confirmaciones legítimas desde una misma IP en un evento de este tipo es bajo.
- No sustituye un CAPTCHA ni otras medidas anti-bot más robustas, que quedan fuera del alcance de esta prueba.
