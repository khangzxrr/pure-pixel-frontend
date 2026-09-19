import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { RefSelectProps } from "antd/es/select";
import { createRef, type ReactNode } from "react";
import type { FieldErrors } from "react-hook-form";
import ComSelect, { type ComSelectOption } from "./ComSelect";
import { TestForm, type FormHandle } from "./testForm";

const options: ComSelectOption[] = [
  { value: 3, label: "3 tháng" },
  { value: 6, label: "6 tháng\nPhổ biến" },
  { value: 12, label: "1 năm", disabled: true },
];

const setup = (ui: ReactNode, errors?: FieldErrors) => {
  const form: FormHandle = {};
  const view = render(
    <TestForm form={form} errors={errors}>
      {ui}
    </TestForm>,
  );
  return { form, ...view };
};

// option content holds every label line
const matchOption = (text: string) => (_: string, element: Element | null) =>
  !!element?.classList.contains("ant-select-item-option-content") &&
  (element.textContent ?? "").startsWith(text);

const option = (text: string) => screen.getByText(matchOption(text));

const openSelect = () => userEvent.click(screen.getByRole("combobox"));

describe("ComSelect", () => {
  it("reports the selection and shows the first label line", async () => {
    const onChangeValue = vi.fn();
    const onChange = vi.fn();
    const ref = createRef<RefSelectProps>();
    const { container, form } = setup(
      <ComSelect
        name="minOrderMonth"
        label="Thời hạn"
        subLabel="tháng"
        required
        options={options}
        onChangeValue={onChangeValue}
        onChange={onChange}
        ref={ref}
      />,
    );

    expect(screen.getByText("*")).toBeInTheDocument();
    expect(screen.getByText("tháng")).toBeInTheDocument();
    expect(ref.current?.focus).toBeInstanceOf(Function);

    await openSelect();
    expect(option("6 tháng")).toHaveTextContent("6 thángPhổ biến");
    expect(option("1 năm").closest(".ant-select-item")).toHaveClass(
      "ant-select-item-option-disabled",
    );
    await userEvent.click(option("6 tháng"));

    expect(onChangeValue).toHaveBeenCalledWith("minOrderMonth", 6);
    expect(onChange).not.toHaveBeenCalled();
    // the form value is only written when the selection is cleared
    expect(form.current?.getValues("minOrderMonth")).toBeUndefined();
    const selected = container.querySelector(".ant-select-selection-item");
    expect(selected).toHaveTextContent("6 tháng");
    expect(selected).not.toHaveTextContent("Phổ biến");
  });

  it("shows the controlled value", () => {
    const { container } = setup(
      <ComSelect name="m" options={options} value={6} />,
    );
    expect(container.querySelector(".ant-select-selection-item")).toHaveTextContent(
      "6 tháng",
    );
  });

  it("resets the form value when the selection is cleared", async () => {
    const onChangeValue = vi.fn();
    const { form } = setup(
      <ComSelect
        name="tags"
        mode="multiple"
        options={options}
        defaultValue={[3]}
        onChangeValue={onChangeValue}
      />,
    );
    form.current?.setValue("tags", [3]);

    await openSelect();
    await userEvent.click(option("3 tháng"));
    await userEvent.click(option("3 tháng"));

    expect(onChangeValue).toHaveBeenLastCalledWith("tags", []);
    expect(form.current?.getValues("tags")).toBe("");
  });

  it("treats an empty string value as cleared", async () => {
    const { form } = setup(
      <ComSelect
        name="choice"
        options={[{ value: "", label: "Không chọn" }, ...options]}
      />,
    );
    form.current?.setValue("choice", 3);

    await openSelect();
    await userEvent.click(option("Không chọn"));

    expect(form.current?.getValues("choice")).toBe("");
  });

  it("filters options by label when searching", async () => {
    setup(<ComSelect name="m" options={options} showSearch />);

    await userEvent.type(screen.getByRole("combobox"), "năm");

    expect(option("1 năm")).toBeInTheDocument();
    expect(screen.queryByText(matchOption("3 tháng"))).toBeNull();
  });

  it("shows the field error from the form", () => {
    const { container } = setup(<ComSelect name="m" options={options} />, {
      m: { type: "required", message: "Chọn thời hạn" },
    });
    expect(screen.getByText("Chọn thời hạn")).toBeInTheDocument();
    expect(container.querySelector(".ant-select-status-error")).not.toBeNull();
  });
});
