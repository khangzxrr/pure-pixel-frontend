import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../test/render";
import { mockEndpoint } from "../../test/mockEndpoint";
import UseUserOtherStore from "../../states/UseUserOtherStore";
import ViewFollowingsModal from "./ViewFollowingsModal";

const navigate = vi.hoisted(() => vi.fn());

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => navigate,
}));

vi.mock("../../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

describe("ViewFollowingsModal", () => {
  afterEach(() => {
    navigate.mockReset();
    UseUserOtherStore.setState({ nameUserOther: "", userOtherId: null });
  });

  it("shows a loading state, then an empty state when following no one", async () => {
    mockEndpoint("get", "*/follow/me/following", { objects: [], totalPage: 0 });

    renderWithProviders(<ViewFollowingsModal onClose={vi.fn()} />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(
      await screen.findByText("Bạn chưa theo dõi ai cả!"),
    ).toBeInTheDocument();
  });

  it("lists followed users and navigates to their profile on click", async () => {
    mockEndpoint("get", "*/follow/me/following", {
      objects: [{ following: { id: "u1", name: "Bob", avatar: "b.png" } }],
      totalPage: 1,
    });

    renderWithProviders(<ViewFollowingsModal onClose={vi.fn()} />);

    await screen.findByText("Bob");
    await userEvent.click(screen.getByText("Bob"));

    expect(navigate).toHaveBeenCalledWith("/user/u1/photos");
    expect(UseUserOtherStore.getState().nameUserOther).toBe("Bob");
    expect(UseUserOtherStore.getState().userOtherId).toBe("u1");
  });

  it("unfollows a user and refreshes the list", async () => {
    mockEndpoint("get", "*/follow/me/following", {
      objects: [{ following: { id: "u1", name: "Bob", avatar: "b.png" } }],
      totalPage: 1,
    });
    const unfollowRequests = mockEndpoint("delete", "*/follow/me/following/u1", {});

    renderWithProviders(<ViewFollowingsModal onClose={vi.fn()} />);

    await screen.findByText("Bob");
    await userEvent.click(screen.getByText("Hủy theo dõi"));

    await vi.waitFor(() => expect(unfollowRequests).toHaveLength(1));
  });

  it("closes the modal via the close button", async () => {
    mockEndpoint("get", "*/follow/me/following", { objects: [], totalPage: 0 });
    const onClose = vi.fn();

    renderWithProviders(<ViewFollowingsModal onClose={onClose} />);

    await screen.findByText("Bạn chưa theo dõi ai cả!");
    await userEvent.click(screen.getByRole("button"));

    expect(onClose).toHaveBeenCalled();
  });
});
