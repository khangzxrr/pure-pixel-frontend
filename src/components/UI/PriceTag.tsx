import { cn } from "../../utils/cn";
import { formatCurrency } from "../../utils/formatCurrency";

export type PriceTagSize = "sm" | "md" | "lg";

type PriceTagProps = {
  /** null, undefined or 0 means "not priced yet", matching the selling API */
  value?: number | null;
  /** prefixes "Từ" when the photo has several purchasable variants */
  from?: boolean;
  size?: PriceTagSize;
  /** the detail page's selected tier is the one place a price is accent coloured */
  emphasis?: boolean;
  className?: string;
};

const sizes: Record<PriceTagSize, string> = {
  sm: "text-body font-semibold",
  md: "text-card-title",
  lg: "text-page-title",
};

export default function PriceTag({
  value,
  from = false,
  size = "md",
  emphasis = false,
  className,
}: PriceTagProps) {
  const hasPrice = typeof value === "number" && value > 0;

  if (!hasPrice) {
    return (
      <span className={cn("text-body text-ink-muted", className)}>
        Chưa có giá
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-baseline gap-1 whitespace-nowrap tabular-nums",
        emphasis ? "text-accent" : "text-ink-primary",
        className,
      )}
    >
      {from && <span className="text-meta text-ink-muted">Từ</span>}
      <span className={sizes[size]}>{formatCurrency(value)}</span>
    </span>
  );
}
