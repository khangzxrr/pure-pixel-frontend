import React from "react";
import InspirationSideItemF from "./InspirationSideItemF";

describe("InspirationSideItemF", () => {
  it("defines the inspiration sidebar entries with links, titles and icons", () => {
    expect(InspirationSideItemF).toHaveLength(6);
    expect(InspirationSideItemF.map((item) => item.id)).toEqual([1, 4, 6, 5, 7, 8]);
    expect(InspirationSideItemF.map((item) => item.link)).toEqual([
      "/explore/inspiration",
      "/explore/photographers",
      "/explore/selling",
      "/explore/camera",
      "/explore/photo-map",
      "/explore/booking-package",
    ]);

    for (const item of InspirationSideItemF) {
      expect(item.title).toBeTruthy();
      expect(item.link.startsWith("/explore/")).toBe(true);
      expect(React.isValidElement(item.icon)).toBe(true);
    }

    expect(InspirationSideItemF[0].quote).toContain("tuyển chọn");
    expect(InspirationSideItemF[3].quote).toBeUndefined();
    expect(InspirationSideItemF.at(-1)).toMatchObject({
      title: "Các gói chụp ảnh",
      link: "/explore/booking-package",
    });
  });
});
