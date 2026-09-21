import { cn } from "../../utils/cn";

type SkeletonBlockProps = {
  /** tailwind height/width/ratio classes describing the final content */
  className?: string;
};

/** A single placeholder shape. Purely decorative; the container owns `aria-busy`. */
export function SkeletonBlock({ className }: SkeletonBlockProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "animate-pulse rounded-ui-sm bg-surface-elevated motion-reduce:animate-none",
        className,
      )}
    />
  );
}

type SkeletonTextProps = {
  lines?: number;
  className?: string;
};

/** Stack of text lines; the last one is shorter to suggest a paragraph. */
export function SkeletonText({ lines = 2, className }: SkeletonTextProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {Array.from({ length: lines }, (_, index) => (
        <SkeletonBlock
          key={index}
          className={cn("h-4", index === lines - 1 ? "w-2/3" : "w-full")}
        />
      ))}
    </div>
  );
}

/**
 * A masonry-shaped placeholder grid with deterministic ratios, so the first paint of a photo
 * page already has the composition of the loaded page instead of a centred spinner.
 */
export function PhotoGridSkeleton({
  columns = 4,
  items = 12,
}: {
  columns?: number;
  items?: number;
}) {
  const ratios = ["aspect-square", "aspect-[4/5]", "aspect-[4/3]", "aspect-[3/4]"];

  return (
    <div
      aria-hidden="true"
      className={cn(
        "grid gap-4",
        columns >= 5
          ? "grid-cols-2 md:grid-cols-3 xl:grid-cols-5"
          : columns === 4
            ? "grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
            : columns === 3
              ? "grid-cols-2 lg:grid-cols-3"
              : "grid-cols-1 sm:grid-cols-2",
      )}
    >
      {Array.from({ length: items }, (_, index) => (
        <SkeletonBlock
          key={index}
          className={cn("w-full rounded-card", ratios[index % ratios.length])}
        />
      ))}
    </div>
  );
}

/** Card-shaped placeholder used by the photographer and product grids. */
export function CardGridSkeleton({
  columns = 4,
  items = 8,
}: {
  columns?: number;
  items?: number;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "grid gap-4",
        columns >= 4
          ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4"
          : columns === 3
            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            : "grid-cols-1 sm:grid-cols-2",
      )}
    >
      {Array.from({ length: items }, (_, index) => (
        <div
          key={index}
          className="flex flex-col gap-3 rounded-card border border-stroke-subtle bg-surface-card p-3"
        >
          <SkeletonBlock className="aspect-[4/3] w-full rounded-control" />
          <SkeletonBlock className="h-4 w-3/4" />
          <SkeletonBlock className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}
