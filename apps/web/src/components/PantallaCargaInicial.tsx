export function PantallaCargaInicial() {
  return (
    <div
      className="min-h-screen bg-gris-pagina"
      role="status"
      aria-live="polite"
    >
      <main className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4 px-4 py-24 text-center sm:px-6">
        <span className="flex h-10 w-10 animate-spin items-center justify-center rounded-full border-[3px] border-carbon/20 border-t-verde" />
        <p className="text-sm font-bold text-[#4a555a]">
          Consultando su confirmación…
        </p>
      </main>
    </div>
  );
}
