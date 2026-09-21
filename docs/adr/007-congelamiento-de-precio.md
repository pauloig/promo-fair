# ADR-007: Precio y nombre de cada ítem se congelan al momento de confirmar

**Estado:** Aceptada

**Contexto**
El catálogo de servicios y productos puede cambiar de precio en el tiempo. No es explícito qué precio debe prevalecer si el catálogo cambia después de que un cliente ya confirmó su interés.

**Decisión**
Cada `ConfirmacionItem` guarda una copia (snapshot) del nombre y del precio vigentes en el momento de la confirmación, independientemente de que el catálogo cambie después. El porcentaje de descuento calculado también se persiste junto con la confirmación, no se recalcula al leerla.

**Alternativas consideradas**
- *Referenciar solo el ítem del catálogo y calcular el precio al momento de la consulta:* descartada porque el descuento y el precio mostrado al cliente son una promesa concreta hecha en un momento específico; permitir que cambien retroactivamente rompe esa promesa.

**Consecuencias**

*Positivas*
- La confirmación es un registro histórico fiel e inmutable de lo prometido al cliente.
- Evita que un cambio de precio en el catálogo altere silenciosamente confirmaciones ya realizadas.

*Negativas / trade-offs aceptados*
- Duplica cierta información (nombre y precio existen tanto en `CatalogoItem` como en cada `ConfirmacionItem`), como desnormalización intencional.
