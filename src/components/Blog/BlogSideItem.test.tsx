import BlogSideItem from "./BlogSideItem";

describe("BlogSideItem", () => {
  it("links to the blog list", () => {
    expect(BlogSideItem).toEqual([
      expect.objectContaining({
        id: "B2",
        title: "Blog",
        link: "/home/list",
        quote: "",
      }),
    ]);
    expect(BlogSideItem[0].icon).toBeTruthy();
  });
});
