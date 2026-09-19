import { MonyNumber } from "./MonyNumber";

const run = (
  input: unknown,
  setValue: (value: number) => void = vi.fn(),
) => {
  const setError = vi.fn();
  const setFocus = vi.fn();
  const result = MonyNumber(input, setError, setFocus, setValue);
  return { result, setError, setFocus, setValue };
};

describe("MonyNumber", () => {
  it("accepts formatted strings ending in 000", () => {
    const { result, setValue, setError } = run("12,000");
    expect(result).toBe(12000);
    expect(setValue).toHaveBeenCalledWith(12000);
    expect(setError).not.toHaveBeenCalled();
  });

  it.each([
    ["500", "Số tiền không được nhỏ hơn 1,000 VND"],
    ["12,500", "Số tiền không hợp lệ"],
    ["abc", "Định dạng số tiền không hợp lệ"],
  ])("rejects the string %s", (input, message) => {
    const { result, setError, setFocus, setValue } = run(input);
    expect(result).toBeNull();
    expect(setError).toHaveBeenCalledWith(message);
    expect(setFocus).toHaveBeenCalledTimes(1);
    expect(setValue).not.toHaveBeenCalled();
  });

  it("accepts numbers in hundreds", () => {
    const { result, setValue } = run(1500);
    expect(result).toBe(1500);
    expect(setValue).toHaveBeenCalledWith(1500);
  });

  it.each([
    [999, "Số tiền không được nhỏ hơn 1,000 VND"],
    [1550, "Số tiền không hợp lệ"],
    [Number.NaN, "Định dạng số tiền không hợp lệ"],
    [undefined, "Định dạng số tiền không hợp lệ"],
  ])("rejects %s", (input, message) => {
    const { result, setError } = run(input);
    expect(result).toBeNull();
    expect(setError).toHaveBeenCalledWith(message);
  });

  it("reports values thrown by setValue", () => {
    const { result, setError } = run(2000, () => {
      throw "không lưu được";
    });
    expect(result).toBeNull();
    expect(setError).toHaveBeenCalledWith("không lưu được");
  });
});
