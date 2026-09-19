import { useEffect, useState } from "react";
import { PantallaAlternativa } from "./routes/PantallaAlternativa";
import { PantallaMockup } from "./routes/PantallaMockup";

function normalizar(hash: string): string {
  const ruta = hash.replace(/^#/, "");
  if (ruta === "" || ruta === "/") return "/";
  return ruta.startsWith("/") ? ruta : `/${ruta}`;
}

function useHashRuta(): string {
  const [ruta, setRuta] = useState(() => normalizar(window.location.hash));

  useEffect(() => {
    const alCambiar = () => setRuta(normalizar(window.location.hash));
    window.addEventListener("hashchange", alCambiar);
    return () => window.removeEventListener("hashchange", alCambiar);
  }, []);

  return ruta;
}

export default function App() {
  const ruta = useHashRuta();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [ruta]);

  return (
    <>
      <nav
        className="fixed right-3 top-3 z-50 flex items-center gap-1 rounded-full border border-white/10 bg-carbon/95 p-1 shadow-lg"
        aria-label="Cambiar de vista"
      >
        <EnlaceRuta ruta="/" actual={ruta === "/"}>
          Vista clásica
        </EnlaceRuta>
        <EnlaceRuta ruta="/alternativo" actual={ruta === "/alternativo"}>
          Alternativo
        </EnlaceRuta>
      </nav>

      {ruta === "/alternativo" ? <PantallaAlternativa /> : <PantallaMockup />}
    </>
  );
}

type PropsEnlace = {
  ruta: string;
  actual: boolean;
  children: React.ReactNode;
};

function EnlaceRuta({ ruta, actual, children }: PropsEnlace) {
  return (
    <a
      href={`#${ruta}`}
      aria-current={actual ? "page" : undefined}
      className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
        actual ? "bg-hoja text-carbon" : "text-white/70 hover:bg-white/10 hover:text-white"
      }`}
    >
      {children}
    </a>
  );
}