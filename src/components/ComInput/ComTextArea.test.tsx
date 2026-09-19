import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { TextAreaRef } from "antd/es/input/TextArea";
import { createRef, type ReactNode } from "react";
import type { FieldErrors, FieldValues } from "react-hook-form";
import ComTextArea from "./ComTextArea";
import { TestForm, type FormHandle } from "./testForm";

const setup = (
  ui: ReactNode,
  options: { defaultValues?: FieldValues; errors?: FieldErrors } = {},
) => {
  const form: FormHandle = {};
  const view = render(
    <TestForm form={form} {...options}>
      {ui}
    </TestForm>,
  );
  return { form, ...view };
};

describe("ComTextArea", () => {
  it("writes typed text to the form and reports it", async () => {
    const onChangeValue = vi.fn();
    const onChange = vi.fn();
    const ref = createRef<TextAreaRef>();
    const { form } = setup(
      <ComTextArea
        name="summary"
        type="numbers"
        rows={5}
        maxLength={200}
        label="Tóm tắt"
        subLabel="ngắn gọn"
        required
        onChangeValue={onChangeValue}
        onChange={onChange}
        ref={ref}
      />,
    );

    expect(screen.getByText("*")).toBeInTheDocument();
    expect(screen.getByText("ngắn gọn")).toBeInTheDocument();
    const textarea = screen.getByLabelText(/Tóm tắt/);
    expect(textarea).toHaveAttribute("rows", "5");
    expect(textarea).toHaveAttribute("maxlength", "200");
    expect(textarea).toHaveAttribute("type", "numbers");
    expect(ref.current?.resizableTextArea?.textArea).toBe(textarea);

    await userEvent.type(textarea, "Gói 1");
    expect(textarea).toHaveValue("Gói 1");
    expect(form.current?.getValues("summary")).toBe("Gói 1");
    expect(onChangeValue).toHaveBeenLastCalledWith("summary", "Gói 1");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("shows form values and prefers an explicit value", () => {
    setup(<ComTextArea name="a" placeholder="a" />, {
      defaultValues: { a: "từ form" },
    });
    expect(screen.getByPlaceholderText("a")).toHaveValue("từ form");

    setup(<ComTextArea name="b" placeholder="b" value="cố định" />);
    expect(screen.getByPlaceholderText("b")).toHaveValue("cố định");
  });

  it("shows the field error from the form", () => {
    const { container } = setup(<ComTextArea name="summary" />, {
      errors: { summary: { type: "required", message: "Bắt buộc" } },
    });
    expect(screen.getByText("Bắt buộc")).toBeInTheDocument();
    expect(container.querySelector(".ant-input-status-error")).not.toBeNull();
  });
});
