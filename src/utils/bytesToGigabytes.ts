export function bytesToGigabytes(
  bytes: number | string | null | undefined,
): string {
  if (bytes === 0) return "0";
  if (!bytes || isNaN(Number(bytes))) return "Invalid input";

  const GB = Number(bytes) / (1024 * 1024 * 1024); // Chia cho 1,073,741,824
  return `${GB.toFixed(2)}`;
}
