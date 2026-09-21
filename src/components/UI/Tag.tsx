import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "../../utils/cn";

export type TagTone =
  | "neutral"
  | "accent"
  | "success"
  | "warning"
  | "danger"
  | "info";

type TagProps = {
  tone?: TagTone;
  icon?: ReactNode;
  children: ReactNode;
} & HTMLAttributes<HTMLSpanElement>;

const tones: Record<TagTone, string> = {
  neutral: "bg-surface-elevated text-ink-secondary",
  accent: "bg-accent-subtle text-accent border border-accent-border",
  success: "bg-success-bg text-success border border-success-border",
  warning: "bg-warning-bg text-warning border border-warning-border",
  danger: "bg-danger-bg text-danger border border-danger-border",
  info: "bg-info-bg text-info border border-info-border",
};

/**
 * A passive label: EXIF values, categories, statuses. Status tags always carry text, never
 * colour alone. For something clickable use FilterChip or Button.
 */
export default function Tag({
  tone = "neutral",
  icon,
  className,
  children,
  ...rest
}: TagProps) {
  return (
    <span
      {...rest}
      className={cn(
        "inline-flex h-6 items-center gap-1 rounded-full px-2 text-meta",
        tones[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}
