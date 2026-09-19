import { Button, type ButtonProps } from "antd";
import { forwardRef, type ReactNode } from "react";

export type ComButtonProps = ButtonProps & {
  // when set the button ignores onClick (the icon handles the action)
  endIcon?: ReactNode;
  textColor?: string;
};

const ComButton = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ComButtonProps
>(
  (
    {
      endIcon,
      className = "",
      textColor = "text-white",
      onClick,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <Button
        ref={ref}
        type="default"
        size="large"
        className={`flex w-44 mg mx-auto justify-center  px-3 py-1.5 text-sm font-semibold leading-6
          shadow-sm bg-[#32353b] focus-visible:outline focus-visible:outline-2
          focus-visible:outline-offset-2 focus-visible:bg-[#080808] ${textColor} ${className}`}
        {...props}
        onClick={endIcon ? undefined : onClick}
      >
        {children}
      </Button>
    );
  },
);

ComButton.displayName = "ComButton";

export default ComButton;
