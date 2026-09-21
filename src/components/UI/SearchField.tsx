import type { InputHTMLAttributes } from "react";

import { cn } from "../../utils/cn";
import { focusRing } from "./styles";

type SearchFieldProps = {
  /** accessible name; search inputs must not rely on the placeholder alone */
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  className?: string;
} & Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange" | "onSubmit" | "className"
>;

/**
 * One search control for every page: icon, 40px control, label for screen readers, Enter to
 * submit. Width is decided by the caller so headers and toolbars stay consistent.
 */
export default function SearchField({
  label,
  value,
  onValueChange,
  onSubmit,
  placeholder = "Tìm kiếm…",
  className,
  id,
  ...rest
}: SearchFieldProps) {
  const inputId = id ?? "search-field";

  return (
    <div
      className={cn(
        "flex h-10 items-center gap-2 rounded-control border border-stroke-subtle bg-surface-card px-3",
        "focus-within:border-accent",
        className,
      )}
    >
      <label htmlFor={inputId} className="sr-only">
        {label}
      </label>
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-5 w-5 shrink-0 text-ink-muted"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" strokeLinecap="round" />
      </svg>
      <input
        {...rest}
        id={inputId}
        type="search"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onValueChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") onSubmit?.();
        }}
        className={cn(
          "h-full w-full min-w-0 bg-transparent text-body text-ink-primary placeholder:text-ink-muted",
          focusRing,
        )}
      />
    </div>
  );
}
