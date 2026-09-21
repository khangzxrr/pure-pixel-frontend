const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("vi-VN");

/** "250.000 ₫" — the single currency format for the whole app. */
export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

/** "2.450" — grouped integers for counts and dimensions. */
export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

/** "3.000 × 2.000 px" */
export function formatDimensions(width: number, height: number): string {
  return `${formatNumber(width)} × ${formatNumber(height)} px`;
}
