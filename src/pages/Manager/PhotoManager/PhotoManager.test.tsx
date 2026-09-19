import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse } from "msw";
import type { MockInstance } from "vitest";
import { renderWithProviders } from "../../../test/render";
import { mockEndpoint } from "../../../test/mockEndpoint";
import PhotoManager from "./PhotoManager";
import { list, photo, photographer } from "./photoFixtures.test.data";

vi.mock("../../../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

// the real menu, plus buttons reaching the default actions this table hides
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
          { type: "button", onClick: () => props.showModalDetails?.(props.record) },
          "hidden details",
        ),
        createElement(
          "button",
          { type: "button", onClick: () => props.showModalEdit?.(props.record) },
          "hidden edit",
        ),
        createElement(
          "button",
          { type: "button", onClick: () => props.showModalDelete?.(props.record) },
          "hidden delete",
        ),
      );
    return { ...actual, default: MenuWithHiddenActions };
  },
);

// SignedPhotoDto has no user; the uploader column sorts by it anyway
const sunset = {
  ...photo({ id: "p1", title: "Hoàng hôn", description: "Biển Vũng Tàu" }),
  user: { name: "Bình" },
};
const sunrise = {
  ...photo({
    id: "p2",
    title: "Bình minh",
    description: "Đà Lạt",
    photographer: photographer({ id: "pg2", name: "Trần Thị B", avatar: "" }),
    signedUrl: { url: "", thumbnail: "" },
    createdAt: new Date(2026, 8, 14, 9, 0).toISOString(),
  }),
  user: { name: "An" },
};
const field = photo({
  id: "p3",
  title: "Cánh đồng",
  description: "Mù Cang Chải",
  photographer: photographer({ id: "pg3", name: "Lê Văn C" }),
  createdAt: new Date(2026, 8, 13, 8, 0).toISOString(),
});

// the table starts loading half a second after mounting
const LOAD = { timeout: 3000 };

const rowOf = (text: string) =>
  screen.getByText(text).closest("tr") as HTMLElement;

const titles = () =>
  screen
    .getAllByRole("row")
    .map(
      (row) =>
        within(row).queryByText(/^(Hoàng hôn|Bình minh|Cánh đồng)$/)?.textContent,
    )
    .filter(Boolean);

const renderLoaded = async () => {
  const requests = mockEndpoint(
    "get",
    "*/manager/photo",
    list([sunset, sunrise, field]),
  );
  renderWithProviders(<PhotoManager />);
  await screen.findByText("Hoàng hôn", {}, LOAD);
  return requests;
};

describe("PhotoManager", () => {
  let consoleError: MockInstance<typeof console.error>;
  let consoleLog: MockInstance<typeof console.log>;

  beforeEach(() => {
    consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    // failed deletes are logged
    consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    // antd reports the deprecated APIs the shared menu uses; anything else is unexpected
    const unexpected = consoleError.mock.calls
      .map(([message]) => String(message))
      .filter(
        (message) =>
          !message.includes("deprecated") &&
          !message.startsWith("Error fetching items:"),
      );
    expect(unexpected).toEqual([]);
    consoleError.mockRestore();
    consoleLog.mockRestore();
  });

  it("lists the posts with their uploader, image link and date", async () => {
    const requests = await renderLoaded();

    expect(requests[0].query).toEqual({ limit: "9999", page: "0" });
    const first = rowOf("Hoàng hôn");
    expect(within(first).getByText("Nguyễn Văn A")).toBeInTheDocument();
    expect(
      within(first).getByAltText("https://cdn.test/pg-a.jpg"),
    ).toBeInTheDocument();
    expect(within(first).getByText("p1")).toBeInTheDocument();
    expect(within(first).getByText("Biển Vũng Tàu")).toBeInTheDocument();
    expect(within(first).getByText("10:30 / 15-09-2026")).toBeInTheDocument();
    expect(within(first).getByRole("link", { name: "Bài viết" })).toHaveAttribute(
      "href",
      "/photo/p1",
    );

    const second = rowOf("Bình minh");
    expect(within(second).getByText("Trần Thị B")).toBeInTheDocument();
    expect(within(second).queryByRole("link")).toBeNull();
    expect(within(second).queryByAltText(/cdn\.test/)).toBeNull();
  });

  it("deletes a post from the menu and reloads", async () => {
    const requests = await renderLoaded();
    const deletes = mockEndpoint("delete", "*/manager/photo/p1", {});

    await userEvent.click(
      within(rowOf("Hoàng hôn")).getByRole("button", { name: "ellipsis" }),
    );
    const items = await screen.findAllByRole("menuitem");
    expect(items.map((item) => item.textContent)).toEqual(["Xóa bài viết"]);
    await userEvent.click(items[0]);
    await screen.findByText("Bạn có chắc xóa bài viết?");
    await userEvent.click(screen.getByRole("button", { name: "Xóa bài" }));

    expect(await screen.findByText("Đã xóa bài viết")).toBeInTheDocument();
    expect(deletes).toEqual([
      expect.objectContaining({ method: "DELETE", path: "/manager/photo/p1" }),
    ]);
    await waitFor(() => expect(requests).toHaveLength(2));
  });

  it("reports a post that could not be deleted", async () => {
    await renderLoaded();
    mockEndpoint(
      "delete",
      "*/manager/photo/p2",
      () => new HttpResponse(null, { status: 500 }),
    );

    await userEvent.click(
      within(rowOf("Bình minh")).getByRole("button", { name: "ellipsis" }),
    );
    await userEvent.click(await screen.findByText("Xóa bài viết"));
    await userEvent.click(await screen.findByRole("button", { name: "Xóa bài" }));

    expect(await screen.findByText("Không thành công")).toBeInTheDocument();
    expect(consoleLog).toHaveBeenCalledWith("error", expect.anything());
  });

  it("keeps the hidden details, edit and delete actions working", async () => {
    const requests = await renderLoaded();
    const row = within(rowOf("Hoàng hôn"));

    await userEvent.click(row.getByText("hidden details"));
    expect(await screen.findByText("123")).toBeInTheDocument();

    await userEvent.click(row.getByText("hidden edit"));
    expect(await screen.findByText("Cập nhật gói Nâng cấp")).toBeInTheDocument();

    const deletes = mockEndpoint("delete", "*/upgrade-package/p1", {});
    await userEvent.click(row.getByText("hidden delete"));
    await screen.findByText("Bạn có chắc chắn muốn xóa?");
    await userEvent.click(screen.getByRole("button", { name: "Xóa" }));

    expect(await screen.findByText("Đã thành công")).toBeInTheDocument();
    expect(deletes).toHaveLength(1);
    await waitFor(() => expect(requests).toHaveLength(2));
  });

  it("reports a failed hidden delete", async () => {
    await renderLoaded();
    mockEndpoint(
      "delete",
      "*/upgrade-package/p3",
      () => new HttpResponse(null, { status: 500 }),
    );

    await userEvent.click(within(rowOf("Cánh đồng")).getByText("hidden delete"));
    await userEvent.click(await screen.findByRole("button", { name: "Xóa" }));

    await waitFor(() => expect(screen.getAllByText("Lỗi")).toHaveLength(2));
  });

  it("sorts by every sortable column", async () => {
    await renderLoaded();

    await userEvent.click(screen.getByText("Tên bài"));
    expect(titles()).toEqual(["Bình minh", "Cánh đồng", "Hoàng hôn"]);

    await userEvent.click(screen.getByText("Ngày đăng"));
    expect(titles()).toEqual(["Cánh đồng", "Bình minh", "Hoàng hôn"]);

    await userEvent.click(screen.getByText("ID bài"));
    expect(titles()).toEqual(["Hoàng hôn", "Bình minh", "Cánh đồng"]);

    await userEvent.click(screen.getByText("Nội dung"));
    expect(titles()).toEqual(["Hoàng hôn", "Bình minh", "Cánh đồng"]);

    await userEvent.click(screen.getByText("Người đăng"));
    expect(titles()).toHaveLength(3);
    // antd re-renders the whole table on every sort
  }, 20000);

  it("retries an unauthorized load", async () => {
    let calls = 0;
    const requests = mockEndpoint("get", "*/manager/photo", () =>
      calls++ === 0
        ? new HttpResponse(null, { status: 401 })
        : HttpResponse.json(list([field])),
    );
    renderWithProviders(<PhotoManager />);

    expect(await screen.findByText("Cánh đồng", {}, LOAD)).toBeInTheDocument();
    expect(requests).toHaveLength(2);
    expect(consoleError).toHaveBeenCalledWith(
      "Error fetching items:",
      expect.anything(),
    );
  });
});
