import { act, createRef } from "react";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse } from "msw";
import type { MockInstance } from "vitest";
import { renderWithProviders } from "../../../test/render";
import { mockEndpoint } from "../../../test/mockEndpoint";
import ServicePackageManager from "./ServicePackageManager";
import {
  TableServicePackage,
  type ServicePackageRow,
  type TableServicePackageHandle,
} from "./TableServicePackage";
import { servicePackage } from "./servicePackageFixtures.test.data";
import { user } from "../TransactionWithdrawalManager/withdrawalFixtures.test.data";

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

vi.mock("react-quill", async () => {
  const { createElement } = await import("react");
  return {
    default: ({ value }: { value?: string }) =>
      createElement("textarea", { "aria-label": "quill", value, readOnly: true }),
  };
});

const wedding = servicePackage();
const portrait = servicePackage({
  id: "sp2",
  title: "Chân dung",
  price: 800000,
  description: "<p>Ảnh thẻ</p>",
  user: user({ id: "u2", name: "Trần Thị B", avatar: "" }),
  createdAt: new Date(2026, 8, 14, 9, 0).toISOString(),
});
const family = servicePackage({
  id: "sp3",
  title: "Gia đình",
  price: 2000000,
  description: "<p>Ảnh gia đình</p>",
  user: user({ id: "u3", name: "Lê Văn C" }),
  createdAt: new Date(2026, 8, 13, 8, 0).toISOString(),
});

const list = (objects: ServicePackageRow[]) => ({
  objects,
  totalRecord: objects.length,
  totalPage: 1,
});

const rowOf = (text: string) =>
  screen.getByText(text).closest("tr") as HTMLElement;

const titles = () =>
  screen
    .getAllByRole("row")
    .map(
      (row) =>
        within(row).queryByText(/^(Chụp cưới|Chân dung|Gia đình)$/)?.textContent,
    )
    .filter(Boolean);

const renderLoaded = async () => {
  const requests = mockEndpoint(
    "get",
    "*/manager/photoshoot-package",
    list([wedding, portrait, family]),
  );
  renderWithProviders(<ServicePackageManager />);
  await screen.findByText("Chụp cưới");
  return requests;
};

describe("ServicePackageManager", () => {
  let consoleError: MockInstance<typeof console.error>;

  beforeEach(() => {
    consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
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
  });

  it("lists the packages with price, description and owner", async () => {
    const requests = await renderLoaded();

    expect(requests[0].query).toEqual({
      limit: "9999",
      page: "0",
      orderByCreatedAt: "desc",
    });
    const first = rowOf("Chụp cưới");
    expect(first).toHaveTextContent("5.000.000 ₫");
    expect(within(first).getByText("ngày cưới").tagName).toBe("B");
    expect(within(first).getByText("Nguyễn Văn A")).toBeInTheDocument();
    expect(
      within(first).getByAltText("https://cdn.test/avatar-a.jpg"),
    ).toBeInTheDocument();
    expect(within(first).getByText("10:30 / 15-09-2026")).toBeInTheDocument();
    expect(
      within(rowOf("Chân dung")).queryByRole("img", { name: /cdn\.test/ }),
    ).toBeNull();
  });

  it("opens the details from the menu", async () => {
    await renderLoaded();

    await userEvent.click(
      within(rowOf("Chân dung")).getByRole("button", { name: "ellipsis" }),
    );
    const items = await screen.findAllByRole("menuitem");
    expect(items.map((item) => item.textContent)).toEqual(["Chi tiết"]);
    await userEvent.click(items[0]);

    expect(await screen.findByText("Chi tiết gói Nâng cấp")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Khóa gói dịch vụ/ }),
    ).toBeInTheDocument();
  });

  it("keeps the hidden edit action working", async () => {
    await renderLoaded();

    await userEvent.click(within(rowOf("Gia đình")).getByText("hidden edit"));

    expect(await screen.findByText("Cập nhật blog")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Tên bài viết")).toHaveValue("Gia đình");
  });

  it("deletes a package through the hidden delete action", async () => {
    const requests = await renderLoaded();
    const deletes = mockEndpoint("delete", "*/manager/photoshoot-package/sp1", {});

    await userEvent.click(within(rowOf("Chụp cưới")).getByText("hidden delete"));
    await userEvent.click(await screen.findByRole("button", { name: "Xóa" }));

    expect(await screen.findByText("Đã xóa gói chụp")).toBeInTheDocument();
    expect(deletes).toHaveLength(1);
    await waitFor(() => expect(requests).toHaveLength(2));
  });

  it("reports a failed delete", async () => {
    await renderLoaded();
    mockEndpoint(
      "delete",
      "*/manager/photoshoot-package/sp2",
      () => new HttpResponse(null, { status: 500 }),
    );
    vi.spyOn(console, "log").mockImplementation(() => {});

    await userEvent.click(within(rowOf("Chân dung")).getByText("hidden delete"));
    await userEvent.click(await screen.findByRole("button", { name: "Xóa" }));

    await waitFor(() => expect(screen.getAllByText("Lỗi")).toHaveLength(2));
    vi.mocked(console.log).mockRestore();
  });

  it("sorts by title, price, owner and date", async () => {
    await renderLoaded();

    await userEvent.click(screen.getByText("Tên gói chụp"));
    expect(titles()).toEqual(["Chân dung", "Chụp cưới", "Gia đình"]);

    await userEvent.click(screen.getByText("Giá Tiền"));
    expect(titles()).toEqual(["Chân dung", "Gia đình", "Chụp cưới"]);

    await userEvent.click(screen.getByText("Người sở hữu"));
    expect(titles()).toEqual(["Gia đình", "Chụp cưới", "Chân dung"]);

    await userEvent.click(screen.getByText("Ngày tạo"));
    expect(titles()).toEqual(["Gia đình", "Chân dung", "Chụp cưới"]);
  });

  it("reloads from the refresh button and the table handle", async () => {
    const requests = mockEndpoint(
      "get",
      "*/manager/photoshoot-package",
      list([wedding]),
    );
    const ref = createRef<TableServicePackageHandle>();
    renderWithProviders(<TableServicePackage ref={ref} />);
    await screen.findByText("Chụp cưới");

    await userEvent.click(screen.getByTitle("Làm mới"));
    await waitFor(() => expect(requests).toHaveLength(2));

    act(() => ref.current?.reloadData());
    await waitFor(() => expect(requests).toHaveLength(3));
  });

  it("logs a failed load", async () => {
    mockEndpoint(
      "get",
      "*/manager/photoshoot-package",
      () => new HttpResponse(null, { status: 500 }),
    );
    renderWithProviders(<ServicePackageManager />);

    await waitFor(() =>
      expect(consoleError).toHaveBeenCalledWith(
        "Error fetching items:",
        expect.anything(),
      ),
    );
  });
});
