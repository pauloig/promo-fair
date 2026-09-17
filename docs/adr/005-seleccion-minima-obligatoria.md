# ADR-005: Selección de al menos un ítem es obligatoria para confirmar
*(equivale a D5)*

**Estado:** Aceptada

**Contexto**
El enunciado no dice si es válido confirmar asistencia sin seleccionar ningún servicio o producto.

**Decisión**
El formulario exige al menos una selección antes de habilitar la confirmación.

**Alternativas consideradas**
- *Permitir confirmar sin selección alguna:* descartada porque el propósito declarado del sistema completo es "preparar un portafolio de promociones personalizado", lo cual requiere al menos un ítem de interés por cliente.

**Consecuencias**

*Positivas*
- Garantiza que cada confirmación cumple el propósito de negocio declarado en el enunciado.

*Negativas / trade-offs aceptados*
- Es una restricción no explícita en el enunciado; podría interpretarse como una fricción adicional no solicitada. Mitigado comunicándola con claridad en la interfaz, no solo bloqueando el botón sin explicación.

---
