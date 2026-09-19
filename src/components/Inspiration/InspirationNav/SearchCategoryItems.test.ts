import SearchCategoryItems from "./SearchCategoryItems";

describe("SearchCategoryItems", () => {
  it("defines the supported inspiration search categories", () => {
    expect(SearchCategoryItems).toHaveLength(2);
    expect(SearchCategoryItems.map((item) => item.id)).toEqual(["s1", "s2"]);
    expect(SearchCategoryItems.map((item) => item.param)).toEqual([
      "photoName",
      "photographerName",
    ]);

    for (const item of SearchCategoryItems) {
      expect(item.title).toBeTruthy();
      expect(item.quote).toBeTruthy();
      expect(item.icon).toMatch(/^[A-Z][A-Za-z0-9]+$/);
    }

    expect(SearchCategoryItems[0]).toMatchObject({
      title: "Tên ảnh",
      quote: "ảnh",
      icon: "FaRegImage",
    });
    expect(SearchCategoryItems[1]).toMatchObject({
      title: "Nhiếp ảnh gia",
      quote: "nhiếp ảnh gia",
      icon: "BsPersonBoundingBox",
    });
  });
});
