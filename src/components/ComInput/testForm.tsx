import type { ReactNode } from "react";
import {
  FormProvider,
  useForm,
  type FieldErrors,
  type FieldValues,
  type UseFormReturn,
} from "react-hook-form";

export type FormHandle = { current?: UseFormReturn<FieldValues> };

type TestFormProps = {
  children: ReactNode;
  defaultValues?: FieldValues;
  errors?: FieldErrors;
  form?: FormHandle;
};

// test helper: a FormProvider whose methods the test can read through `form`
export function TestForm({
  children,
  defaultValues,
  errors,
  form,
}: TestFormProps) {
  const methods = useForm({ defaultValues, errors });
  if (form) {
    form.current = methods;
  }
  return <FormProvider {...methods}>{children}</FormProvider>;
}
