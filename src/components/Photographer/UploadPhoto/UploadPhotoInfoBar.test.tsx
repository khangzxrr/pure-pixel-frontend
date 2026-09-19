import { render, screen } from "@testing-library/react";
import type { UploadPhotoItem } from "../../../states/UploadPhotoState";
import UploadPhotoInfoBar from "./UploadPhotoInfoBar";

vi.mock("./UploadPhotoForm", () => ({
  default: ({ selectedPhoto }: { selectedPhoto?: UploadPhotoItem }) => (
    <div>form {selectedPhoto?.title ?? "none"}</div>
  ),
}));

const photo = (status: UploadPhotoItem["status"]): UploadPhotoItem => ({
  file: Object.assign(new File(["img"], "a.jpg", { type: "image/jpeg" }), {
    uid: "a",
    lastModifiedDate: new Date(2026, 8, 15),
  }),
  title: "Hoàng hôn",
  status,
});

const overlay = (container: HTMLElement) =>
  container.querySelector(".cursor-not-allowed");

describe("UploadPhotoInfoBar", () => {
  it("covers the form until the photo has finished uploading", () => {
    const { container, rerender } = render(<UploadPhotoInfoBar />);
    expect(screen.getByText("Thông tin bức ảnh")).toBeInTheDocument();
    expect(screen.getByText("form none")).toBeInTheDocument();
    expect(overlay(container)).not.toBeNull();

    rerender(<UploadPhotoInfoBar photoData={photo("uploading")} />);
    expect(screen.getByText("form Hoàng hôn")).toBeInTheDocument();
    expect(overlay(container)).not.toBeNull();

    rerender(<UploadPhotoInfoBar photoData={photo("done")} />);
    expect(overlay(container)).toBeNull();
  });
});
