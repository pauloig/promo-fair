# ADR-010: Rango de fecha/hora del evento — configurable por variables de entorno

**Estado:** Aceptada

**Contexto**
El enunciado exige un campo "Fecha y Hora en que asistirá" en el formulario, pero no define el rango de fechas válido del evento (inicio y fin), ni si existen múltiples franjas horarias con capacidad limitada.

**Decisión**
El rango válido (`EVENTO_FECHA_INICIO`, `EVENTO_FECHA_FIN`) se define mediante variables de entorno del backend, no como un valor fijo en el esquema Zod compartido ni en el código. La API expone ese rango al frontend para que el selector de fecha/hora del formulario solo permita elegir valores dentro del rango vigente, y el backend valida el mismo rango en el servidor al recibir la confirmación.

**Alternativas consideradas**
- *Fijar el rango directamente en el esquema de validación compartido:* descartada porque acoplaría una fecha específica de una edición del evento al código fuente, obligando a modificar y volver a desplegar la aplicación para cada nueva edición de la feria.
- *No validar ningún rango y aceptar cualquier fecha:* descartada porque permitiría confirmaciones para fechas fuera del evento, lo cual no tiene sentido de negocio.

**Consecuencias**

*Positivas*
- El rango del evento puede actualizarse en cada nueva edición de la feria sin modificar código, solo la configuración del entorno.
- El mismo rango es la única fuente de verdad tanto para la validación en el cliente (mejor experiencia de usuario) como en el servidor (autoritativa).

*Negativas / trade-offs aceptados*
- No resuelve la gestión de capacidad por franja horaria (cupo máximo de asistentes por horario), que el enunciado tampoco define y queda fuera del alcance de esta implementación.
