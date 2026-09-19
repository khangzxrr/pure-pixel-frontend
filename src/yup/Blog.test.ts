import { BlogYup } from "./Blog";

describe("BlogYup", () => {
  it("accepts a title and trims it", async () => {
    await expect(BlogYup.validate({ title: "  Mẹo chụp đêm " })).resolves.toEqual(
      { title: "Mẹo chụp đêm" },
    );
  });

  it.each([
    ["missing", {}],
    ["blank", { title: "   " }],
  ])("rejects a %s title", async (_case, value) => {
    await expect(BlogYup.validate(value)).rejects.toThrow(
      "Vui lòng nhập tên blog",
    );
  });
});
