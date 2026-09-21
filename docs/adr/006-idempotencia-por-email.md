# ADR-006: Confirmación duplicada por email — se actualiza el registro existente

**Estado:** Aceptada

**Contexto**
El enunciado no especifica qué ocurre si el mismo correo electrónico confirma su asistencia más de una vez.

**Decisión**
El email es la clave natural de idempotencia: una segunda confirmación con el mismo correo actualiza el registro existente, y el estado anterior se preserva en una tabla de historial de solo-append.

**Alternativas consideradas**
- *Crear una confirmación nueva cada vez, permitiendo duplicados:* descartada porque el departamento de Ventas necesita una única fuente de verdad por cliente.
- *Rechazar la segunda confirmación con un error:* descartada por ser una experiencia de usuario hostil sin beneficio de negocio evidente, especialmente contando con la sesión del ADR-003 para editar legítimamente.

**Consecuencias**

*Positivas*
- Una sola fuente de verdad por cliente, consistente con el propósito de negocio.
- El historial permite a Ventas ver si un cliente cambió de intención.

*Negativas / trade-offs aceptados*
- Requiere una tabla adicional (`confirmacion_historial`) y la lógica de captura de snapshot antes de cada actualización.
