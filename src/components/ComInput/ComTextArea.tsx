import { forwardRef, type ChangeEvent, type ReactNode } from "react";
import {
  get,
  useFormContext,
  type FieldError as FormFieldError,
} from "react-hook-form";
import { v4 } from "uuid";
import { FieldError } from "../FieldError/FieldError";
import TextArea, {
  type TextAreaProps,
  type TextAreaRef,
} from "antd/es/input/TextArea";

export type ComTextAreaProps = TextAreaProps & {
  // form field in the surrounding FormProvider; the value is read and written there
  name: string;
  label?: ReactNode;
  subLabel?: ReactNode;
  // called with the value written to the form
  onChangeValue?: (name: string, value: string) => void;
  // passed on to the textarea element, no other effect
  type?: string;
  // accepted but not used
  search?: boolean;
  minValue?: number | string;
  maxValue?: number | string;
  decimalLength?: number;
};

// ignores onChange (register() passes one): values go to the form through setValue
const ComTextArea = forwardRef<TextAreaRef, ComTextAreaProps>(
  (
    {
      label,
      required,
      className,
      onChangeValue,
      onChange: _onChange,
      maxLength,
      search: _search,
      minValue: _minValue,
      rows,
      maxValue: _maxValue,
      subLabel,
      decimalLength: _decimalLength,
      ...props
    },
    ref,
  ) => {
    const {
      watch,
      formState: { errors },
      setValue,
    } = useFormContext();
    const valueWatch = watch(props.name);
    // const error = errors[props.name];
    const error: FormFieldError | undefined = get(errors, props.name);
    const inputId = v4();

    const onlyChangeWithCondition = (e: ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setValue(props.name, value);
      onChangeValue?.(props.name, value);
    };

    return (
      <>
        <div className={`${className}`}>
          {label && (
            <div className="mb-4 flex justify-between">
              <label htmlFor={inputId} className="text-paragraph font-bold">
                {label}
                {required && (
                  <span className="text-paragraph font-bold text-error-7 text-red-500">
                    *
                  </span>
                )}
              </label>
              {subLabel && <span className="ml-8">{subLabel}</span>}
            </div>
          )}

          <TextArea
            id={inputId}
            ref={ref}
            // showCount
            size="large"
            rows={rows}
            {...props}
            value={props.value ?? valueWatch}
            status={error && "error"}
            onChange={onlyChangeWithCondition}
            maxLength={maxLength}
          />

          {error && (
            <FieldError className="text-red-500">
              {error.message?.toString()}
            </FieldError>
          )}
        </div>
      </>
    );
  },
);

ComTextArea.displayName = "ComTextArea";

export default ComTextArea;
