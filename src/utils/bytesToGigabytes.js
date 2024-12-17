export function bytesToGigabytes(bytes) {
  if (bytes === 0) return "0";
  if (!bytes || isNaN(bytes)) return "Invalid input";

  const GB = bytes / (1024 * 1024 * 1024); // Chia cho 1,073,741,824
  return `${GB.toFixed(2)}`;
}
