import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "../../utils/cn";
import { focusRing, interactive } from "./styles";

export type IconButtonTone = "neutral" | "media";
export type IconButtonSize = "sm" | "md" | "lg";

type IconButtonProps = {
  /** required: icon-only controls have no text, so this becomes the accessible name */
  label: string;
  icon: ReactNode;
  tone?: IconButtonTone;
  size?: IconButtonSize;
  /** renders the control as a toggle and reflects its state to assistive tech */
  pressed?: boolean;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "aria-label">;

const tones: Record<IconButtonTone, string> = {
  neutral: "text-ink-secondary hover:bg-surface-hover hover:text-ink-primary",
  media: "bg-surface-scrim text-ink-primary hover:bg-surface-hover",
};

const sizes: Record<IconButtonSize, string> = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
};

export default function IconButton({
  label,
  icon,
  tone = "neutral",
  size = "md",
  pressed,
  className,
  type = "button",
  disabled,
  ...rest
}: IconButtonProps) {
  return (
    <button
      {...rest}
      type={type}
      disabled={disabled}
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-control",
        interactive,
        focusRing,
        sizes[size],
        tones[tone],
        pressed && "bg-accent-subtle text-accent hover:bg-accent-subtle-hover",
        disabled && "cursor-not-allowed text-ink-disabled hover:bg-transparent",
        className,
      )}
    >
      {icon}
    </button>
  );
}
