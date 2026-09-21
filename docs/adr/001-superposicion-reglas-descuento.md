# ADR-001: Reglas de descuento superpuestas — gana el porcentaje mayor por categoría

**Estado:** Aceptada

**Contexto**
El enunciado define dos condiciones por categoría (Servicios: 2+ ítems → 3%, 2+ ítems y suma > Q1,500 → 5%; Productos: 3+ ítems → 3%, 5+ ítems → 5%) sin indicar qué ocurre cuando ambas condiciones de una misma categoría se cumplen simultáneamente.

**Decisión**
Se evalúan todas las reglas de la categoría y se aplica el porcentaje más alto que se cumpla.

**Alternativas consideradas**
- *Aplicar la primera regla que se cumpla, en el orden literal del enunciado:* descartada porque produciría el resultado contraintuitivo de que un cliente con más ítems reciba menos descuento que uno con menos.
- *Sumar ambos porcentajes (3% + 5% = 8%):* descartada porque el enunciado describe umbrales progresivos de la misma condición, no incentivos independientes acumulables.

**Consecuencias**

*Positivas*
- Comportamiento comercialmente coherente: nunca se penaliza al cliente por seleccionar más.
- Regla simple de verificar con pruebas unitarias.

*Negativas / trade-offs aceptados*
- Es una interpretación no escrita en el enunciado original; queda documentada como supuesto explícito.
