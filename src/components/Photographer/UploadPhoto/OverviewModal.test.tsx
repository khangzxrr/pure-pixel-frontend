import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { message } from "antd";
import type { MessageType } from "antd/es/message/interface";
import type { MockInstance } from "vitest";
import useUploadPhotoStore from "../../../states/UploadPhotoState";
import { renderWithProviders } from "../../../test/render";
import OverviewModal from "./OverviewModal";

const navigate = vi.hoisted(() => vi.fn());

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => navigate,
}));

const rcFile = (uid: string) =>
  Object.assign(new File(["img"], `${uid}.jpg`, { type: "image/jpeg" }), {
    uid,
    lastModifiedDate: new Date(2026, 8, 15),
  });

const noopMessage = (() => {}) as unknown as MessageType;

describe("OverviewModal", () => {
  let consoleError: MockInstance<typeof console.error>;

  beforeEach(() => {
    navigate.mockClear();
    const store = useUploadPhotoStore.getState();
    store.clearState();
    store.addPhoto("a", {
      file: rcFile("a"),
      thumbUrl: "blob:thumb-a",
      title: "Hoàng hôn",
      description: "Trên núi",
      photoType: "RAW",
      photoTags: ["núi", 3, { name: "object" }],
      location: "Đà Lạt",
      visibility: "PUBLIC",
    });
    store.addPhoto("b", {
      file: rcFile("b"),
      title: "Không thẻ",
      photoType: { kind: "object" },
      location: 12,
    });
    store.setIsOpenDraftModal(true);
    consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    // the modal still uses antd's deprecated `visible` prop
    const unexpected = consoleError.mock.calls
      .map(([text]) => String(text))
      .filter((text) => !text.includes("deprecated"));
    expect(unexpected).toEqual([]);
    consoleError.mockRestore();
  });

  it("lists the drafts and saves them", async () => {
    const success = vi.spyOn(message, "success").mockImplementation(() => noopMessage);

    renderWithProviders(<OverviewModal />);

    expect(screen.getByText("Bản thảo")).toBeInTheDocument();
    ["Hoàng hôn", "Trên núi", "RAW", "núi", "3", "Đà Lạt", "PUBLIC", "Không thẻ", "12"].forEach(
      (text) => expect(screen.getByText(text)).toBeInTheDocument(),
    );
    const images = document.querySelectorAll(".ant-list img");
    expect(images).toHaveLength(2);
    expect(images[0]).toHaveAttribute("src", "blob:thumb-a");
    expect(images[1]).not.toHaveAttribute("src");

    await userEvent.click(screen.getByRole("button", { name: "Đồng ý" }));

    expect(success).toHaveBeenCalledWith("saved all uploaded photos!");
    expect(navigate).toHaveBeenCalledWith("/my-photo/photo/all");
    expect(useUploadPhotoStore.getState()).toMatchObject({
      photoArray: [],
      isOpenDraftModal: false,
    });
    success.mockRestore();
  });

  it("closes without saving", async () => {
    renderWithProviders(<OverviewModal />);

    await userEvent.click(screen.getByRole("button", { name: "Hủy" }));

    expect(useUploadPhotoStore.getState().isOpenDraftModal).toBe(false);
    expect(useUploadPhotoStore.getState().photoArray).toHaveLength(2);
    expect(navigate).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.getByText("Bản thảo")).not.toBeVisible());
  });
});
