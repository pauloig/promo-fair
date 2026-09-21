# ADR-008: Destino de despliegue — DigitalOcean VPS (Droplet)

**Estado:** Aceptada — reemplaza una elección inicial de Google Cloud Run

**Contexto**
El enunciado permite elegir libremente la nube de despliegue. La elección inicial fue Google Cloud Run. Sin embargo, se reevaluó al no contar con presupuesto disponible para infraestructura, mientras que sí se contaba con créditos ya existentes en DigitalOcean.

**Decisión**
Desplegar los cuatro contenedores (`proxy`, `web`, `api`, `db`) mediante Docker Compose sobre un único Droplet de DigitalOcean, cubierto por créditos existentes. Se usa el subdominio `disagro.endtoendsolutions.dev`, sobre un dominio propio ya existente (`endtoendsolutions.dev`), con certificado TLS real emitido vía Let's Encrypt para ese subdominio.

**Alternativas consideradas**
- *Google Cloud Run (elección inicial):* descartada porque Cloud SQL (Postgres gestionado) no tiene capa gratuita real, y Cloud Run exige vincular una cuenta de facturación con tarjeta, introduciendo riesgo de cargos no planeados.
- *Plataformas gestionadas de capa gratuita para proyectos personales (Render, Railway, Fly.io):* no adoptadas porque suelen suspender servicios por inactividad, con riesgo de arranque en frío durante una demostración en vivo.

**Consecuencias**

*Positivas*
- Costo real: cero, cubierto por créditos ya disponibles.
- Sin arranque en frío: el servicio permanece activo de forma continua.
- Control total sobre la configuración de red, TLS y proxy.

*Negativas / trade-offs aceptados*
- En un contexto real con presupuesto de empresa, la migración a Cloud Run o GKE sería directa dado que la aplicación ya está completamente contenedorizada y sin estado en la capa de aplicación.
- Requiere gestión manual de actualizaciones de seguridad del sistema operativo del Droplet.
