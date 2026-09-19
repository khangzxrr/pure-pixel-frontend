import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import type { KeycloakTokenParsed } from "keycloak-js";
import { renderWithProviders } from "../../test/render";
import { mockEndpoint } from "../../test/mockEndpoint";
import type { Schema } from "../../apis/types";
import CommentPhotoLine, { type PhotoComment } from "./CommentPhotoLine";

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
    <button onClick={handleEdit}>edit comment</button>
  ),
}));

vi.mock("./ReplyCommentPhotoLine", () => ({
  default: ({ commentDetail }: { commentDetail: { content: string } }) => (
    <div>reply line {commentDetail.content}</div>
  ),
}));

const userData = { sub: "user-1", name: "Commenter" } as KeycloakTokenParsed;

const commentUser = (): Schema<"UserDto"> => ({
  id: "user-1",
  createdAt: "2026-09-19T12:00:00.000Z",
  updatedAt: "2026-09-19T12:00:00.000Z",
  roles: [],
  enabled: true,
  username: "alice",
  cover: "cover.png",
  location: "HCM",
  mail: "alice@example.com",
  phonenumber: "0123456789",
  socialLinks: [],
  expertises: [],
  avatar: "alice.png",
  name: "Alice",
  quote: "hello",
});

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

const comment = (): PhotoComment =>
  ({
    id: "comment-1",
    photoId: "photo-1",
    content: "Original comment",
    createdAt: "2026-09-19T12:36:26.892Z",
    updatedAt: "2026-09-19T12:36:26.892Z",
    user: commentUser(),
    replies: [
      {
        id: "reply-1",
        content: "Nested reply",
        createdAt: "2026-09-19T12:46:26.892Z",
        updatedAt: "2026-09-19T12:46:26.892Z",
        user: replyUser(),
        replies: [],
        _count: { replies: 0 },
      },
    ],
    _count: { replies: 1 },
  }) as PhotoComment;

function Harness({ currentUser }: { currentUser?: KeycloakTokenParsed }) {
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null);
  return (
    <CommentPhotoLine
      value={comment()}
      userData={currentUser}
      replyingToCommentId={replyingToCommentId}
      setReplyingToCommentId={setReplyingToCommentId}
    />
  );
}

describe("CommentPhotoLine", () => {
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

  it("renders the comment, nested replies, and navigates to the commenter profile", async () => {
    renderWithProviders(<Harness />);

    expect(screen.getByText("Original comment")).toBeInTheDocument();
    expect(screen.getByText("reply line Nested reply")).toBeInTheDocument();
    expect(screen.queryByText("Trả lời")).toBeNull();

    await userEvent.click(screen.getByText("Alice"));
    expect(navigate).toHaveBeenCalledWith("/user/user-1");
  });

  it("opens edit mode for the owner, saves the change, and closes the editor", async () => {
    const updated = mockEndpoint(
      "patch",
      "*/comment/photo/:photoId/comment/:commentId",
      {},
    );
    renderWithProviders(<Harness currentUser={userData} />);

    await userEvent.click(screen.getByRole("button", { name: "edit comment" }));
    const textarea = screen.getByPlaceholderText("Sửa bình luận của bạn...");
    expect(textarea).toHaveValue("Original comment");
    await userEvent.clear(textarea);
    await userEvent.type(textarea, "Updated comment");
    await userEvent.click(textarea.parentElement?.querySelector("button") as HTMLButtonElement);

    await waitFor(() => expect(updated).toHaveLength(1));
    expect(updated[0].path).toBe("/comment/photo/photo-1/comment/comment-1");
    expect(updated[0].json).toEqual({ content: "Updated comment" });
    await waitFor(() =>
      expect(screen.queryByPlaceholderText("Sửa bình luận của bạn...")).toBeNull(),
    );
  });

  it("opens the reply composer for signed-in users, submits a reply, and lets them cancel it", async () => {
    const replied = mockEndpoint(
      "post",
      "*/comment/photo/:photoId/comment/:commentId/reply",
      {},
    );
    renderWithProviders(<Harness currentUser={userData} />);

    await userEvent.click(screen.getByText("Trả lời"));
    const textarea = screen.getByPlaceholderText("Viết phản hồi của bạn...");
    await userEvent.type(textarea, "Thanks for sharing");
    await userEvent.click(textarea.parentElement?.querySelector("button") as HTMLButtonElement);

    await waitFor(() => expect(replied).toHaveLength(1));
    expect(replied[0].path).toBe("/comment/photo/photo-1/comment/comment-1/reply");
    expect(replied[0].json).toEqual({ content: "Thanks for sharing" });
    await waitFor(() =>
      expect(screen.queryByPlaceholderText("Viết phản hồi của bạn...")).toBeNull(),
    );

    await userEvent.click(screen.getByText("Trả lời"));
    expect(screen.getByPlaceholderText("Viết phản hồi của bạn...")).toBeInTheDocument();
    await userEvent.click(screen.getByText("Hủy"));
    expect(screen.queryByPlaceholderText("Viết phản hồi của bạn...")).toBeNull();
  });
});
