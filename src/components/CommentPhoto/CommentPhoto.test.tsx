import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createTestQueryClient, renderWithProviders } from "../../test/render";
import { mockEndpoint } from "../../test/mockEndpoint";
import CommentPhoto from "./CommentPhoto";

const auth = vi.hoisted(() => ({
  authenticated: true,
  login: vi.fn(),
}));

vi.mock("@react-keycloak/web", async () => {
  const { createKeycloakMock } = await import("../../test/keycloak");
  return {
    useKeycloak: () => ({
      keycloak: {
        ...createKeycloakMock({ authenticated: auth.authenticated }),
        login: auth.login,
      },
      initialized: true,
    }),
  };
});

vi.mock("../../services/Keycloak", () => ({
  default: {
    getTokenParsed: () =>
      auth.authenticated ? { sub: "user-1", name: "Commenter" } : undefined,
    isLoggedIn: () => auth.authenticated,
    getToken: () => undefined,
    updateToken: vi.fn().mockResolvedValue(true),
    forceRefreshToken: vi.fn().mockResolvedValue(true),
  },
}));

vi.mock("./CommentPhotoLine", () => ({
  default: ({ value }: { value: { content: string } }) => (
    <div>comment line {value.content}</div>
  ),
}));

describe("CommentPhoto", () => {
  beforeEach(() => {
    auth.authenticated = true;
    auth.login.mockReset();
  });

  it("shows existing comments and submits a new top-level comment", async () => {
    const queryClient = createTestQueryClient();
    const listRequests = mockEndpoint("get", "*/comment/photo/photo-1", [
      {
        id: "comment-1",
        photoId: "photo-1",
        content: "Existing comment",
        createdAt: "2026-09-19T13:36:26.892Z",
        updatedAt: "2026-09-19T13:36:26.892Z",
        user: { id: "author-1", name: "Alice", avatar: "alice.png" },
        replies: [],
        _count: { replies: 0 },
      },
    ]);
    const created = mockEndpoint("post", "*/comment/photo/photo-1", {});
    const { container } = renderWithProviders(
      <CommentPhoto id="photo-1" top />,
      { queryClient },
    );

    expect(await screen.findByText("comment line Existing comment")).toBeInTheDocument();

    const textarea = screen.getByPlaceholderText("Viết bình luận của bạn...");
    await userEvent.type(textarea, "A brand new comment");
    fireEvent.click(container.querySelector("button") as HTMLButtonElement);

    await waitFor(() => expect(created).toHaveLength(1));
    expect(created[0].json).toEqual({ content: "A brand new comment" });
    await waitFor(() => expect(textarea).toHaveValue(""));
    await waitFor(() => expect(listRequests.length).toBeGreaterThanOrEqual(2));
  });

  it("shows the empty state and bottom composer for authenticated users", async () => {
    mockEndpoint("get", "*/comment/photo/photo-2", []);
    renderWithProviders(<CommentPhoto id="photo-2" top={false} />);

    expect(await screen.findByText("Chưa có bình luận")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Viết bình luận của bạn...")).toBeInTheDocument();
  });

  it("asks visitors to log in before commenting", async () => {
    auth.authenticated = false;
    mockEndpoint("get", "*/comment/photo/photo-3", []);
    renderWithProviders(<CommentPhoto id="photo-3" top={false} />);

    const loginPrompt = await screen.findByText("Vui lòng đăng nhập để bình luận");
    await userEvent.click(loginPrompt);
    expect(auth.login).toHaveBeenCalledTimes(1);
  });
});
