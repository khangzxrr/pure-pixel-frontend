import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { KeycloakTokenParsed } from "../../services/authTypes";
import type { Schema } from "../../apis/types";
import { renderWithProviders } from "../../test/render";
import { mockEndpoint } from "../../test/mockEndpoint";
import ReplyCommentPhotoLine from "./ReplyCommentPhotoLine";

const navigate = vi.hoisted(() => vi.fn());

vi.mock("../../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => navigate,
}));

vi.mock("./CommentDropdownAction", () => ({
  default: ({ handleEdit }: { handleEdit: () => void }) => (
    <button onClick={handleEdit}>edit reply</button>
  ),
}));

const ownUser = { sub: "reply-user", name: "Owner" } as KeycloakTokenParsed;

const replyUser = (): Schema<"UserDto"> => ({
  id: "reply-user",
  createdAt: "2026-09-19T12:00:00.000Z",
  updatedAt: "2026-09-19T12:00:00.000Z",
  roles: [],
  enabled: true,
  username: "bob",
  cover: "cover.png",
  location: "HCM",
  mail: "bob@example.com",
  phonenumber: "0123456789",
  socialLinks: [],
  expertises: [],
  avatar: "bob.png",
  name: "Bob",
  quote: "hi",
});

const reply = (): Schema<"CommentDto"> =>
  ({
    id: "reply-1",
    content: "Reply content",
    createdAt: "2026-09-19T12:36:26.892Z",
    updatedAt: "2026-09-19T12:36:26.892Z",
    user: replyUser(),
    replies: [],
    _count: { replies: 0 },
  }) as Schema<"CommentDto">;

describe("ReplyCommentPhotoLine", () => {
  beforeEach(() => {
    navigate.mockReset();
    vi.spyOn(console, "error").mockImplementation((...args: unknown[]) => {
      if (String(args[0]).includes("validateDOMNesting")) {
        return;
      }
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the reply and navigates to the replier profile", async () => {
    renderWithProviders(
      <ReplyCommentPhotoLine commentDetail={reply()} photoId="photo-1" />,
    );

    expect(screen.getByText("Reply content")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "edit reply" })).toBeNull();

    await userEvent.click(screen.getByText("Bob"));
    expect(navigate).toHaveBeenCalledWith("/user/reply-user");
  });

  it("lets the owner edit a reply, submit the change, and exit edit mode", async () => {
    const updated = mockEndpoint(
      "patch",
      "*/comment/photo/:photoId/comment/:commentId",
      {},
    );
    renderWithProviders(
      <ReplyCommentPhotoLine
        commentDetail={reply()}
        photoId="photo-1"
        userData={ownUser}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "edit reply" }));
    const textarea = screen.getByPlaceholderText("Viết phản hồi của bạn...");
    expect(textarea).toHaveValue("Reply content");
    await userEvent.clear(textarea);
    await userEvent.type(textarea, "Edited reply");
    await userEvent.click(textarea.parentElement?.querySelector("button") as HTMLButtonElement);

    await waitFor(() => expect(updated).toHaveLength(1));
    expect(updated[0].path).toBe("/comment/photo/photo-1/comment/reply-1");
    expect(updated[0].json).toEqual({ content: "Edited reply" });
    await waitFor(() =>
      expect(screen.queryByPlaceholderText("Viết phản hồi của bạn...")).toBeNull(),
    );
  });

  it("lets the owner abandon an edit", async () => {
    renderWithProviders(
      <ReplyCommentPhotoLine
        commentDetail={reply()}
        photoId="photo-1"
        userData={ownUser}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "edit reply" }));
    expect(screen.getByPlaceholderText("Viết phản hồi của bạn...")).toBeInTheDocument();
    await userEvent.click(screen.getByText("Hủy"));
    expect(screen.queryByPlaceholderText("Viết phản hồi của bạn...")).toBeNull();
    expect(screen.getByText("Reply content")).toBeInTheDocument();
  });
});
