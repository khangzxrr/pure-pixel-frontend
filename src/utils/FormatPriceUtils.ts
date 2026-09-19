export default function formatPrice(
  price: number | string | null | undefined,
): string {
  return price?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ";
}
