import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../../test/render";
import UseCategoryStore from "../../../states/UseCategoryStore";
import InsPhotoFilter from "./InsPhotoFilter";

const auth = vi.hoisted(() => ({ authenticated: true }));

vi.mock("@react-keycloak/web", async () => {
  const { createKeycloakMock } = await import("../../../test/keycloak");
  return {
    useKeycloak: () => ({
      keycloak: createKeycloakMock({ authenticated: auth.authenticated }),
      initialized: true,
    }),
  };
});

const resetCategoryStore = () => {
  UseCategoryStore.setState({
    filterByPhotoDate: { name: "Mới nhất", param: "desc" },
    filterByUpVote: { name: "", param: "" },
    filterByIsFollowed: { name: "", param: "" },
    isWatermarkChecked: false,
    isForSaleChecked: false,
  });
};

describe("InsPhotoFilter", () => {
  beforeEach(() => {
    auth.authenticated = true;
    resetCategoryStore();
  });

  it("changes the photo date ordering from the menu", async () => {
    renderWithProviders(<InsPhotoFilter />);

    await userEvent.click(screen.getByRole("button", { name: /Ngày đăng:/i }));
    await userEvent.click(await screen.findByText("Cũ nhất"));

    expect(UseCategoryStore.getState().filterByPhotoDate).toEqual({
      name: "Cũ nhất",
      param: "asc",
    });
    expect(screen.getByRole("button", { name: /Cũ nhất/i })).toBeInTheDocument();
  });

  it("filters followed photographers and clears that filter again", async () => {
    renderWithProviders(<InsPhotoFilter />);

    await userEvent.click(screen.getByRole("button", { name: /Theo dõi:/i }));
    await userEvent.click(await screen.findByText("Đã theo dõi"));

    expect(UseCategoryStore.getState().filterByIsFollowed).toEqual({
      name: "Đã theo dõi",
      param: true,
    });

    await userEvent.click(screen.getByRole("button", { name: /Đã theo dõi/i }));
    await userEvent.click(await screen.findByText("Xoá bộ lọc"));

    expect(UseCategoryStore.getState().filterByIsFollowed).toEqual({
      name: "",
      param: "",
    });
  });

  it("hides the follow filter for signed-out visitors", () => {
    auth.authenticated = false;

    renderWithProviders(<InsPhotoFilter />);

    expect(screen.queryByText("Theo dõi:")).toBeNull();
    expect(screen.getByRole("button", { name: /Ngày đăng:/i })).toBeInTheDocument();
  });
});
