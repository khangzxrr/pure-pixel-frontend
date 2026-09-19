import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, type ReactNode } from "react";
import type { FieldErrors } from "react-hook-form";
import ComNumber from "./ComNumber";
import { TestForm, type FormHandle } from "./testForm";

const setup = (ui: ReactNode, errors?: FieldErrors) => {
  const form: FormHandle = {};
  const view = render(
    <TestForm form={form} errors={errors}>
      {ui}
    </TestForm>,
  );
  return { form, input: screen.getByRole("spinbutton"), ...view };
};

describe("ComNumber", () => {
  it("writes numbers to the form and reports digits for money", async () => {
    const onChangeValue = vi.fn();
    const onChange = vi.fn();
    const ref = createRef<HTMLInputElement>();
    const { form, input } = setup(
      <ComNumber
        name="price"
        type="money"
        label="Số tiền"
        subLabel="VND"
        required
        min={1000}
        onChangeValue={onChangeValue}
        onChange={onChange}
        ref={ref}
      />,
    );

    expect(screen.getByText("*")).toBeInTheDocument();
    expect(screen.getByText("VND")).toBeInTheDocument();
    expect(screen.getByLabelText(/Số tiền/)).toBe(input);
    expect(ref.current).toBe(input);

    await userEvent.type(input, "12000");
    expect(form.current?.getValues("price")).toBe(12000);
    expect(onChangeValue).toHaveBeenLastCalledWith("price", "12000");

    await userEvent.clear(input);
    expect(form.current?.getValues("price")).toBeNull();
    expect(onChangeValue).toHaveBeenLastCalledWith("price", "");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("formats money with thousands separators", async () => {
    const { input } = setup(
      <ComNumber name="price" money defaultValue={10000} />,
    );
    expect(input).toHaveValue("10,000");
  });

  it.each([
    ["numbers", "25", "25"],
    [undefined, "25", 25],
  ])("reports %s values", async (type, typed, reported) => {
    const onChangeValue = vi.fn();
    const { input } = setup(
      <ComNumber name="count" type={type} onChangeValue={onChangeValue} />,
    );
    await userEvent.type(input, typed);
    expect(onChangeValue).toHaveBeenLastCalledWith("count", reported);

    await userEvent.clear(input);
    expect(onChangeValue).toHaveBeenLastCalledWith(
      "count",
      type ? "" : null,
    );
  });

  it.each(["emails", "code"])(
    "accepts %s only as text values",
    async (type) => {
      const onChangeValue = vi.fn();
      const numeric = setup(
        <ComNumber name="a" type={type} onChangeValue={onChangeValue} />,
      );
      await userEvent.type(numeric.input, "1");
      expect(onChangeValue).not.toHaveBeenCalled();
      expect(numeric.form.current?.getValues("a")).toBeUndefined();
      numeric.unmount();

      const text = setup(
        <ComNumber
          name="b"
          type={type}
          stringMode
          onChangeValue={onChangeValue}
        />,
      );
      await userEvent.type(text.input, "1.5");
      expect(onChangeValue).toHaveBeenLastCalledWith("b", "1.5");
      expect(text.form.current?.getValues("b")).toBe("1.5");
    },
  );

  it("rejects text that is not half-size for emails", async () => {
    const onChangeValue = vi.fn();
    const { input } = setup(
      <ComNumber
        name="b"
        type="emails"
        stringMode
        onChangeValue={onChangeValue}
      />,
    );
    await userEvent.type(input, "1");
    expect(onChangeValue).toHaveBeenLastCalledWith("b", "1");
  });

  it("shows the field error from the form", () => {
    const { container } = setup(<ComNumber name="price" />, {
      price: { type: "min", message: "Tối thiểu 1,000" },
    });
    expect(screen.getByText("Tối thiểu 1,000")).toBeInTheDocument();
    expect(
      container.querySelector(".ant-input-number-status-error"),
    ).not.toBeNull();
  });
});
