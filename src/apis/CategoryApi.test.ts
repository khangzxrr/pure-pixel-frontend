import { mockEndpoint } from "../test/mockEndpoint";
import { CategoryApi } from "./CategoryApi";

vi.mock("../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

describe("CategoryApi", () => {
  it("getAllCategories returns every category", async () => {
    const requests = mockEndpoint("get", "*/category", [
      { id: "cat1", name: "Phong cảnh" },
    ]);

    await expect(CategoryApi.getAllCategories()).resolves.toEqual([
      { id: "cat1", name: "Phong cảnh" },
    ]);
    expect(requests).toEqual([
      expect.objectContaining({ method: "GET", path: "/category", query: {} }),
    ]);
  });
});
