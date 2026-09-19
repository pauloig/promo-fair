export function Encabezado() {
  return (
    <header className="border-b-4 border-hoja-500 bg-agro-900 text-papel">
      <div className="mx-auto w-full max-w-6xl px-4 py-7 sm:px-6">
        <p className="text-sm font-bold tracking-wide text-hoja-500">DISAGRO</p>
        <h1 className="mt-2 text-2xl font-black leading-none tracking-tight text-balance sm:text-3xl">
          Feria de Promociones
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-papel/70">
          Confirme su asistencia, elija los servicios y productos de su interés y vea en el
          momento el descuento que se le aplica.
        </p>
      </div>
    </header>
  );
}