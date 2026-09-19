import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { mockEndpoint } from "../../test/mockEndpoint";
import { renderWithProviders } from "../../test/render";
import UseUserOtherStore from "../../states/UseUserOtherStore";
import PhotosBought from "./PhotosBought";

const navigateMock = vi.hoisted(() => vi.fn());

vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom",
    );
  return { ...actual, useNavigate: () => navigateMock };
});

vi.mock("../../services/Keycloak", () => ({
  default: {
    getTokenParsed: () => ({ sub: "user-1" }),
    isLoggedIn: () => false,
    getToken: () => undefined,
  },
}));

vi.mock("../PhotoProfile/PhotoProfile", () => ({
  default: () => <div>photo profile</div>,
}));

describe("PhotosBought", () => {
  beforeEach(() => {
    navigateMock.mockReset();
    UseUserOtherStore.setState({ nameUserOther: "", userOtherId: undefined });
  });

  it("shows an empty state when no photos were bought", async () => {
    mockEndpoint("get", "*/photo-exchange/me/photo-buy", {
      objects: [],
      totalPage: 1,
    });
    mockEndpoint("get", "*/me", { cover: "/cover.jpg", name: "User" });

    renderWithProviders(<PhotosBought />);

    expect(await screen.findByText("Không có ảnh khả dụng")).toBeInTheDocument();
    expect(screen.getByText("photo profile")).toBeInTheDocument();
  });

  it("shows an error message when either request fails", async () => {
    mockEndpoint("get", "*/photo-exchange/me/photo-buy", () => new Response(null, { status: 500 }));
    mockEndpoint("get", "*/me", { cover: "/cover.jpg", name: "User" });

    renderWithProviders(<PhotosBought />);

    expect(await screen.findByText(/Error:/)).toBeInTheDocument();
  });

  it("lists bought photos, navigates to the detail page and paginates", async () => {
    const requests = mockEndpoint("get", "*/photo-exchange/me/photo-buy", {
      objects: [
        {
          id: "photo-1",
          title: "Sunset",
          signedUrl: { thumbnail: "/thumb.jpg" },
          photographer: { id: "ph-1", name: "Photographer A", avatar: "/avatar.jpg" },
        },
      ],
      totalPage: 2,
    });
    mockEndpoint("get", "*/me", { cover: "/cover.jpg", name: "User" });

    renderWithProviders(<PhotosBought />);

    const image = (await screen.findAllByAltText(""))[0];
    await userEvent.click(image);
    expect(navigateMock).toHaveBeenCalledWith("/profile/photo-bought/photo-1");

    const pagination = document.querySelector(".ant-pagination") as HTMLElement;
    expect(pagination).toBeInTheDocument();
    await userEvent.click(within(pagination).getByTitle("2"));

    await waitFor(() =>
      expect(requests[requests.length - 1].query.page).toBe("1"),
    );

    await userEvent.click(screen.getByText("Photographer A"));
    expect(navigateMock).toHaveBeenCalledWith("/user/ph-1/photos");
    expect(UseUserOtherStore.getState().nameUserOther).toBe("Photographer A");
    expect(UseUserOtherStore.getState().userOtherId).toBe("ph-1");
  });
});
