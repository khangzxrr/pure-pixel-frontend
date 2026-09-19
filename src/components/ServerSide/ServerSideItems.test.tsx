import ServerSideItems from "./ServerSideItems";

describe("ServerSideItems", () => {
  it("lists the rail entries in order", () => {
    expect(ServerSideItems.map((item) => item.id)).toEqual([
      "logo",
      "explore",
      "upgrade",
      "upload",
      "notification",
      "message",
      "changelog",
      "policy",
    ]);
  });

  it("links every entry except the notification toggle", () => {
    for (const item of ServerSideItems) {
      if (item.id === "notification") {
        expect(item.link).toBeUndefined();
      } else {
        expect(item.link).toMatch(/^\//);
      }
    }
  });

  it("restricts upload to signed-in photographers and messages to signed-in users", () => {
    const byId = Object.fromEntries(
      ServerSideItems.map((item) => [item.id, item]),
    );
    expect(byId.upload).toMatchObject({ authen: true, author: true });
    expect(byId.notification).toMatchObject({ authen: true });
    expect(byId.message).toMatchObject({ authen: true });
    expect(byId.changelog).toMatchObject({ name: "Cập nhật", link: "/changelog" });
    expect(byId.changelog.authen).toBeUndefined();
  });
});
