# ADR-006: Confirmación duplicada por email — se actualiza el registro existente
*(equivale a D6)*

**Estado:** Aceptada

**Contexto**
El enunciado no especifica qué ocurre si el mismo correo electrónico confirma su asistencia más de una vez.

**Decisión**
El email es la clave natural de idempotencia: una segunda confirmación con el mismo correo actualiza el registro existente (nueva selección, nueva fecha/hora si cambia), y el estado anterior se preserva en una tabla de historial de solo-append.

**Alternativas consideradas**
- *Crear una confirmación nueva cada vez, permitiendo duplicados:* descartada porque el departamento de Ventas necesita una única fuente de verdad por cliente para construir el portafolio personalizado — múltiples confirmaciones del mismo cliente generarían ambigüedad sobre cuál es la vigente.
- *Rechazar la segunda confirmación con un error:* descartada por ser una experiencia de usuario hostil sin beneficio de negocio evidente, especialmente considerando que D3 ya provee una sesión que permite al cliente editar legítimamente.

**Consecuencias**

*Positivas*
- Una sola fuente de verdad por cliente, consistente con el propósito de negocio.
- El historial permite a Ventas ver si un cliente cambió de intención, lo cual es información adicional de valor.
- Es también el primer caso de prueba que casi con certeza el evaluador va a intentar en la demostración en vivo.

*Negativas / trade-offs aceptados*
- Requiere una tabla adicional (`confirmacion_historial`) y la lógica de captura de snapshot antes de cada actualización.

---
