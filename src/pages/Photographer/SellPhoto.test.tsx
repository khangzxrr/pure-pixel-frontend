import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Ref, RefObject } from "react";
import useSellPhotoStore, { type SellPhotoItem } from "../../states/UseSellPhotoState";
import type { UploadPhotoSellFormHandle } from "./components/UploadPhotoSellInfoBar";
import SellPhoto from "./SellPhoto";

const form = vi.hoisted(() => ({ submitForm: vi.fn(), resetForm: vi.fn() }));

vi.mock("./components/UploadPhotoSell", () => ({
  default: ({ formRef }: { formRef: RefObject<UploadPhotoSellFormHandle> }) => (
    <div>
      <p>upload sell</p>
      <button onClick={() => formRef.current?.submitForm()}>submit via ref</button>
    </div>
  ),
}));

vi.mock("./components/UploadPhotoSellInfoBar", async () => {
  const { useImperativeHandle } = await import("react");
  const InfoBarStub = ({
    reference,
    selectedPhoto,
  }: {
    reference: Ref<UploadPhotoSellFormHandle>;
    selectedPhoto?: SellPhotoItem;
  }) => {
    useImperativeHandle(reference, () => form);
    return <div>info {selectedPhoto?.title ?? "none"}</div>;
  };
  return { default: InfoBarStub };
});

vi.mock("./components/MapBoxModal", () => ({
  default: () => <div>map modal</div>,
}));

const rcFile = (uid: string) =>
  Object.assign(new File(["img"], `${uid}.jpg`, { type: "image/jpeg" }), {
    uid,
    lastModifiedDate: new Date(2026, 8, 15),
  });

const addPhoto = (uid: string, item: Partial<SellPhotoItem> = {}) =>
  useSellPhotoStore.getState().addPhoto(uid, {
    file: rcFile(uid),
    reviewUrl: `blob:${uid}`,
    title: uid.toUpperCase(),
    status: "uploading",
    ...item,
  });

describe("SellPhoto page", () => {
  beforeEach(() => {
    form.submitForm.mockClear();
    useSellPhotoStore.getState().clearState();
    useSellPhotoStore.getState().setIsOpenMapModal(false);
  });

  it("shows only the uploader before any photo is added", () => {
    render(<SellPhoto />);

    expect(screen.getByText("upload sell").parentElement?.parentElement).toHaveClass("h-1/2");
    expect(screen.queryByAltText("Ảnh được chọn")).toBeNull();
    expect(useSellPhotoStore.getState().selectedPhoto).toBeNull();
  });

  it("selects the first photo while uploads run and steps through the queue", async () => {
    addPhoto("a");
    addPhoto("b");

    render(<SellPhoto />);

    expect(useSellPhotoStore.getState().selectedPhoto).toBe("a");
    expect(screen.getByAltText("Ảnh được chọn")).toHaveAttribute("src", "blob:a");
    expect(screen.getByText("info A")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("img", { name: "arrow-right" }));
    expect(screen.getByAltText("Ảnh được chọn")).toHaveAttribute("src", "blob:b");

    await userEvent.click(screen.getByRole("img", { name: "arrow-left" }));
    expect(screen.getByText("info A")).toBeInTheDocument();
  });

  it("lets the uploader submit the info form through the ref", async () => {
    addPhoto("a");

    render(<SellPhoto />);
    expect(screen.queryByRole("img", { name: "arrow-left" })).toBeNull();

    await userEvent.click(screen.getByRole("button", { name: "submit via ref" }));
    expect(form.submitForm).toHaveBeenCalledTimes(1);

    act(() => useSellPhotoStore.getState().setIsOpenMapModal(true));
    expect(screen.getByText("map modal")).toBeInTheDocument();
  });

  it("keeps the selection empty once a photo has finished", () => {
    addPhoto("a", { status: "done" });

    render(<SellPhoto />);

    expect(useSellPhotoStore.getState().selectedPhoto).toBeNull();
    // the fallback looks up the first photo's index instead of its uid, so it finds nothing
    expect(screen.getByAltText("Ảnh được chọn")).not.toHaveAttribute("src");
    expect(screen.getByText("info none")).toBeInTheDocument();
  });
});
