import { Select, type SelectProps } from "antd";
import type { RefSelectProps } from "antd/es/select";
import { forwardRef, Fragment, type ReactNode } from "react";
import {
  get,
  useFormContext,
  type ChangeHandler,
  type FieldError as FormFieldError,
} from "react-hook-form";
import { v4 } from "uuid";
import { FieldError } from "../FieldError/FieldError";

export type ComSelectOption = {
  value: string | number;
  // lines after the first one only show in the dropdown
  label: string;
  disabled?: boolean;
};

export type ComSelectProps = Omit<SelectProps, "onChange" | "options"> & {
  // form field in the surrounding FormProvider; cleared selections reset it to ""
  name: string;
  label?: ReactNode;
  subLabel?: ReactNode;
  required?: boolean;
  options: ComSelectOption[];
  // called with every selection
  onChangeValue?: (name: string, value: unknown) => void;
  // ignored (register() passes one)
  onChange?: ChangeHandler | SelectProps["onChange"];
  // accepted but not used
  maxLength?: number;
  search?: boolean;
  min?: string | number;
  max?: string | number;
  money?: boolean;
  decimalLength?: number;
};

const isEmptySelection = (value: unknown) =>
  (typeof value === "string" || Array.isArray(value)) && value.length === 0;

const ComSelect = forwardRef<RefSelectProps, ComSelectProps>(
  (
    {
      label,
      required,
      className,
      options,
      onChangeValue,
      onChange: _onChange,
      maxLength: _maxLength,
      search: _search,
      min: _min,
      value,
      max: _max,
      money: _money,
      subLabel,
      decimalLength: _decimalLength,
      defaultValue: _defaultValue,
      ...props
    },
    ref,
  ) => {
    const {
      formState: { errors },
      setValue,
    } = useFormContext();
    // const error = errors[props.name];
    const error: FormFieldError | undefined = get(errors, props.name);
    const inputId = v4();

    const onlyChangeWithCondition = (e: unknown) => {
      // setValue(props.name, e);
      if (isEmptySelection(e)) {
        setValue(props.name, "");
      }
      onChangeValue?.(props.name, e);
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
          <Select
            ref={ref}
            status={error && "error"}
            value={value}
            onChange={onlyChangeWithCondition}
            optionLabelProp="label"
            dropdownRender={(menu) => <div>{menu}</div>}
            filterOption={(input, option) => {
              const optionLabel = option?.label;
              return (
                typeof optionLabel === "string" &&
                optionLabel.toLowerCase().includes(input.toLowerCase())
              );
            }}
            {...props}
          >
            {options.map((option) => (
              <Select.Option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                label={option.label.split("\n")[0]}
                searchString={option?.label}
              >
                {option.label.split("\n").map((line, index) => (
                  <Fragment key={index}>
                    {line}
                    <br />
                  </Fragment>
                ))}
              </Select.Option>
            ))}
          </Select>
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

ComSelect.displayName = "ComSelect";

export default ComSelect;
