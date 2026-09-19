import { useEffect, useState } from "react";
import { PantallaAlternativa } from "./routes/PantallaAlternativa";
import { PantallaMockup } from "./routes/PantallaMockup";

type Vista = "recomendada" | "clasica";

export default function App() {
  const [vista, setVista] = useState<Vista>("recomendada");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [vista]);

  return (
    <>
      <nav
        className="fixed right-3 top-3 z-50 flex items-center gap-1 rounded-full border border-white/10 bg-carbon/95 p-1 shadow-lg"
        aria-label="Cambiar de vista"
      >
        <OpcionVista activa={vista === "recomendada"} onActivar={() => setVista("recomendada")}>
          Vista Recomendada
        </OpcionVista>
        <OpcionVista activa={vista === "clasica"} onActivar={() => setVista("clasica")}>
          Vista Clásica
        </OpcionVista>
      </nav>

      {vista === "recomendada" ? <PantallaAlternativa /> : <PantallaMockup />}
    </>
  );
}

type PropsOpcion = {
  activa: boolean;
  onActivar: () => void;
  children: React.ReactNode;
};

function OpcionVista({ activa, onActivar, children }: PropsOpcion) {
  return (
    <button
      type="button"
      onClick={onActivar}
      aria-pressed={activa}
      className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
        activa ? "bg-hoja text-carbon" : "text-white/70 hover:bg-white/10 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}