import { PhotoShootUpdateInput } from "./PhotoShootUpdateInput";

describe("PhotoShootUpdateInput", () => {
  it.each([
    ["no description", {}],
    ["a 1000 character description", { description: "a".repeat(1000) }],
  ])("accepts %s", async (_case, value) => {
    await expect(PhotoShootUpdateInput.isValid(value)).resolves.toBe(true);
  });

  it("rejects a description over 1000 characters", async () => {
    await expect(
      PhotoShootUpdateInput.validate({ description: "a".repeat(1001) }),
    ).rejects.toThrow("Mô tả của gói quá dài ");
  });
});
