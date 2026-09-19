import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { message } from "antd";
import type { MessageType } from "antd/es/message/interface";
import { http, HttpResponse } from "msw";
import type { MockInstance } from "vitest";
import type { Schema } from "../../../apis/types";
import useSellPhotoStore, {
  type SellPhotoItem,
} from "../../../states/UseSellPhotoState";
import { mockEndpoint } from "../../../test/mockEndpoint";
import { renderWithProviders } from "../../../test/render";
import { server } from "../../../test/server";
import PhotoSellCard from "./PhotoSellCard";

vi.mock("../../../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

const rcFile = (uid: string) =>
  Object.assign(new File(["img"], `${uid}.jpg`, { type: "image/jpeg" }), {
    uid,
    lastModifiedDate: new Date(2026, 8, 15),
  });

const noopMessage = (() => {}) as unknown as MessageType;

// queues a photo and returns the stored item, which the store updates in place
const queue = (uid: string, item: Partial<SellPhotoItem> = {}) => {
  useSellPhotoStore.getState().addPhoto(uid, {
    file: rcFile(uid),
    reviewUrl: `blob:${uid}`,
    title: `Ảnh ${uid}`,
    ...item,
  });
  const state = useSellPhotoStore.getState();
  return state.photoArray[state.uidHashmap[uid]];
};

const uploaded = (uid: string) => {
  const photo = queue(uid, {
    status: "done",
    pricetags: [{ width: 6000, height: 4000, price: 2000 }],
  });
  useSellPhotoStore
    .getState()
    .setPhotoUploadResponse(uid, { id: `photo-${uid}` } as Schema<"SignedPhotoDto">);
  return photo;
};

const deleteIcon = () => screen.getByRole("img", { name: "delete" });

describe("PhotoSellCard", () => {
  let consoleError: MockInstance<typeof console.error>;

  beforeEach(() => {
    useSellPhotoStore.getState().clearState();
    consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    const unexpected = consoleError.mock.calls
      .map((args) => args.map(String).join(" "))
      // antd's Tooltip still calls findDOMNode for react-icons, which do not forward refs
      .filter((text) => !text.includes("findDOMNode is deprecated"));
    expect(unexpected.join("\n")).toBe("");
    vi.restoreAllMocks();
  });

  it("shows the upload progress of its own photo", async () => {
    const photo = queue("a", { status: "uploading" });
    const { container } = renderWithProviders(<PhotoSellCard photo={photo} />);

    expect(screen.getByText("Đang xử lý ảnh")).toBeInTheDocument();
    expect(container.querySelector(".bg-gray-500")).not.toBeNull();
    expect(screen.getByText("Ảnh a")).toBeInTheDocument();

    act(() => useSellPhotoStore.getState().updatePhotoPropertyByUid("a", "percent", 45));
    expect(screen.getByText("Đang tải ảnh lên")).toBeInTheDocument();

    await userEvent.click(screen.getByText("Đang tải ảnh lên"));
    expect(useSellPhotoStore.getState().selectedPhoto).toBe("a");
    expect(container.querySelector(".bg-gray-300")).not.toBeNull();
    expect(screen.getByAltText("Photo")).toHaveClass("border-red-500");
  });

  it("flags a finished photo that has no sellable price", async () => {
    const photo = queue("a", { status: "done" });
    const cheap = queue("b", {
      status: "done",
      pricetags: [{ width: 6000, height: 4000, price: 999 }],
    });
    const priced = queue("c", {
      status: "done",
      pricetags: [{ width: 6000, height: 4000, price: 1000 }],
    });
    const { rerender } = renderWithProviders(<PhotoSellCard photo={photo} />);

    const flag = screen.getByText("Ảnh chưa có giá bán");
    expect(flag).not.toHaveClass("border-white");

    await userEvent.click(flag);
    expect(useSellPhotoStore.getState().selectedPhoto).toBe("a");
    expect(screen.getByText("Ảnh chưa có giá bán")).toHaveClass("border-white");
    expect(screen.getByAltText("Photo")).toHaveClass("border-white");

    rerender(<PhotoSellCard photo={cheap} />);
    expect(screen.getByText("Ảnh chưa có giá bán")).toBeInTheDocument();

    rerender(<PhotoSellCard photo={priced} />);
    expect(screen.queryByText("Ảnh chưa có giá bán")).toBeNull();
  });

  it("explains why an upload did not finish", async () => {
    const duplicated = queue("a", { status: "duplicated" });
    const failed = queue("b", { status: "failed" });
    const { rerender } = renderWithProviders(<PhotoSellCard photo={duplicated} />);

    await userEvent.click(screen.getByText("Ảnh đã tồn tại trong hệ thống"));
    expect(useSellPhotoStore.getState().selectedPhoto).toBe("a");

    rerender(<PhotoSellCard photo={failed} />);
    expect(screen.getByText("failed")).toBeInTheDocument();
  });

  it("deletes an uploaded photo", async () => {
    const photo = uploaded("a");
    const requests = mockEndpoint("delete", "*/photo/photo-a");
    renderWithProviders(<PhotoSellCard photo={photo} />);

    await userEvent.click(deleteIcon());

    expect(useSellPhotoStore.getState().photoArray).toEqual([]);
    await waitFor(() => expect(requests).toHaveLength(1));
  });

  it("puts the photo back when deleting fails", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    const error = vi.spyOn(message, "error").mockImplementation(() => noopMessage);
    server.use(
      http.delete("*/photo/photo-a", () => HttpResponse.json({}, { status: 500 })),
    );
    const photo = uploaded("a");
    renderWithProviders(<PhotoSellCard photo={photo} />);

    await userEvent.click(deleteIcon());

    await waitFor(() => expect(error).toHaveBeenCalledTimes(2));
    expect(error).toHaveBeenCalledWith("Chưa thể xóa ảnh");
    expect(log).toHaveBeenCalledWith(
      "deletePhotoMutateError",
      expect.objectContaining({ message: "Request failed with status code 500" }),
    );
    expect(useSellPhotoStore.getState().photoArray).toEqual([
      expect.objectContaining({ title: "Ảnh a", status: "done" }),
    ]);
  });

  it("ignores another delete while one is running", async () => {
    let release = () => {};
    let calls = 0;
    server.use(
      http.delete("*/photo/photo-a", async () => {
        calls += 1;
        await new Promise<void>((resolve) => {
          release = () => resolve();
        });
        return HttpResponse.json({});
      }),
    );
    const photo = uploaded("a");
    renderWithProviders(<PhotoSellCard photo={photo} />);

    await userEvent.click(deleteIcon());
    await waitFor(() => expect(calls).toBe(1));
    await userEvent.click(deleteIcon());

    expect(calls).toBe(1);
    release();
    await waitFor(() => expect(screen.getByAltText("Photo")).toBeInTheDocument());
  });

  it("drops a photo that never finished uploading", async () => {
    const pending = queue("a", { status: "uploading" });
    const failed = uploaded("b");
    const { rerender } = renderWithProviders(<PhotoSellCard photo={pending} />);

    await userEvent.click(deleteIcon());
    expect(useSellPhotoStore.getState().photoArray).toEqual([failed]);

    // an errored photo is dropped from the queue without asking the server
    failed.status = "error";
    rerender(<PhotoSellCard photo={failed} />);
    await userEvent.click(deleteIcon());
    expect(useSellPhotoStore.getState().photoArray).toEqual([]);
  });
});
