import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../test/render";
import OtherUserSharePhotoComponent from "./OtherUserSharePhotoComponent";

describe("OtherUserSharePhotoComponent", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const shareUrl = () => `${window.location.origin}/photo/p1`;

  it("shows the public photo link", () => {
    renderWithProviders(
      <OtherUserSharePhotoComponent photoId="p1" onClose={vi.fn()} />,
    );

    expect(screen.getByText(shareUrl())).toBeInTheDocument();
  });

  it.each([
    ["the clipboard icon", 0],
    ["the copy button", 1],
  ])("copies the link from %s", async (_name, index) => {
    const user = userEvent.setup();
    const writeText = vi.spyOn(navigator.clipboard, "writeText");
    renderWithProviders(
      <OtherUserSharePhotoComponent photoId="p1" onClose={vi.fn()} />,
    );

    await user.click(screen.getAllByRole("button")[index]);

    expect(writeText).toHaveBeenCalledWith(shareUrl());
    expect(await screen.findByText("Đã sao chép liên kết")).toBeInTheDocument();
    expect(screen.getAllByRole("button")[1]).toHaveTextContent("Copy đường dẫn");
  });

  it("logs when the clipboard refuses", async () => {
    const user = userEvent.setup();
    const failure = new Error("denied");
    vi.spyOn(navigator.clipboard, "writeText").mockRejectedValue(failure);
    const logError = vi.spyOn(console, "error").mockImplementation(() => {});
    renderWithProviders(
      <OtherUserSharePhotoComponent photoId="p1" onClose={vi.fn()} />,
    );

    await user.click(screen.getByRole("button", { name: "Copy đường dẫn" }));

    await waitFor(() =>
      expect(logError).toHaveBeenCalledWith("Failed to copy link: ", failure),
    );
    expect(screen.queryByText("Đã sao chép liên kết")).toBeNull();
  });

  it("closes when done", async () => {
    const onClose = vi.fn();
    renderWithProviders(
      <OtherUserSharePhotoComponent photoId="p1" onClose={onClose} />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Xong" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
