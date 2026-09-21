# ADR-002: Descuentos de Servicios y Productos — independientes entre sí

**Estado:** Aceptada

**Contexto**
No es explícito si el descuento de Servicios y el de Productos se combinan en un único porcentaje sobre el total, o si son cálculos paralelos sobre subtotales distintos.

**Decisión**
Cada categoría calcula y muestra su propio porcentaje, aplicado únicamente sobre el subtotal de esa categoría.

**Alternativas consideradas**
- *Un único descuento combinado sobre el total de la selección:* descartada porque el mockup del propio enunciado muestra dos indicadores separados en el footer ("Descuento obtenido en Servicios" / "Descuento obtenido en Productos").

**Consecuencias**

*Positivas*
- Consistente con el mockup provisto.
- El motor de descuentos queda desacoplado por categoría, lo que simplifica las pruebas unitarias.

*Negativas / trade-offs aceptados*
- Ninguno relevante identificado.
