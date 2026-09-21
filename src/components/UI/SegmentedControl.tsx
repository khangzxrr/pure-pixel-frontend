import { useId } from "react";

import { cn } from "../../utils/cn";
import { focusRing, interactive } from "./styles";

export type SegmentedOption<T extends string> = {
  value: T;
  label: string;
  /** optional short hint announced after the label, e.g. the resulting column count */
  hint?: string;
};

type SegmentedControlProps<T extends string> = {
  /** accessible name for the group, e.g. "Mật độ hiển thị" */
  label: string;
  value: T;
  options: SegmentedOption<T>[];
  onChange: (value: T) => void;
  className?: string;
};

/**
 * Radio-group segmented control (arrow keys move between options, as native radios do).
 * Used for grid density and other mutually exclusive display settings.
 */
export default function SegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange,
  className,
}: SegmentedControlProps<T>) {
  const name = useId();

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(
        "inline-flex items-center gap-1 rounded-control bg-surface-panel p-1",
        className,
      )}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <label
            key={option.value}
            className={cn(
              "inline-flex h-8 cursor-pointer items-center rounded-ui-sm px-3 text-body",
              interactive,
              focusRing,
              selected
                ? "bg-surface-hover font-medium text-ink-primary"
                : "text-ink-muted hover:text-ink-primary",
            )}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={selected}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
            <span>{option.label}</span>
            {option.hint ? (
              <span className="sr-only">, {option.hint}</span>
            ) : null}
          </label>
        );
      })}
    </div>
  );
}
