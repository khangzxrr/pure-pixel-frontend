import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse } from "msw";
import type { MockInstance } from "vitest";
import { createTestQueryClient, renderWithProviders } from "../../../test/render";
import { mockEndpoint } from "../../../test/mockEndpoint";
import type { Schema } from "../../../apis/types";
import PhotoManager2 from "./PhotoManager2";
import {
  list,
  photo,
  photographer,
} from "../PhotoManager/photoFixtures.test.data";

vi.mock("../../../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

type UpdateStubProps = {
  photo: { title?: string } | null;
  onClose: () => void;
  loading: () => void;
};

// the photo editor (another folder, still JavaScript) is replaced by its callbacks
vi.mock("../../../components/ComInputModal/UpdatePhotoInManager", async () => {
  const { createElement } = await import("react");
  return {
    default: ({ photo, onClose, loading }: UpdateStubProps) =>
      createElement(
        "div",
        null,
        createElement("p", null, `Đang sửa: ${photo?.title}`),
        createElement("button", { type: "button", onClick: onClose }, "stub close"),
        createElement("button", { type: "button", onClick: loading }, "stub reload"),
      ),
  };
});

// the real menu, plus a button reaching the delete action this table hides
vi.mock(
  "../../../components/ComMenuButonTable/ComMenuButonTable",
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import("../../../components/ComMenuButonTable/ComMenuButonTable")
      >();
    const { createElement, Fragment } = await import("react");
    type MenuProps = Parameters<typeof actual.default>[0];
    const MenuWithHiddenActions = (props: MenuProps) =>
      createElement(
        Fragment,
        null,
        createElement(actual.default, props),
        createElement(
          "button",
          { type: "button", onClick: () => props.showModalDelete?.(props.record) },
          "hidden delete",
        ),
      );
    return { ...actual, default: MenuWithHiddenActions };
  },
);

const photoSelling: Schema<"PhotoSellDto"> = {
  photoId: "p1",
  photoSellId: "s1",
  description: "",
  active: true,
  createdAt: "2026-09-15T00:00:00.000Z",
  updatedAt: "2026-09-15T00:00:00.000Z",
  pricetags: [],
  photoSellHistories: [],
};

const sunset = photo({
  id: "p1",
  title: "Hoàng hôn",
  photoSellings: [photoSelling],
});
const sunrise = photo({
  id: "p2",
  title: "Bình minh",
  photoType: "BOOKING",
  status: "PENDING",
  visibility: "PRIVATE",
  photographer: photographer({ id: "pg2", name: "Trần Thị B" }),
  signedUrl: { url: "", thumbnail: "" },
  createdAt: new Date(2026, 8, 14, 9, 0).toISOString(),
});
const copy = photo({
  id: "p3",
  title: "Bản sao",
  status: "DUPLICATED",
  photographer: photographer({ id: "pg3", name: "Lê Văn C" }),
});
const banned = photo({
  id: "p4",
  title: "Vi phạm",
  status: "BAN",
  photographer: photographer({ id: "pg4", name: "Phạm Văn D" }),
});
const photos = [sunset, sunrise, copy, banned];

const rowOf = (text: string) =>
  screen.getByText(text).closest("tr") as HTMLElement;

const openDropdown = async (title: string) => {
  const header = screen.getByText(title).closest("th") as HTMLElement;
  await userEvent.click(
    header.querySelector(".ant-table-filter-trigger") as HTMLElement,
  );
  return waitFor(() => {
    const dropdown = document.querySelector(
      ".ant-dropdown:not(.ant-dropdown-hidden) .ant-table-filter-dropdown",
    );
    expect(dropdown).not.toBeNull();
    return dropdown as HTMLElement;
  });
};

const applyFilter = async (title: string, option: string) => {
  const dropdown = await openDropdown(title);
  await userEvent.click(within(dropdown).getByText(option));
  await userEvent.click(within(dropdown).getByRole("button", { name: "Đồng ý" }));
};

const search = async (title: string, placeholder: string, text: string) => {
  const dropdown = await openDropdown(title);
  await userEvent.type(within(dropdown).getByPlaceholderText(placeholder), text);
  await userEvent.click(within(dropdown).getByRole("button", { name: /Tìm kiếm/ }));
};

const renderLoaded = async (totalRecord?: number) => {
  const requests = mockEndpoint(
    "get",
    "*/manager/photo",
    list(photos, totalRecord),
  );
  const queryClient = createTestQueryClient();
  renderWithProviders(<PhotoManager2 />, { queryClient });
  await screen.findByText("Hoàng hôn");
  return { requests, queryClient };
};

describe("PhotoManager2", () => {
  let consoleError: MockInstance<typeof console.error>;

  beforeEach(() => {
    consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    const unexpected = consoleError.mock.calls
      .map(([message]) => String(message))
      .filter(
        (message) =>
          // antd reports the deprecated Modal `visible` and menu APIs
          !message.includes("deprecated") &&
          // the table has no rowKey and the photos no `key` (source behaviour, reported)
          !message.includes('unique "key" prop') &&
          // the failed delete uses antd's static message inside a ConfigProvider
          !message.includes("[antd: message] Static function") &&
          !message.startsWith("Error fetching items:"),
      );
    expect(unexpected).toEqual([]);
    consoleError.mockRestore();
  });

  it("loads the newest photos and shows their type, status and visibility", async () => {
    const { requests } = await renderLoaded();

    expect(requests[0].query).toEqual({
      limit: "10",
      page: "0",
      orderByCreatedAt: "desc",
    });
    const first = rowOf("Hoàng hôn");
    expect(within(first).getByAltText("Photo Thumbnail")).toHaveAttribute(
      "src",
      "https://cdn.test/p1-thumb.jpg",
    );
    expect(within(first).getByText("Nguyễn Văn A")).toBeInTheDocument();
    expect(within(first).getByText("RAW")).toBeInTheDocument();
    expect(within(first).getByText("Hoạt động")).toBeInTheDocument();
    expect(within(first).getByText("Công khai")).toBeInTheDocument();
    expect(within(first).getByText("10:30 / 15-09-2026")).toBeInTheDocument();
    expect(first.querySelector("svg.text-green-500")).not.toBeNull();

    const second = rowOf("Bình minh");
    expect(within(second).queryByAltText("Photo Thumbnail")).toBeNull();
    expect(within(second).getByText("BOOKING")).toBeInTheDocument();
    expect(within(second).getByText("Đang chờ")).toBeInTheDocument();
    expect(within(second).getByText("Riêng tư")).toBeInTheDocument();
    expect(second.querySelector("svg.text-green-500")).toBeNull();

    expect(within(rowOf("Bản sao")).getByText("Bị trùng lặp")).toBeInTheDocument();
    expect(within(rowOf("Vi phạm")).getByText("Khóa")).toBeInTheDocument();
  });

  it("filters by status, type and visibility on the server", async () => {
    const { requests } = await renderLoaded();

    await applyFilter("Trạng thái", "Khóa");
    await waitFor(() => expect(requests).toHaveLength(2));
    expect(requests[1].query).toMatchObject({
      statuses: "BAN",
      limit: "10",
      page: "0",
    });
    await waitFor(() => expect(screen.queryByText("Hoàng hôn")).toBeNull());
    expect(screen.getByText("Vi phạm")).toBeInTheDocument();

    await applyFilter("Loại ảnh", "BOOKING");
    await waitFor(() => expect(requests).toHaveLength(3));
    expect(requests[2].query).toMatchObject({
      statuses: "BAN",
      photoType: "BOOKING",
    });

    await applyFilter("Quyền riêng tư", "Riêng tư");
    await waitFor(() => expect(requests).toHaveLength(4));
    expect(requests[3].query).toMatchObject({ visibility: "PRIVATE" });
  });

  it("searches by title and by photographer", async () => {
    const { requests } = await renderLoaded();

    await search("Tên ảnh", "Tìm kiếm Tên ảnh", "Bình");
    await waitFor(() => expect(requests).toHaveLength(2));
    expect(requests[1].query).toMatchObject({ title: "Bình" });

    await search("Người dùng", "Tìm kiếm Tên người dùng", "Trần");
    await waitFor(() => expect(requests).toHaveLength(3));
    expect(requests[2].query).toMatchObject({
      title: "Bình",
      photographerName: "Trần",
    });
  });

  it("sorts by creation date and pages on the server", async () => {
    const { requests } = await renderLoaded(25);

    await userEvent.click(screen.getByText("Ngày tạo"));
    await waitFor(() => expect(requests).toHaveLength(2));
    expect(requests[1].query).toEqual({
      limit: "10",
      page: "0",
      orderByCreatedAt: "asc",
    });

    await userEvent.click(screen.getByTitle("2"));
    await waitFor(() =>
      expect(requests.at(-1)?.query).toMatchObject({ page: "1" }),
    );
    const before = requests.length;

    await userEvent.click(screen.getByTitle("Làm mới"));
    await waitFor(() => expect(requests).toHaveLength(before + 1));
  });

  it("edits a photo from the menu", async () => {
    const { requests } = await renderLoaded();

    await userEvent.click(
      within(rowOf("Hoàng hôn")).getByRole("button", { name: "ellipsis" }),
    );
    const items = await screen.findAllByRole("menuitem");
    expect(items.map((item) => item.textContent)).toEqual(["Cập nhật chỉnh sửa"]);
    await userEvent.click(items[0]);

    expect(await screen.findByText("Đang sửa: Hoàng hôn")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "stub reload" }));
    await waitFor(() => expect(requests).toHaveLength(2));

    // a closed antd modal keeps its last content, so reopen for another photo
    await userEvent.click(screen.getByRole("button", { name: "stub close" }));
    await userEvent.click(
      within(rowOf("Bình minh")).getByRole("button", { name: "ellipsis" }),
    );
    await userEvent.click(
      (await screen.findAllByText("Cập nhật chỉnh sửa")).at(-1) as HTMLElement,
    );
    expect(await screen.findByText("Đang sửa: Bình minh")).toBeInTheDocument();
  });

  it("deletes a photo after confirmation and reloads", async () => {
    const { requests, queryClient } = await renderLoaded();
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    const deletes = mockEndpoint("delete", "*/manager/photo/p2", {});

    await userEvent.click(within(rowOf("Bình minh")).getByText("hidden delete"));
    await userEvent.click(await screen.findByRole("button", { name: "Xóa" }));

    expect(await screen.findByText("Xóa ảnh thành công")).toBeInTheDocument();
    expect(screen.getByText("Ảnh có ID p2 đã được xóa.")).toBeInTheDocument();
    expect(deletes).toEqual([
      expect.objectContaining({ method: "DELETE", path: "/manager/photo/p2" }),
    ]);
    await waitFor(() => expect(requests).toHaveLength(2));
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["manager-photos"] });
  });

  it("shows why a delete failed, and cancels without deleting", async () => {
    await renderLoaded();
    mockEndpoint(
      "delete",
      "*/manager/photo/p1",
      () => new HttpResponse(null, { status: 500 }),
    );

    await userEvent.click(within(rowOf("Hoàng hôn")).getByText("hidden delete"));
    await userEvent.click(await screen.findByRole("button", { name: "Hủy bỏ" }));
    await userEvent.click(within(rowOf("Hoàng hôn")).getByText("hidden delete"));
    await userEvent.click(await screen.findByRole("button", { name: "Xóa" }));

    expect(
      await screen.findByText("Request failed with status code 500"),
    ).toBeInTheDocument();
  });

  it("logs failed and unauthorized loads", async () => {
    let calls = 0;
    mockEndpoint("get", "*/manager/photo", () =>
      new HttpResponse(null, { status: calls++ === 0 ? 500 : 401 }),
    );
    renderWithProviders(<PhotoManager2 />);

    await waitFor(() =>
      expect(consoleError).toHaveBeenCalledWith(
        "Error fetching items:",
        expect.anything(),
      ),
    );
    await userEvent.click(screen.getByTitle("Làm mới"));
    // antd warnings go to console.error as well; count the load failures only
    await waitFor(() =>
      expect(
        consoleError.mock.calls.filter(
          ([message]) => message === "Error fetching items:",
        ),
      ).toHaveLength(2),
    );
  });
});
