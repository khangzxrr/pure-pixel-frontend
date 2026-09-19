import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import useUploadPhotoStore, {
  type UploadPhotoItem,
} from "../../states/UploadPhotoState";
import UploadPhoto from "./UploadPhoto";

vi.mock("../../components/Photographer/UploadPhoto/CustomUpload", () => ({
  default: () => <div>custom upload</div>,
}));
vi.mock("../../components/Photographer/UploadPhoto/UploadPhotoInfoBar", () => ({
  default: ({ photoData }: { photoData?: UploadPhotoItem }) => (
    <div>info {photoData?.title ?? "none"}</div>
  ),
}));
vi.mock("../../components/Photographer/UploadPhoto/MapBoxModal", () => ({
  default: () => <div>map modal</div>,
}));

const rcFile = (uid: string) =>
  Object.assign(new File(["img"], `${uid}.jpg`, { type: "image/jpeg" }), {
    uid,
    lastModifiedDate: new Date(2026, 8, 15),
  });

const addPhoto = (uid: string, item: Partial<UploadPhotoItem> = {}) =>
  useUploadPhotoStore.getState().addPhoto(uid, {
    file: rcFile(uid),
    reviewUrl: `blob:${uid}`,
    title: uid.toUpperCase(),
    ...item,
  });

describe("UploadPhoto page", () => {
  beforeEach(() => {
    useUploadPhotoStore.getState().clearState();
    useUploadPhotoStore.getState().setIsOpenMapModal(false);
  });

  it("shows only the uploader before any photo is added", () => {
    render(<UploadPhoto />);

    expect(screen.getByText("custom upload").parentElement).toHaveClass("h-1/2");
    expect(screen.queryByAltText("Selected Photo")).toBeNull();
    expect(screen.queryByText("map modal")).toBeNull();
  });

  it("previews the selected photo and steps through the queue", async () => {
    addPhoto("a", { watermark: true });
    addPhoto("b");
    useUploadPhotoStore.getState().setSelectedPhotoByUid("a");

    render(<UploadPhoto />);

    expect(screen.getByText("custom upload").parentElement).not.toHaveClass("h-1/2");
    expect(screen.getByAltText("Selected Photo")).toHaveAttribute("src", "blob:a");
    expect(screen.getByText("PXL")).toBeInTheDocument();
    expect(screen.getByText("info A")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("img", { name: "arrow-right" }));
    expect(screen.getByAltText("Selected Photo")).toHaveAttribute("src", "blob:b");
    expect(screen.queryByText("PXL")).toBeNull();
    expect(screen.getByText("info B")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("img", { name: "arrow-left" }));
    expect(screen.getByAltText("Selected Photo")).toHaveAttribute("src", "blob:a");
  });

  it("has no arrows for a single photo and opens the map modal", () => {
    addPhoto("a");
    useUploadPhotoStore.getState().setSelectedPhotoByUid("a");

    render(<UploadPhoto />);
    expect(screen.queryByRole("img", { name: "arrow-left" })).toBeNull();

    act(() => useUploadPhotoStore.getState().setIsOpenMapModal(true));
    expect(screen.getByText("map modal")).toBeInTheDocument();
  });

  it("finds no photo when the selection matches none", () => {
    addPhoto("a");

    render(<UploadPhoto />);

    // the fallback looks up uidHashmap[0], which is never a uid
    expect(screen.getByAltText("Selected Photo")).not.toHaveAttribute("src");
    expect(screen.getByText("info none")).toBeInTheDocument();
  });
});
