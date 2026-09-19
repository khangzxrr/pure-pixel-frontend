import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { renderWithProviders } from "../../test/render";
import { mockEndpoint } from "../../test/mockEndpoint";
import { server } from "../../test/server";
import UseUserOtherStore from "../../states/UseUserOtherStore";
import ViewFollowersModal from "./ViewFollowersModal";

const navigate = vi.hoisted(() => vi.fn());

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => navigate,
}));

vi.mock("../../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

describe("ViewFollowersModal", () => {
  afterEach(() => {
    navigate.mockReset();
    UseUserOtherStore.setState({ nameUserOther: "", userOtherId: null });
  });

  it("shows an empty state when nobody follows the user", async () => {
    mockEndpoint("get", "*/follow/me/follower", { objects: [], totalPage: 0 });

    renderWithProviders(<ViewFollowersModal onClose={vi.fn()} />);

    expect(await screen.findByText("Chưa ai theo dõi bạn!")).toBeInTheDocument();
  });

  it("shows an error message when the request fails", async () => {
    server.use(
      http.get("*/follow/me/follower", () => new HttpResponse(null, { status: 500 })),
    );

    renderWithProviders(<ViewFollowersModal onClose={vi.fn()} />);

    expect(
      await screen.findByText("Request failed with status code 500"),
    ).toBeInTheDocument();
  });

  it("lists followers and navigates to their profile on click", async () => {
    mockEndpoint("get", "*/follow/me/follower", {
      objects: [
        { follower: { id: "u1", name: "Alice", avatar: "a.png" } },
      ],
      totalPage: 1,
    });

    renderWithProviders(<ViewFollowersModal onClose={vi.fn()} />);

    await screen.findByText("Alice");
    await userEvent.click(screen.getByText("Alice"));

    expect(navigate).toHaveBeenCalledWith("/user/u1/photos");
    expect(UseUserOtherStore.getState().nameUserOther).toBe("Alice");
    expect(UseUserOtherStore.getState().userOtherId).toBe("u1");
  });

  it("closes the modal via the close button", async () => {
    mockEndpoint("get", "*/follow/me/follower", { objects: [], totalPage: 0 });
    const onClose = vi.fn();

    renderWithProviders(<ViewFollowersModal onClose={onClose} />);

    await screen.findByText("Chưa ai theo dõi bạn!");
    await userEvent.click(screen.getByRole("button"));

    expect(onClose).toHaveBeenCalled();
  });
});
