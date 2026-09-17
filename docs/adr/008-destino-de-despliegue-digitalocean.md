# ADR-008: Destino de despliegue — DigitalOcean VPS (Droplet) en vez de GCP Cloud Run
*(decisión revisada durante el proyecto — reemplaza una elección inicial)*

**Estado:** Aceptada — reemplaza la elección inicial de Google Cloud Run

**Contexto**
El enunciado permite elegir libremente la nube de despliegue. La elección inicial fue Google Cloud Run, razonada por ser la nube que DISAGRO usa según el JD de la vacante. Sin embargo, esa elección se reevaluó al no contar con presupuesto disponible para infraestructura, mientras que sí se cuenta con créditos ya existentes en DigitalOcean.

**Decisión**
Desplegar los cuatro contenedores (`proxy`, `web`, `api`, `db`) mediante Docker Compose sobre un único Droplet de DigitalOcean, cubierto por créditos existentes. Se usa el subdominio `disagro.endtoendsolutions.dev`, sobre un dominio propio ya existente (`endtoendsolutions.dev`), con certificado TLS real emitido vía Let's Encrypt para ese subdominio — ya no queda pendiente ni la elección de dominio ni el uso de una IP directa.

**Alternativas consideradas**
- *Google Cloud Run (elección inicial):* descartada tras revisión de costos — Cloud SQL (Postgres gestionado) no tiene capa gratuita real, y Cloud Run exige vincular una cuenta de facturación con tarjeta desde febrero de 2026, lo cual introduce riesgo de cargos no planeados sin presupuesto para absorberlos.
- *Plataformas gestionadas de capa gratuita para hobby projects (Render, Railway, Fly.io en sus planes gratuitos):* no evaluadas a fondo porque ya existían créditos disponibles en DigitalOcean que cubren el costo por completo, y porque las capas gratuitas de este tipo de plataformas suelen suspender servicios por inactividad, lo cual introduce el riesgo de arranque en frío durante una demostración en vivo.

**Consecuencias**

*Positivas*
- Costo real: cero, cubierto por créditos ya disponibles.
- Sin arranque en frío: el Droplet permanece activo de forma continua, a diferencia de plataformas que escalan a cero.
- Reutiliza un patrón de despliegue (Docker + Nginx como reverse proxy) que ya se ha operado en producción previamente, reduciendo el riesgo de la semana de entrega.
- Control total sobre la configuración de red, TLS y proxy, útil para demostrar conocimiento de infraestructura más allá de "hacer clic en desplegar".

*Negativas / trade-offs aceptados*
- Renuncia a la señal específica de "usa la misma nube que la empresa" que motivó la elección inicial de GCP. Se documenta explícitamente que, en un contexto real con presupuesto de empresa, la migración a Cloud Run o GKE sería directa dado que la aplicación ya está completamente contenedorizada y sin estado en la capa de aplicación.
- Requiere gestión manual de actualizaciones de seguridad del sistema operativo del Droplet, responsabilidad que un servicio gestionado (como Cloud Run) absorbería automáticamente.

---
