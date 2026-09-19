import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import useModalStore from "../../states/UseModalStore";
import UpdateDropdown, { type MyPhotoItem } from "./UpdateDropdown";

type PhotoManagementModalProps = { close: () => void; id: string };

vi.mock("../PhotoManagementModal/PhotoManagementModal", () => ({
  default: ({ close, id }: PhotoManagementModalProps) => (
    <div>
      <p>sell modal {id}</p>
      <button onClick={close}>close sell modal</button>
    </div>
  ),
}));

const buildPhoto = (overrides: Partial<MyPhotoItem> = {}): MyPhotoItem => ({
  id: "p1",
  watermark: false,
  title: "Title",
  description: "Desc",
  visibility: "PUBLIC",
  photoTags: ["tag1"],
  exif: {},
  originalPhotoUrl: "orig.jpg",
  thumbnailPhotoUrl: "thumb.jpg",
  status: "PARSED",
  ...overrides,
});

const openMenu = async () => {
  await userEvent.click(document.querySelector(".ant-dropdown-trigger") as Element);
  return screen.findAllByRole("menuitem");
};

describe("UpdateDropdown", () => {
  afterEach(() => {
    useModalStore.setState({
      isUpdatePhotoModal: false,
      selectedUpdatePhoto: {},
      isDeletePhotoConfirmModal: false,
      deletePhotoId: undefined,
      numberOfRecord: undefined,
    } as never);
  });

  it("opens the update photo modal with the photo pre-filled", async () => {
    const photo = buildPhoto();
    render(<UpdateDropdown photo={photo} totalRecord={5} />);

    const items = await openMenu();
    expect(items.map((i) => i.textContent)).toEqual([
      "Chỉnh sửa",
      "Đăng bán ảnh",
      "Xóa ảnh",
    ]);

    await userEvent.click(screen.getByText("Chỉnh sửa"));

    expect(useModalStore.getState().isUpdatePhotoModal).toBe(true);
    expect(useModalStore.getState().selectedUpdatePhoto).toMatchObject({
      id: "p1",
      isChangeGPS: false,
    });
  });

  it("opens the sell photo modal unless the photo is banned", async () => {
    const photo = buildPhoto({ status: "PARSED" });
    render(<UpdateDropdown photo={photo} totalRecord={5} />);

    await openMenu();
    await userEvent.click(screen.getByText("Đăng bán ảnh"));

    expect(screen.getByText("sell modal p1")).toBeInTheDocument();

    await userEvent.click(screen.getByText("close sell modal"));
    expect(screen.queryByText("sell modal p1")).not.toBeInTheDocument();
  });

  it("does not open the sell photo modal when the photo is banned", async () => {
    const photo = buildPhoto({ status: "BAN" });
    render(<UpdateDropdown photo={photo} totalRecord={5} />);

    await openMenu();
    await userEvent.click(screen.getByText("Đăng bán ảnh"));

    expect(screen.queryByText("sell modal p1")).not.toBeInTheDocument();
  });

  it("opens the delete confirmation and records the total for pagination", async () => {
    const photo = buildPhoto({ id: "p2" });
    render(<UpdateDropdown photo={photo} totalRecord={7} />);

    await openMenu();
    await userEvent.click(screen.getByText("Xóa ảnh"));

    expect(useModalStore.getState().isDeletePhotoConfirmModal).toBe(true);
    expect(useModalStore.getState().deletePhotoId).toBe("p2");
    expect(useModalStore.getState().numberOfRecord).toBe(7);
  });
});
