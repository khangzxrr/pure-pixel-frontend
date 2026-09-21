import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "../../utils/cn";
import Spinner from "./Spinner";
import { focusRing, interactive } from "./styles";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** keeps the label and width, swaps the leading icon for a spinner and blocks re-submits */
  loading?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  fullWidth?: boolean;
  children?: ReactNode;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children">;

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-accent-contrast hover:bg-accent-hover active:bg-accent-active",
  secondary:
    "border border-stroke-strong bg-surface-elevated text-ink-primary hover:bg-surface-hover",
  ghost: "text-ink-secondary hover:bg-surface-hover hover:text-ink-primary",
  danger:
    "border border-danger-border bg-danger-bg text-danger hover:bg-danger-border hover:text-ink-primary",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-8 gap-1.5 px-3 text-body",
  md: "h-10 gap-2 px-4 text-body",
  lg: "h-12 gap-2 px-5 text-body",
};

export default function Button({
  variant = "secondary",
  size = "md",
  loading = false,
  leadingIcon,
  trailingIcon,
  fullWidth = false,
  className,
  children,
  disabled,
  type = "button",
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      {...rest}
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex items-center justify-center rounded-control font-medium",
        interactive,
        focusRing,
        sizes[size],
        variants[variant],
        fullWidth && "w-full",
        isDisabled &&
          "cursor-not-allowed border-transparent bg-surface-panel text-ink-disabled hover:bg-surface-panel hover:text-ink-disabled",
        className,
      )}
    >
      {loading ? <Spinner /> : leadingIcon}
      {children}
      {!loading && trailingIcon}
    </button>
  );
}
