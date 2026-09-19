import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { InputRef } from "antd";
import { createRef, type ReactNode } from "react";
import type { FieldErrors, FieldValues } from "react-hook-form";
import ComInput from "./ComInput";
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

describe("ComInput", () => {
  it("writes typed values to the form and reports them", async () => {
    const onChangeValue = vi.fn();
    const onChange = vi.fn();
    const ref = createRef<InputRef>();
    const { form } = setup(
      <ComInput
        name="title"
        label="Tiêu đề"
        subLabel="tối đa 50 ký tự"
        required
        placeholder="Tên"
        onChangeValue={onChangeValue}
        onChange={onChange}
        ref={ref}
      />,
    );

    expect(screen.getByText("*")).toBeInTheDocument();
    expect(screen.getByText("tối đa 50 ký tự")).toBeInTheDocument();
    const input = screen.getByLabelText(/Tiêu đề/);
    await userEvent.type(input, "Ảnh");

    expect(input).toHaveValue("Ảnh");
    expect(form.current?.getValues("title")).toBe("Ảnh");
    expect(onChangeValue).toHaveBeenLastCalledWith("title", "Ảnh");
    expect(onChange).not.toHaveBeenCalled();
    expect(ref.current?.input).toBe(input);
  });

  it("shows form values and prefers an explicit value", () => {
    setup(<ComInput name="a" placeholder="a" />, {
      defaultValues: { a: "từ form" },
    });
    expect(screen.getByPlaceholderText("a")).toHaveValue("từ form");

    setup(<ComInput name="b" placeholder="b" value="cố định" />, {
      defaultValues: { b: "từ form" },
    });
    expect(screen.getByPlaceholderText("b")).toHaveValue("cố định");
  });

  it.each([
    ["name", "hoang minh", "Hoang Minh"],
    ["numbers", "a1b2", "12"],
    ["numberFloat", "1.5x", "1.5"],
    ["emails", "ab!c", "abc"],
    ["emails", "aé", "a"],
    ["code", "1.a2", "1.2"],
    ["text", "tự do", "tự do"],
  ])("cleans %s input: %s", async (type, typed, expected) => {
    const { form } = setup(<ComInput name="field" type={type} placeholder="f" />);
    await userEvent.type(screen.getByPlaceholderText("f"), typed);
    expect(form.current?.getValues("field")).toBe(expected);
  });

  it("limits the length", async () => {
    const { form } = setup(
      <ComInput name="field" maxLength={3} placeholder="f" />,
    );
    await userEvent.type(screen.getByPlaceholderText("f"), "abcdef");
    expect(form.current?.getValues("field")).toBe("abc");
  });

  it("renders a password input that only accepts half-size characters", async () => {
    const { form } = setup(
      <ComInput name="password" type="password" placeholder="Mật khẩu" />,
    );
    const input = screen.getByPlaceholderText("Mật khẩu");
    await userEvent.type(input, "abá1");

    expect(form.current?.getValues("password")).toBe("ab1");
    expect(input).toHaveAttribute("type", "password");
    await userEvent.click(screen.getByRole("img", { name: "eye-invisible" }));
    expect(input).toHaveAttribute("type", "text");
    expect(screen.getByRole("img", { name: "eye" })).toBeInTheDocument();
  });

  it("shows a search icon", () => {
    setup(<ComInput name="q" search />);
    expect(screen.getByRole("img", { name: "search" })).toBeInTheDocument();
  });

  it("shows the field error from the form, nested names included", () => {
    const { container } = setup(
      <>
        <ComInput name="title" />
        <ComInput name="descriptions[0]" />
      </>,
      {
        // array field errors, as a field array resolver produces them
        errors: {
          title: { type: "required", message: "Bắt buộc" },
          descriptions: [{ type: "required", message: "Nhập chi tiết" }],
        } as unknown as FieldErrors,
      },
    );

    expect(screen.getByText("Bắt buộc")).toBeInTheDocument();
    expect(screen.getByText("Nhập chi tiết")).toBeInTheDocument();
    expect(container.querySelectorAll(".ant-input-status-error")).toHaveLength(
      2,
    );
  });

  describe("on blur", () => {
    const blurWith = async (typed: string, ui: ReactNode) => {
      const { form } = setup(ui);
      await userEvent.type(screen.getByPlaceholderText("n"), typed);
      await userEvent.tab();
      return form.current?.getValues("amount");
    };

    it.each([
      ["12.345", "12.34"],
      ["abc", "5"],
      ["500", "100"],
      ["3", "5"],
    ])("normalises the decimal %s to %s", async (typed, expected) => {
      const value = await blurWith(
        typed,
        <ComInput
          name="amount"
          type="positiveDecimal"
          decimalLength={2}
          minValue={5}
          maxValue={100}
          placeholder="n"
        />,
      );
      expect(value).toBe(expected);
    });

    it("keeps integers without bounds", async () => {
      const value = await blurWith(
        "7",
        <ComInput name="amount" type="positiveInteger" placeholder="n" />,
      );
      expect(value).toBe("7");
    });

    it("expands long numbers to the decimal length", async () => {
      const value = await blurWith(
        "12345678901234567890123.5",
        <ComInput
          name="amount"
          type="positiveDecimal"
          decimalLength={1}
          placeholder="n"
        />,
      );
      expect(value).toBe("12345678901234567890123.5");
    });

    it("leaves other types alone", async () => {
      const value = await blurWith(
        "12.345",
        <ComInput name="amount" decimalLength={1} placeholder="n" />,
      );
      expect(value).toBe("12.345");
    });
  });
});
