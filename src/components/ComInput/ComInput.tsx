import {
  SearchOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
} from "@ant-design/icons";
import { Input, type InputProps, type InputRef } from "antd";
import { forwardRef, type ChangeEvent, type ReactNode } from "react";
import {
  get,
  useFormContext,
  type FieldError as FormFieldError,
} from "react-hook-form";
import { v4 } from "uuid";
import { FieldError } from "../FieldError/FieldError";
import BigNumber from "bignumber.js";

const checkValidType = (str: string, value: string) => {
  return value.split("").every((item) => str.split("").includes(item));
};
const HALF_SIZE_LIST =
  "!#$%&'()*+,-./:;<=>?@[]^_`{|}~" +
  '"' +
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz｡｢｣､･ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝﾞﾟ";
const isHalfSize = (value: string) => {
  return value.split("").every((item) => HALF_SIZE_LIST.indexOf(item) !== -1);
};
const emailRegex = /^[A-Za-z0-9@.+-_]*$/g;
const decimalPositiveStr = ".0123456789";
function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

function capitalizeFullName(fullName: string) {
  return fullName.split(" ").map(capitalizeFirstLetter).join(" ");
}
const toBigDecimal = (value: string, length: number) => {
  let valueTmp = value.toString();
  if (valueTmp.includes(".")) {
    const decimals = valueTmp.split(".")[1];
    if (decimals.length > length) {
      valueTmp = valueTmp.split(".")[0] + "." + decimals.slice(0, length);
    }
  }
  const myNumber = new BigNumber(valueTmp);
  if (
    myNumber.toString().split(".").length > 0 &&
    (myNumber.toString().split(".")[1] ?? "").length <= length
  ) {
    return myNumber.toString();
  }
  return myNumber.toFixed(length);
};

export type ComInputProps = InputProps & {
  // form field in the surrounding FormProvider; the value is read and written there
  name: string;
  label?: ReactNode;
  subLabel?: ReactNode;
  // also: "emails", "code", "name", "numbers", "numberFloat", "positiveDecimal", "positiveInteger"
  type?: string;
  // called with the value written to the form
  onChangeValue?: (name: string, value: string) => void;
  search?: boolean;
  // bounds applied on blur for positiveDecimal / positiveInteger
  minValue?: number | string;
  maxValue?: number | string;
  decimalLength?: number;
  // passed by some callers; not shown, errors come from the form state
  error?: string;
};

// ignores onChange (register() passes one): values go to the form through setValue
const ComInput = forwardRef<InputRef, ComInputProps>(
  (
    {
      label,
      required,
      className,
      onChangeValue,
      onChange: _onChange,
      maxLength,
      search,
      minValue,
      maxValue,
      subLabel,
      decimalLength,
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

    const onlyChangeWithCondition = (
      e: ChangeEvent<HTMLInputElement> & { clipboardData?: DataTransfer },
    ) => {
      let value = "";
      value = e.clipboardData?.getData("text") ?? e.target.value;
      if (props.type === "password" && !isHalfSize(value)) {
        return;
      }
      switch (props.type) {
        case "emails":
          if (!isHalfSize(value) || !value.match(emailRegex)) {
            return;
          }
          break;
        case "code":
          if (!checkValidType(decimalPositiveStr, value)) {
            return;
          }
          break;
        case "name":
          value = capitalizeFullName(value);
          break;
        case "numbers":
          // if (!checkValidType(positiveIntegerStr, value)) {
          //   return;
          // }
          value = value.replace(/[^0-9]/g, "");
          break;
        case "numberFloat":
          // if (!checkValidType(positiveIntegerStr, value)) {
          //   return;
          // }
          value = value.replace(/[^0-9.]/g, "");
          break;
        default:
          break;
      }

      if (maxLength && value.length > maxLength) {
        value = value.slice(0, maxLength);
      }

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
          {props.type === "password" ? (
            <Input.Password
              id={inputId}
              ref={ref}
              size="large"
              {...props}
              value={props.value ?? valueWatch}
              status={error && "error"}
              onChange={onlyChangeWithCondition}
              iconRender={(visible) =>
                visible ? (
                  <EyeOutlined tabIndex={0} />
                ) : (
                  <EyeInvisibleOutlined tabIndex={0} />
                )
              }
            />
          ) : (
            <Input
              prefix={
                search ? (
                  <SearchOutlined className="text-h3 text-grey" />
                ) : undefined
              }
              id={inputId}
              ref={ref}
              className="12"
              size="large"
              {...props}
              value={props.value ?? valueWatch}
              status={error && "error"}
              onChange={onlyChangeWithCondition}
              onBlur={(e) => {
                if (
                  props.type === "positiveDecimal" ||
                  props.type === "positiveInteger"
                ) {
                  let value =
                    e.target.value.length > 0 &&
                    !Number.isNaN(Number(e.target.value))
                      ? e.target.value
                      : "0";
                  if (!Number.isNaN(Number(decimalLength))) {
                    value = toBigDecimal(value, Number(decimalLength));
                  }
                  if (
                    !Number.isNaN(maxValue) &&
                    Number(value) > Number(maxValue)
                  ) {
                    value = String(maxValue);
                  }
                  if (
                    !Number.isNaN(minValue) &&
                    Number(value) < Number(minValue)
                  ) {
                    value = String(minValue);
                  }
                  setValue(props.name, value);
                }
              }}
            />
          )}
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

ComInput.displayName = "ComInput";

export default ComInput;
