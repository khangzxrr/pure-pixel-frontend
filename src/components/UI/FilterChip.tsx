import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "../../utils/cn";
import { focusRing, interactive } from "./styles";

type FilterChipProps = {
  selected?: boolean;
  icon?: ReactNode;
  children: ReactNode;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children">;

/**
 * A toggleable filter value. Selection is announced with `aria-pressed` and shown with the
 * accent surface, never with a border alone.
 */
export default function FilterChip({
  selected = false,
  icon,
  className,
  type = "button",
  children,
  ...rest
}: FilterChipProps) {
  return (
    <button
      {...rest}
      type={type}
      aria-pressed={selected}
      className={cn(
        "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-body",
        interactive,
        focusRing,
        selected
          ? "border-accent-border bg-accent-subtle text-accent hover:bg-accent-subtle-hover"
          : "border-transparent bg-surface-elevated text-ink-secondary hover:bg-surface-hover hover:text-ink-primary",
        className,
      )}
    >
      {icon}
      {children}
    </button>
  );
}
