import {
  SearchOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
} from "@ant-design/icons";
import { InputNumber } from "antd";
import React from "react";
import { useFormContext } from "react-hook-form";
import { v4 } from "uuid";
import { get } from "lodash";
import { FieldError } from "../FieldError/FieldError";
import BigNumber from "bignumber.js";

const checkValidType = (str, value) => {
  return value.split("").every((item) => str.split("").includes(item));
};

const ComNumber = React.forwardRef(
  (
    {
      label,
      required,
      className,
      onChangeValue,
      min,
      max,
      money,
      subLabel,
      decimalLength,
      defaultValue,
      ...props
    },
    ref
  ) => {
    const {
      watch,
      formState: { errors },
      setValue,
    } = useFormContext();
    const valueWatch = watch(props.name);
    const error = get(errors, props.name);
    const inputId = v4();

    const onlyChangeWithCondition = (value) => {
      let newValue = value?.toString() ?? "";

      if (props.type === "money") {
        newValue = newValue.replace(/[^0-9]/g, ""); // Chỉ cho phép nhập số
      }

      setValue(props.name, newValue);
      onChangeValue?.(props.name, newValue);
    };

    return (
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
        <InputNumber
          id={inputId}
          style={{ width: "100%" }}
          ref={ref}
          size="large"
          {...props}
          min={min}
          max={max}
          defaultValue={defaultValue}
          status={error ? "error" : ""}
          onChange={onlyChangeWithCondition}
          formatter={
            money
              ? (value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              : undefined
          }
        />

        {error && (
          <FieldError className="text-red-500">
            {error.message?.toString()}
          </FieldError>
        )}
      </div>
    );
  }
);

export default ComNumber;
