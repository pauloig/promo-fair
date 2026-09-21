import { useEffect, useState } from "react";
import { PanelVentas } from "./routes/PanelVentas";
import { PantallaFormulario } from "./routes/PantallaFormulario";

function enRutaVentas(): boolean {
  return window.location.hash.startsWith("#/ventas");
}

export default function App() {
  const [ventasAbierto, setVentasAbierto] = useState(enRutaVentas);

  useEffect(() => {
    const aplicarRuta = () => setVentasAbierto(enRutaVentas());
    window.addEventListener("hashchange", aplicarRuta);
    return () => window.removeEventListener("hashchange", aplicarRuta);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [ventasAbierto]);

  if (ventasAbierto) {
    return <PanelVentas />;
  }

  return <PantallaFormulario />;
}