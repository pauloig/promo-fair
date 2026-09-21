# ADR-009: El enlace de acceso a la plataforma es único y público, no personalizado por cliente

**Estado:** Aceptada

**Contexto**
El enunciado no especifica cómo llega cada cliente a la plataforma. Esta decisión ocurre fuera del sistema construido: es un paso previo, del lado de Ventas/Marketing.

**Decisión**
La plataforma tiene una única URL pública, igual para todos los clientes. El sistema no genera ni valida enlaces individuales de invitación. La responsabilidad de comunicar la URL es un proceso de negocio externo al alcance de esta plataforma.

**Alternativas consideradas**
- *Generar un enlace único y personalizado por cliente, enviado individualmente:* descartada por requerir de antemano una lista completa de invitados y un mecanismo de envío, lo cual excede el alcance del enunciado, y por contradecir el mockup, que pide los datos del cliente porque el sistema no lo conoce de antemano.

**Consecuencias**

*Positivas*
- Coherente con el mockup, que solicita los datos del cliente en el propio formulario.
- Mantiene el alcance del proyecto acotado, sin depender de una lista de invitados ni de infraestructura de envío de correo.

*Negativas / trade-offs aceptados*
- Al ser un enlace público sin token de invitación, el sistema no verifica que quien confirma sea efectivamente un cliente existente de la empresa. Es un límite conocido, mitigable en un contexto real cruzando el email contra un CRM existente.
