import CameraSideItems from "./CameraSideItems";

describe("CameraSideItems", () => {
  it("defines the camera list side item with an icon", () => {
    expect(CameraSideItems).toHaveLength(1);
    expect(CameraSideItems[0]).toMatchObject({
      id: "C1",
      title: "Danh sách máy ảnh",
      link: "/camera/all",
    });
    expect(CameraSideItems[0].icon).toBeTruthy();
  });
});
