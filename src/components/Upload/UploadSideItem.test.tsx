import UploadSideItem from "./UploadSideItem";

describe("UploadSideItem", () => {
  it("lists the upload pages", () => {
    expect(
      UploadSideItem.map(({ id, title, link }) => ({ id, title, link })),
    ).toEqual([
      { id: "U1", title: "Tải ảnh lên", link: "/upload/public" },
      { id: "U2", title: "Đăng bán ảnh", link: "/upload/sell" },
    ]);
    UploadSideItem.forEach((item) => expect(item.icon).toBeTruthy());
  });
});
