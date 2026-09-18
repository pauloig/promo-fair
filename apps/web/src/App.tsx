import { useEffect, useState } from "react";

const API_URL =
  (import.meta.env.VITE_API_URL as string | undefined) ??
  "http://localhost:3000/api";

type Health = { status: string; timestamp: string };

type Estado =
  | { tipo: "cargando" }
  | { tipo: "ok"; health: Health }
  | { tipo: "error"; mensaje: string };

export default function App() {
  const [estado, setEstado] = useState<Estado>({ tipo: "cargando" });

  useEffect(() => {
    let activo = true;

    async function verificarSalud(): Promise<void> {
      try {
        const respuesta = await fetch(`${API_URL}/health`);
        if (!respuesta.ok) {
          throw new Error(`HTTP ${respuesta.status}`);
        }
        const health = (await respuesta.json()) as Health;
        if (activo) {
          setEstado({ tipo: "ok", health });
        }
      } catch (error) {
        if (activo) {
          setEstado({
            tipo: "error",
            mensaje: error instanceof Error ? error.message : String(error),
          });
        }
      }
    }

    void verificarSalud();
    return () => {
      activo = false;
    };
  }, []);

  return (
    <main>
      <h1>Feria de Promociones DISAGRO</h1>
      {estado.tipo === "cargando" && <p>Cargando estado de la API…</p>}
      {estado.tipo === "ok" && (
        <section>
          <p>
            <strong>Estado:</strong> {estado.health.status}
          </p>
          <p>
            <strong>Timestamp:</strong> {estado.health.timestamp}
          </p>
        </section>
      )}
      {estado.tipo === "error" && (
        <p role="alert">Error al consultar la API: {estado.mensaje}</p>
      )}
    </main>
  );
}