import { InputNumber, type InputNumberProps } from "antd";
import { forwardRef, type ReactNode } from "react";
import {
  get,
  useFormContext,
  type ChangeHandler,
  type FieldError as FormFieldError,
} from "react-hook-form";
import { v4 } from "uuid";
import { FieldError } from "../FieldError/FieldError";

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

type NumberValue = string | number | null;

export type ComNumberProps = Omit<InputNumberProps, "onChange"> & {
  // form field in the surrounding FormProvider; the value is written there
  name: string;
  label?: ReactNode;
  subLabel?: ReactNode;
  // "money" and "numbers" strip non-digits from the value given to onChangeValue
  type?: string;
  // called with the (cleaned) value
  onChangeValue?: (name: string, value: NumberValue) => void;
  // ignored (register() passes one): the value goes to the form through setValue
  onChange?: ChangeHandler | InputNumberProps["onChange"];
  // adds thousands separators to the displayed value
  money?: boolean;
  // accepted but not used
  search?: boolean;
  decimalLength?: number;
};

const ComNumber = forwardRef<HTMLInputElement, ComNumberProps>(
  (
    {
      label,
      required,
      className,
      onChangeValue,
      onChange: _onChange,
      maxLength: _maxLength,
      search: _search,
      min,
      max,
      money,
      subLabel,
      decimalLength: _decimalLength,
      defaultValue,
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

    const onlyChangeWithCondition = (e: NumberValue) => {
      let value = e;

      switch (props.type) {
        case "emails":
          if (
            typeof value !== "string" ||
            !isHalfSize(value) ||
            !value.match(emailRegex)
          ) {
            return;
          }
          break;
        case "code":
          if (
            typeof value !== "string" ||
            !checkValidType(decimalPositiveStr, value)
          ) {
            return;
          }
          break;
        case "money": {
          // cleared input gives null
          const numericValues = (e ?? "").toString();
          value = numericValues.replace(/[^0-9]/g, "");
          break;
        }
        case "numbers": {
          // if (!checkValidType(positiveIntegerStr, value)) {
          //   return;
          // }
          // if (e==='') {
          const numericValue = (e ?? "").toString();
          value = numericValue.replace(/[^0-9]/g, "");
          // }
          break;
        }
        default:
          break;
      }

      setValue(props.name, e);
      onChangeValue?.(props.name, value);
      // console.log(value);
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
          {money ? (
            <InputNumber
              id={inputId}
              style={{ width: "100%" }}
              ref={ref}
              size="large"
              {...props}
              // step={1}
              min={min}
              max={max}
              // formatter={formatterNumber}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              // parser={parserNumber}
              defaultValue={defaultValue}
              status={error && "error"}
              onChange={onlyChangeWithCondition}
            />
          ) : (
            <InputNumber
              id={inputId}
              style={{ width: "100%" }}
              ref={ref}
              size="large"
              {...props}
              min={min}
              max={max}
              defaultValue={defaultValue}
              status={error && "error"}
              onChange={onlyChangeWithCondition}
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

ComNumber.displayName = "ComNumber";

export default ComNumber;
