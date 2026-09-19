import getDefaultPhoto from "./DefaultPhoto";

describe("getDefaultPhoto", () => {
  it("fills empty defaults when there is no photo", () => {
    const photo = getDefaultPhoto(undefined);
    expect(photo).toMatchObject({
      id: "",
      title: "",
      gps: {},
      photoTags: [],
      categoryIds: [],
      watermark: false,
      pricetags: [],
    });
    expect(getDefaultPhoto(null)).toEqual(photo);
  });

  it("keeps the values a photo already has", () => {
    const photo = getDefaultPhoto({
      id: "p1",
      title: "Sunset",
      watermark: true,
      categoryIds: ["c1"],
      exif: { Make: "Sony" },
      showExif: true,
    });
    expect(photo).toMatchObject({
      id: "p1",
      title: "Sunset",
      watermark: true,
      categoryIds: ["c1"],
      exif: { Make: "Sony" },
      showExif: true,
      description: "",
    });
  });
});
