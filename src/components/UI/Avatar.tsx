import { useState } from "react";

import { cn } from "../../utils/cn";

export type AvatarSize = 24 | 32 | 40 | 48 | 64;

type AvatarProps = {
  src?: string | null;
  /** used for the accessible name and for the initials fallback */
  name?: string | null;
  size?: AvatarSize;
  ring?: boolean;
  className?: string;
};

const textForSize: Record<AvatarSize, string> = {
  24: "text-meta",
  32: "text-meta",
  40: "text-body",
  48: "text-body",
  64: "text-card-title",
};

function initialsOf(name?: string | null): string {
  if (!name) return "";
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";
  const letters = words.length === 1 ? words[0][0] : words[words.length - 2][0] + words[words.length - 1][0];
  return letters.toUpperCase();
}

/**
 * Avatar with a deterministic fallback chain: image → initials → empty tinted circle.
 * A failed image never changes the layout and never shows a light placeholder graphic.
 */
export default function Avatar({
  src,
  name,
  size = 32,
  ring = false,
  className,
}: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const initials = initialsOf(name);
  const showImage = Boolean(src) && !failed;

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-elevated font-medium text-ink-secondary",
        textForSize[size],
        ring && "ring-1 ring-stroke-subtle",
        className,
      )}
      style={{ width: size, height: size }}
    >
      {showImage ? (
        <img
          src={src ?? undefined}
          alt={name ? `Ảnh đại diện của ${name}` : "Ảnh đại diện"}
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <span aria-hidden="true">{initials}</span>
      )}
    </span>
  );
}
