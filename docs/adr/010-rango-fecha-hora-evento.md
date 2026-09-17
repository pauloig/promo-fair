# ADR-010: Rango de fecha/hora del evento — configurable por variables de entorno

**Estado:** Aceptada

**Contexto**
El enunciado exige un campo "Fecha y Hora en que asistirá" en el formulario, pero no define el rango de fechas válido del evento, ni si existen franjas horarias con capacidad limitada. Este es otro de los vacíos de nivel 2 detectados desde el análisis inicial (sección "Preguntas abiertas consolidadas").

**Decisión**
El rango válido (`EVENTO_FECHA_INICIO`, `EVENTO_FECHA_FIN`) se define mediante variables de entorno del backend, no como un valor fijo en el esquema Zod compartido ni hardcodeado en el código. La API expone ese rango al frontend (endpoint nuevo o extensión del ya existente de catálogo/configuración) para que el selector de fecha/hora del formulario solo permita elegir valores dentro del rango vigente, y el backend valida el mismo rango de forma autoritativa al recibir la confirmación.

**Alternativas consideradas**
- *Fijar el rango directamente en el esquema de validación compartido:* descartada porque acoplaría una fecha específica de esta edición del evento al código fuente — cada nueva Feria de Promociones anual obligaría a modificar y redesplegar la aplicación en vez de solo ajustar configuración.
- *No validar ningún rango:* descartada porque permitiría confirmaciones para fechas absurdas (por ejemplo, un año en el pasado), lo cual no tiene sentido de negocio y sería fácil de detectar como descuido en la demostración.

**Consecuencias**

*Positivas*
- El rango del evento se actualiza en cada edición futura de la feria sin tocar código, solo variables de entorno — reutilizable año tras año.
- Una sola fuente de verdad (la API) para la validación tanto en el cliente como en el servidor.

*Negativas / trade-offs aceptados*
- No resuelve la gestión de capacidad por franja horaria (cupo máximo de asistentes por horario), que el enunciado tampoco define y queda fuera del alcance de esta implementación — es un supuesto explícito, no un olvido.

---
