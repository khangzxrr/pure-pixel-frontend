import type { ComponentProps } from "react";

type FieldErrorProps = ComponentProps<"label">;

export const FieldError = ({
  children,
  className = "",
  ...props
}: FieldErrorProps) => {
  return (
    <label className={className} {...props}>
      {children}
    </label>
  );
};
