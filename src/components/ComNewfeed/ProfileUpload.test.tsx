import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { KeycloakTokenParsed } from "../../services/authTypes";
import { renderWithProviders } from "../../test/render";
import { mockEndpoint } from "../../test/mockEndpoint";
import ProfileUpload from "./ProfileUpload";

const navigate = vi.hoisted(() => vi.fn());

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => navigate,
}));

vi.mock("../../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

vi.mock("./CreateNewsModal", () => ({
  default: ({ onClose, userInfo }: { onClose: () => void; userInfo?: KeycloakTokenParsed }) => (
    <div>
      <div>modal for {userInfo?.name}</div>
      <button onClick={onClose}>close create modal</button>
    </div>
  ),
}));

describe("ProfileUpload", () => {
  beforeEach(() => {
    navigate.mockReset();
  });

  it("shows the signed-in avatar and navigates to the profile page", async () => {
    mockEndpoint("get", "*/me", {
      id: "me-1",
      avatar: "avatar.png",
      name: "Khang",
    });
    const { container } = renderWithProviders(
      <ProfileUpload userInfo={{ name: "Khang" } as KeycloakTokenParsed} />,
    );

    expect(await screen.findByText("Hồ sơ")).toBeInTheDocument();
    await waitFor(() =>
      expect(container.querySelector("img")?.getAttribute("src")).toBe(
        "avatar.png",
      ),
    );

    await userEvent.click(screen.getByText("Hồ sơ"));
    expect(navigate).toHaveBeenCalledWith("/profile");
  });

  it("opens the create-post modal and closes it through the child callback", async () => {
    mockEndpoint("get", "*/me", {
      id: "me-1",
      avatar: "avatar.png",
      name: "Khang",
    });
    renderWithProviders(
      <ProfileUpload userInfo={{ name: "Khang" } as KeycloakTokenParsed} />,
    );
    await screen.findByText("Tạo bài viết");

    expect(screen.queryByText("modal for Khang")).toBeNull();
    await userEvent.click(screen.getByText("Tạo bài viết"));
    expect(await screen.findByText("modal for Khang")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "close create modal" }));
    await waitFor(() => expect(screen.queryByText("modal for Khang")).toBeNull());
  });
});
