import { mockEndpoint } from "../test/mockEndpoint";
import UserProfileApi from "./UserProfile";

vi.mock("../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

const entriesOf = (form: FormData | undefined) =>
  [...(form?.entries() ?? [])].map(([key, value]) => [
    key,
    typeof value === "string" ? value : `file:${value.name}`,
  ]);

describe("UserProfileApi", () => {
  it("getMyProfile returns my profile", async () => {
    const requests = mockEndpoint("get", "*/me", { id: "u1" });

    await expect(UserProfileApi.getMyProfile()).resolves.toEqual({ id: "u1" });
    expect(requests).toEqual([
      expect.objectContaining({ method: "GET", path: "/me" }),
    ]);
  });

  it("updateUserProfile sends every provided field as multipart", async () => {
    const requests = mockEndpoint("patch", "*/me", { id: "u1" });

    await expect(
      UserProfileApi.updateUserProfile({
        cover: new File(["c"], "cover.jpg", { type: "image/jpeg" }),
        avatar: new File(["a"], "avatar.jpg", { type: "image/jpeg" }),
        name: "An",
        quote: "Chụp mỗi ngày",
        location: "Huế",
        mail: "an@example.com",
        phonenumber: "0901234567",
        socialLinks: ["https://a.test", "https://b.test"],
        expertises: ["Chân dung"],
      }),
    ).resolves.toEqual({ id: "u1" });

    expect(requests).toHaveLength(1);
    expect(requests[0].method).toBe("PATCH");
    expect(requests[0].path).toBe("/me");
    expect(entriesOf(requests[0].form)).toEqual([
      ["cover", "file:cover.jpg"],
      ["avatar", "file:avatar.jpg"],
      ["name", "An"],
      ["quote", "Chụp mỗi ngày"],
      ["location", "Huế"],
      ["mail", "an@example.com"],
      ["phonenumber", "0901234567"],
      ["socialLinks[0]", "https://a.test"],
      ["socialLinks[1]", "https://b.test"],
      ["expertises[0]", "Chân dung"],
    ]);
  });

  it("updateUserProfile keeps an emptied phone number and skips other empty fields", async () => {
    const requests = mockEndpoint("patch", "*/me", { id: "u1" });

    await UserProfileApi.updateUserProfile({
      cover: null,
      name: "",
      phonenumber: "",
    });

    expect(entriesOf(requests[0].form)).toEqual([["phonenumber", ""]]);
  });

  it("updateUserProfile sends an empty form without data", async () => {
    const requests = mockEndpoint("patch", "*/me", { id: "u1" });

    await UserProfileApi.updateUserProfile(null);

    expect(requests).toHaveLength(1);
    expect(entriesOf(requests[0].form)).toEqual([]);
  });

  it("getCurrentUpgradedPackage returns my current upgrade", async () => {
    const requests = mockEndpoint("get", "*/me/current-upgrade-package", {
      id: "order1",
    });

    await expect(UserProfileApi.getCurrentUpgradedPackage()).resolves.toEqual({
      id: "order1",
    });
    expect(requests).toEqual([
      expect.objectContaining({
        method: "GET",
        path: "/me/current-upgrade-package",
      }),
    ]);
  });
});
