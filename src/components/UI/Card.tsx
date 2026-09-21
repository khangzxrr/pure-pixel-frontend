import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "../../utils/cn";

export type CardPadding = "none" | "sm" | "md" | "lg";

type CardProps = {
  padding?: CardPadding;
  /** brightens the boundary on hover; the clickable child still owns the link or button */
  interactive?: boolean;
  as?: "div" | "article" | "li" | "section";
  children?: ReactNode;
} & HTMLAttributes<HTMLElement>;

const paddings: Record<CardPadding, string> = {
  none: "",
  sm: "p-3",
  md: "p-4",
  lg: "p-5",
};

/** The one card surface: flat, bordered, no default shadow. */
export default function Card({
  padding = "md",
  interactive = false,
  as: Tag = "div",
  className,
  children,
  ...rest
}: CardProps) {
  return (
    <Tag
      {...rest}
      className={cn(
        "rounded-card border border-stroke-subtle bg-surface-card text-ink-primary",
        interactive &&
          "transition-colors duration-150 hover:border-stroke motion-reduce:transition-none",
        paddings[padding],
        className,
      )}
    >
      {children}
    </Tag>
  );
}
