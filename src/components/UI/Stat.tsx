import type { ReactNode } from "react";

import { cn } from "../../utils/cn";

type StatProps = {
  value: ReactNode;
  label: string;
  layout?: "inline" | "stacked";
  className?: string;
};

/**
 * A number with its unit. Unknown values are omitted by the caller rather than rendered as a
 * fabricated zero. Numerals are tabular so columns of stats stay aligned.
 */
export default function Stat({
  value,
  label,
  layout = "inline",
  className,
}: StatProps) {
  if (layout === "stacked") {
    return (
      <div className={cn("flex flex-col gap-0.5", className)}>
        <span className="text-section-title tabular-nums text-ink-primary">
          {value}
        </span>
        <span className="text-meta text-ink-muted">{label}</span>
      </div>
    );
  }

  return (
    <span className={cn("inline-flex items-baseline gap-1 tabular-nums", className)}>
      <span className="text-body font-semibold text-ink-primary">{value}</span>
      <span className="text-meta text-ink-muted">{label}</span>
    </span>
  );
}
