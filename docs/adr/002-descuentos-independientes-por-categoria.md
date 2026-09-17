# ADR-002: Descuentos de Servicios y Productos — independientes entre sí
*(equivale a D2)*

**Estado:** Aceptada

**Contexto**
No es explícito si el descuento de Servicios y el de Productos se combinan en un único porcentaje sobre el total, o si son cálculos paralelos sobre subtotales distintos.

**Decisión**
Cada categoría calcula y muestra su propio porcentaje, aplicado únicamente sobre el subtotal de esa categoría.

**Alternativas consideradas**
- *Un único descuento combinado sobre el total de la selección:* descartada porque el mockup del propio enunciado muestra dos indicadores separados en el footer, lo cual es la evidencia más fuerte disponible sobre la intención de negocio.

**Consecuencias**

*Positivas*
- Consistente con el mockup provisto, que es la fuente de mayor autoridad disponible sobre el comportamiento esperado.
- El motor de descuentos queda desacoplado por categoría, lo que simplifica las pruebas unitarias (sección independiente por categoría).

*Negativas / trade-offs aceptados*
- Ninguno relevante identificado; es la lectura más directa de la evidencia disponible.

---
