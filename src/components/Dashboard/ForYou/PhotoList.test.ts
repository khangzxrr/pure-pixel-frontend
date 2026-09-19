import PhotoList from "./PhotoList";

describe("PhotoList", () => {
  it("holds 15 sample photos with unique ids", () => {
    expect(PhotoList).toHaveLength(15);
    expect(new Set(PhotoList.map((photo) => photo.id)).size).toBe(15);
    for (const photo of PhotoList) {
      expect(photo.photo).toMatch(/^https:\/\/picsum\.photos\//);
      expect(photo.category).not.toBe("");
    }
  });
});
