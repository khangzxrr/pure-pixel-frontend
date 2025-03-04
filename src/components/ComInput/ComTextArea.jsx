import { SearchOutlined, EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import { Input } from "antd";
import React from "react";
import { useForm, useFormContext } from "react-hook-form";
import { v4 } from "uuid";
import { isEmpty, isNaN, get } from "lodash";
import { FieldError } from "../FieldError/FieldError";
import BigNumber from "bignumber.js";
import TextArea from "antd/es/input/TextArea";

const checkValidType = (str, value) => {
  return value.split('').every((item) => str.split('').includes(item));
};
const HALF_SIZE_LIST =
  "!#$%&'()*+,-./:;<=>?@[]^_`{|}~" +
  '"' +
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz｡｢｣､･ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝﾞﾟ';
const isHalfSize = (value) => {
  return value.split("").every((item) => HALF_SIZE_LIST.indexOf(item) !== -1);
};
const integerRegex = /^-?\d*$/;
const positiveIntegerRegex = /^\d*$/;
const decimalRegex = /^-?\d*\.?\d*$/;
const positiveDecimalRegex = /^\d*\.?\d*$/;
const emailRegex = /^[A-Za-z0-9@.+-_]*$/g;
const passwordRegex = /([A-Z][a-z][0-9][~!@#$%^&*()_+`{}])\w*$/g;
const integerStr = '-0123456789';
const positiveIntegerStr = '0123456789';
const decimalStr = '-.0123456789';
const decimalPositiveStr = '.0123456789';

const toBigDecimal = (value, length) => {
  let valueTmp = value.toString();
  if (valueTmp.includes(".")) {
    const decimals = valueTmp.split(".")[1];
    if (decimals.length > (length ?? 0)) {
      valueTmp = valueTmp.split('.')[0] + '.' + decimals.slice(0, length ?? 0);
    }
  }
  const myNumber = new BigNumber(valueTmp);
  if (
    myNumber.toString().split('.').length > 0 &&
    (myNumber.toString().split('.')[1] ?? "").length <= length
  ) {
    return myNumber.toString();
  }
  return myNumber.toFixed(length);
};

const ComTextArea = React.forwardRef(
  (
    {
      label,
      required,
      className,
      onChangeValue,
      onChange,
      maxLength,
      search,
      minValue,
      rows,
      maxValue,
      subLabel,
      decimalLength,
      ...props
    },
    ref
  ) => {
    const { watch, formState: { errors }, setValue } = useFormContext();
    const valueWatch = watch(props.name);
    // const error = errors[props.name];
        const error = get(errors, props.name);
    const inputId = v4();

    const onlyChangeWithCondition = (e) => {
      let value = '';
      value =
        e.clipboardData?.getData('text') ??
        e.target.value;
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
            prefix={
              search ? (
                <SearchOutlined className="text-h3 text-grey" />
              ) : undefined
            }
            id={inputId}
            ref={ref}
            // showCount
            size="large"
            rows={rows}
            {...props}
            value={props.value ?? valueWatch}
            status={error && 'error'}
            onChange={onlyChangeWithCondition}
            maxLength={maxLength}
          />

          {error && <FieldError className="text-red-500">{error.message?.toString()}</FieldError>}
        </div>
      </>
    );
  }
);

export default ComTextArea;
