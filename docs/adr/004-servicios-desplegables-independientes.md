# ADR-004: Frontend y backend como servicios desplegables independientes
*(equivale a D4)*

**Estado:** Aceptada

**Contexto**
El enunciado narra el trabajo de dos equipos independientes (Frontend y Backend) y exige que los servicios que conformen la plataforma estén "respectivamente" dockerizados.

**Decisión**
`web` y `api` son dos contenedores Docker independientes, con sus propios `Dockerfile`, ciclo de build y despliegue.

**Alternativas consideradas**
- *Framework full-stack unificado (por ejemplo, un monolito con SSR integrado en un solo proceso):* descartada porque diluiría precisamente la separación de responsabilidades que el enunciado evalúa a través de la narrativa de los dos equipos, y porque el enunciado usa expresamente el plural "servicios" y el adverbio "respectivamente".

**Consecuencias**

*Positivas*
- Cada servicio puede probarse, construirse y desplegarse de forma independiente — respuesta directa al problema de integración planteado en el enunciado.
- Permite demostrar un contrato de API explícito entre ambos (ver la pieza del monorepo con esquemas compartidos, documentada aparte).

*Negativas / trade-offs aceptados*
- Añade la complejidad de configurar comunicación entre servicios (proxy, CORS si no se maneja vía Nginx) que un monolito no tendría.

---
