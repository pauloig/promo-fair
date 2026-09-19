export function formatearPrecioQ(centavos: number): string {
  return `Q.${(centavos / 100).toFixed(2)}`;
}