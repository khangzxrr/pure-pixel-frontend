import { CameraYup } from "./Camera";

describe("CameraYup", () => {
  it("accepts a name and trims it", async () => {
    await expect(CameraYup.validate({ name: " Fujifilm X-T5 " })).resolves.toEqual(
      { name: "Fujifilm X-T5" },
    );
  });

  it.each([
    ["missing", {}],
    ["blank", { name: "   " }],
  ])("rejects a %s name", async (_case, value) => {
    await expect(CameraYup.validate(value)).rejects.toThrow("Vui lòng nhập tên");
  });
});
