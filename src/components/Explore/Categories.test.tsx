import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { renderWithProviders } from "../../test/render";
import { server } from "../../test/server";
import UseCategoryStore from "../../states/UseCategoryStore";
import Categories from "./Categories";

vi.mock("../../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

const respondWithCategories = () =>
  server.use(
    http.get("*/category", () =>
      HttpResponse.json([
        { id: "c1", name: "Phong cảnh" },
        { id: "c2", name: "Động vật" },
      ]),
    ),
  );

describe("Categories", () => {
  beforeAll(() => {
    // jsdom has no Web Animations API; Headless UI warns when it has to polyfill it
    Element.prototype.getAnimations = () => [];
  });

  beforeEach(() => {
    UseCategoryStore.setState({ selectedPhotoCategory: { name: "", param: "" } });
  });

  it("shows a skeleton while loading", async () => {
    respondWithCategories();
    const { container } = renderWithProviders(<Categories />);

    expect(container.querySelector(".custom-skeleton-input")).not.toBeNull();
    expect(await screen.findByText("Danh mục")).toBeInTheDocument();
  });

  it("shows a network error when loading fails", async () => {
    server.use(
      http.get("*/category", () => new HttpResponse(null, { status: 500 })),
    );
    renderWithProviders(<Categories />);

    expect(await screen.findByText("Lỗi mạng")).toBeInTheDocument();
  });

  it("lists All followed by the categories and selects one", async () => {
    respondWithCategories();
    renderWithProviders(<Categories />);

    await userEvent.click(await screen.findByRole("button", { name: "Danh mục" }));

    const items = await screen.findAllByRole("menuitem");
    expect(items.map((item) => item.textContent)).toEqual([
      "Tất cả",
      "Phong cảnh",
      "Động vật",
    ]);

    await userEvent.click(screen.getByText("Phong cảnh"));

    expect(UseCategoryStore.getState().selectedPhotoCategory.name).toBe(
      "Phong cảnh",
    );
    await waitFor(() => expect(screen.queryByRole("menuitem")).toBeNull());
    expect(screen.getByRole("button", { name: "Phong cảnh" })).toBeInTheDocument();
  });

  it("clears the category with All", async () => {
    UseCategoryStore.setState({
      selectedPhotoCategory: { name: "Động vật", param: "" },
    });
    respondWithCategories();
    renderWithProviders(<Categories />);

    await userEvent.click(await screen.findByRole("button", { name: "Động vật" }));
    await userEvent.click(await screen.findByText("Tất cả"));

    expect(UseCategoryStore.getState().selectedPhotoCategory.name).toBe("");
    expect(
      await screen.findByRole("button", { name: "Danh mục" }),
    ).toBeInTheDocument();
  });

  it("shows only the fixed entry when the API returns nothing", async () => {
    server.use(http.get("*/category", () => HttpResponse.json(null)));
    renderWithProviders(<Categories />);

    await userEvent.click(await screen.findByRole("button", { name: "Danh mục" }));

    expect(
      (await screen.findAllByRole("menuitem")).map((item) => item.textContent),
    ).toEqual(["Tất cả"]);
  });
});
