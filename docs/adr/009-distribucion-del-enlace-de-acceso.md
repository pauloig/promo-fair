# ADR-009: El enlace de acceso a la plataforma es único y público, no personalizado por cliente

**Estado:** Aceptada

**Contexto**
El enunciado no especifica cómo llega cada cliente a la plataforma — no menciona invitaciones personalizadas, códigos únicos por cliente, ni un sistema de distribución. Esta pregunta no apareció en los diagramas de flujo porque ocurre completamente fuera del sistema que se construye: es un paso previo, del lado de Ventas/Marketing.

**Decisión**
La plataforma tiene una única URL pública, igual para todos los clientes (`https://disagro.endtoendsolutions.dev`). El sistema no genera ni valida enlaces individuales de invitación. La responsabilidad de comunicar esa URL a los clientes (por correo masivo, redes sociales, invitación impresa con un código QR, u otro canal) es un proceso de negocio externo al alcance de esta plataforma.

**Alternativas consideradas**
- *Generar un enlace único y personalizado por cliente (con un token de invitación), enviado individualmente:* descartada por dos razones. Primero, requeriría conocer de antemano la lista completa de clientes invitados y un mecanismo de envío (correo), lo cual el enunciado no pide y excede el alcance dentro del plazo disponible. Segundo, contradice el mockup, que presenta un formulario abierto donde el cliente ingresa sus propios datos (nombre, apellidos, email) — si el enlace ya fuera personalizado, esos campos no tendrían que pedirse de nuevo.

**Consecuencias**

*Positivas*
- Coherente con el mockup, que pide los datos del cliente porque el sistema no lo conoce de antemano.
- Mantiene el alcance del proyecto acotado al plazo disponible, sin depender de una lista de invitados ni de infraestructura de envío de correo.

*Negativas / trade-offs aceptados*
- Al ser un enlace público sin token de invitación, cualquier persona con el enlace (no solo "clientes" en sentido estricto) puede confirmar asistencia — el enunciado dice "sus clientes", pero el sistema no verifica esa condición. Se documenta como un límite conocido, mitigable en un contexto real con validación adicional (por ejemplo, cruzando el email contra un CRM existente), fuera del alcance de esta prueba.

---
