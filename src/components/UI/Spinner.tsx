import { cn } from "../../utils/cn";

type SpinnerProps = {
  className?: string;
  /** pixel size of the square spinner */
  size?: number;
};

/** Token-coloured inline spinner. Decorative: the surrounding control owns the busy state. */
export default function Spinner({ className, size = 16 }: SpinnerProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      className={cn("animate-spin motion-reduce:animate-none", className)}
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="2.5"
        opacity="0.25"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
