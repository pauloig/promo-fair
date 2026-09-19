const cantidad = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatearQuetzales(centavos: number): string {
  return `Q ${cantidad.format(centavos / 100)}`;
}