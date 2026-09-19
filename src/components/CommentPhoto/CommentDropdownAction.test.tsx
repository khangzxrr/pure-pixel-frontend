import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createTestQueryClient, renderWithProviders } from "../../test/render";
import { mockEndpoint } from "../../test/mockEndpoint";
import CommentDropdownAction from "./CommentDropdownAction";

vi.mock("../../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

const openMenu = async (container: HTMLElement) => {
  await userEvent.click(container.querySelector(".cursor-pointer") as HTMLElement);
};

describe("CommentDropdownAction", () => {
  it("calls the edit callback from the dropdown menu", async () => {
    const handleEdit = vi.fn();
    const { container } = renderWithProviders(
      <CommentDropdownAction
        handleEdit={handleEdit}
        photo={{ id: "comment-1", photoId: "photo-1" }}
      />,
    );

    fireEvent.mouseEnter(container.querySelector(".cursor-pointer") as HTMLElement);
    expect(container.querySelector(".bg-gray-100")).not.toBeNull();

    await openMenu(container);
    await userEvent.click(await screen.findByText("Chỉnh sửa"));
    expect(handleEdit).toHaveBeenCalledTimes(1);
  });

  it("opens the delete confirmation and lets the user cancel it", async () => {
    const { container } = renderWithProviders(
      <CommentDropdownAction
        handleEdit={vi.fn()}
        photo={{ id: "comment-1", photoId: "photo-1" }}
      />,
    );

    await openMenu(container);
    await userEvent.click(await screen.findByText("Xóa bình luận"));

    expect(
      await screen.findByText("Bạn có chắc chắn muốn xóa bình luận này không?"),
    ).toBeInTheDocument();
    const dialog = screen.getByRole("dialog");
    await userEvent.click(screen.getByRole("button", { name: "Hủy" }));
    await waitFor(() => expect(dialog).not.toBeVisible());
  });

  it("deletes the comment after confirmation", async () => {
    const queryClient = createTestQueryClient();
    const deleted = mockEndpoint(
      "delete",
      "*/comment/photo/:photoId/comment/:commentId",
      {},
    );
    const { container } = renderWithProviders(
      <CommentDropdownAction
        handleEdit={vi.fn()}
        photo={{ id: "comment-1", photoId: "photo-1" }}
      />,
      { queryClient },
    );

    queryClient.setQueryData(["photo-comment", "photo-1"], []);
    await openMenu(container);
    await userEvent.click(await screen.findByText("Xóa bình luận"));
    const dialog = screen.getByRole("dialog");
    await userEvent.click(await screen.findByRole("button", { name: "Xóa" }));

    await waitFor(() => expect(deleted).toHaveLength(1));
    expect(deleted[0].path).toBe("/comment/photo/photo-1/comment/comment-1");
    await waitFor(() => expect(dialog).not.toBeVisible());
  });
});
