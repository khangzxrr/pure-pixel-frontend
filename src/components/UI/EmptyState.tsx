import type { ReactNode } from "react";

import { cn } from "../../utils/cn";

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description?: string;
  /** one primary action; keep empty states to a single clear next step */
  action?: ReactNode;
  /** compact fits inside panels and sidebars, standard fills a page region */
  size?: "compact" | "standard";
  className?: string;
};

/**
 * Replaces the ten hand-copied "100px icon + grey sentence" blocks. An empty state always says
 * what is empty, why, and what to do next.
 */
export default function EmptyState({
  icon,
  title,
  description,
  action,
  size = "standard",
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 text-center",
        size === "compact"
          ? "min-h-[160px] gap-2 p-4"
          : "min-h-[280px] rounded-card border border-stroke-subtle bg-surface-panel p-8",
        className,
      )}
    >
      {icon ? (
        <span
          aria-hidden="true"
          className="flex h-12 w-12 items-center justify-center text-ink-muted [&>svg]:h-6 [&>svg]:w-6"
        >
          {icon}
        </span>
      ) : null}
      <div className="flex max-w-[400px] flex-col gap-1">
        <p className="text-card-title text-ink-primary">{title}</p>
        {description ? (
          <p className="text-body text-ink-secondary">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
