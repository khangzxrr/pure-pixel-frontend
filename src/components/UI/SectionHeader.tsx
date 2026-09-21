import type { ReactNode } from "react";

import { cn } from "../../utils/cn";

type SectionHeaderProps = {
  title: string;
  /** count or short qualifier shown next to the title, e.g. "126 ảnh" */
  meta?: ReactNode;
  description?: string;
  /** sort, view switcher, filter button … */
  actions?: ReactNode;
  className?: string;
};

/**
 * The heading block above a page's toolbar. Page titles live in the content, not in the topbar,
 * so every public page repeats the same rhythm: title → optional meta → actions.
 */
export default function SectionHeader({
  title,
  meta,
  description,
  actions,
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-start justify-between gap-3",
        className,
      )}
    >
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex flex-wrap items-baseline gap-2">
          <h1 className="text-section-title text-ink-primary">{title}</h1>
          {meta ? <span className="text-body text-ink-muted">{meta}</span> : null}
        </div>
        {description ? (
          <p className="text-body text-ink-secondary">{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}
