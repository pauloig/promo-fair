# ADR-004: Frontend y backend como servicios desplegables independientes

**Estado:** Aceptada

**Contexto**
El enunciado narra el trabajo de dos equipos independientes (Frontend y Backend) y exige que los servicios que conformen la plataforma estén "respectivamente" dockerizados.

**Decisión**
`web` y `api` son dos contenedores Docker independientes, con sus propios `Dockerfile`, ciclo de build y despliegue.

**Alternativas consideradas**
- *Framework full-stack unificado en un solo proceso:* descartada porque diluiría la separación de responsabilidades que el enunciado plantea a través de los dos equipos, y porque el texto usa expresamente el plural "servicios" y el adverbio "respectivamente".

**Consecuencias**

*Positivas*
- Cada servicio puede probarse, construirse y desplegarse de forma independiente.
- Permite un contrato de API explícito entre ambos, mediante un paquete de esquemas y tipos compartidos.

*Negativas / trade-offs aceptados*
- Añade la complejidad de configurar comunicación entre servicios (proxy, CORS) que un monolito no tendría.
