import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { MockInstance } from "vitest";
import { http, HttpResponse } from "msw";
import { createTestQueryClient, renderWithProviders } from "../../test/render";
import { server } from "../../test/server";
import { mockEndpoint } from "../../test/mockEndpoint";
import type { Schema } from "../../apis/types";
import AccountManagerPage from "./AccountManagerPage";

type User = Schema<"UserDto">;

vi.mock("../../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

const user = (overrides: Partial<User>): User => ({
  id: "u1",
  createdAt: "2026-09-01T08:00:00.000Z",
  updatedAt: "2026-09-01T08:00:00.000Z",
  roles: ["customer"],
  enabled: true,
  username: "user",
  cover: "https://cdn.test/cover.jpg",
  location: "Hà Nội",
  mail: "user@test.vn",
  phonenumber: "0901234567",
  socialLinks: [],
  expertises: [],
  avatar: "https://cdn.test/avatar.jpg",
  name: "Người dùng",
  quote: "Xin chào",
  ...overrides,
});

const photographer = user({
  id: "u1",
  name: "Nhiếp Ảnh",
  roles: ["photographer"],
  enabled: true,
  createdAt: "2026-09-02T08:00:00.000Z",
});
const customer = user({
  id: "u2",
  name: "Khách Hàng",
  roles: ["customer"],
  enabled: false,
  avatar: "",
  mail: "khach@test.vn",
});
const admin = user({ id: "u3", name: "Quản Trị", roles: ["purepixel-admin"] });

const listUsers = (objects: User[] = [photographer, customer, admin]) =>
  mockEndpoint("get", "*/user", { objects, totalRecord: 25, totalPage: 3 });

// antd renders the table body rows with this class; the header row is separate
const bodyRows = () =>
  Array.from(document.querySelectorAll<HTMLElement>("tr.ant-table-row"));

const rowOf = (name: string) => {
  const row = bodyRows().find((r) => within(r).queryByText(name));
  if (!row) throw new Error(`row ${name} not found`);
  return row;
};

const openRowMenu = async (name: string, label: string) => {
  await userEvent.click(within(rowOf(name)).getByRole("button"));
  await userEvent.click(await screen.findByText(label));
};

describe("AccountManagerPage", () => {
  let consoleError: MockInstance<typeof console.error>;

  beforeEach(() => {
    consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    // antd still warns about the deprecated Modal `visible`, Dropdown `overlay` and Menu children props the page uses;
    // UpdateUserDetail (components/ComInputModal, not converted yet) writes `class` instead of `className`
    const unexpected = consoleError.mock.calls
      .map((args) => args.map(String).join(" "))
      .filter(
        (message) =>
          !message.includes("deprecated") &&
          !message.includes("Invalid DOM property"),
      );
    consoleError.mockRestore();
    expect(unexpected.join("\n")).toBe("");
  });

  it("lists the non-admin accounts newest first", async () => {
    const requests = listUsers();

    renderWithProviders(<AccountManagerPage />);

    expect(await screen.findByText("Nhiếp Ảnh")).toBeInTheDocument();
    expect(screen.getByText("Khách Hàng")).toBeInTheDocument();
    expect(screen.queryByText("Quản Trị")).toBeNull();
    expect(bodyRows()).toHaveLength(2);

    const photographerRow = within(rowOf("Nhiếp Ảnh"));
    expect(photographerRow.getByText("Nhiếp ảnh gia")).toBeInTheDocument();
    expect(photographerRow.getByText("Hoạt động")).toHaveClass("text-green-500");
    expect(photographerRow.getByAltText("Avatar")).toHaveAttribute(
      "src",
      "https://cdn.test/avatar.jpg",
    );

    const customerRow = within(rowOf("Khách Hàng"));
    expect(customerRow.getByText("Khách hàng")).toBeInTheDocument();
    expect(customerRow.getByText("Tạm ngưng")).toHaveClass("text-red-500");
    expect(customerRow.getByText("khach@test.vn")).toBeInTheDocument();
    // accounts without an avatar get a placeholder image
    expect(customerRow.getByAltText("Avatar")).toHaveAttribute(
      "src",
      "https://via.placeholder.com/40",
    );

    expect(requests.map((r) => r.query)).toEqual([
      { limit: "10", page: "0", orderByCreatedAt: "desc" },
    ]);
  });

  it("reloads the table with the refresh button", async () => {
    const requests = listUsers();
    renderWithProviders(<AccountManagerPage />);
    await screen.findByText("Nhiếp Ảnh");

    await userEvent.click(screen.getByTitle("Làm mới"));

    await waitFor(() => expect(requests).toHaveLength(2));
    expect(requests[1].query).toEqual({
      limit: "10",
      page: "0",
      orderByCreatedAt: "desc",
    });
  });

  it("requests the chosen page", async () => {
    const requests = listUsers();
    renderWithProviders(<AccountManagerPage />);
    await screen.findByText("Nhiếp Ảnh");

    await userEvent.click(screen.getByTitle("2"));

    await waitFor(() =>
      expect(requests.map((r) => r.query.page)).toContain("1"),
    );
    // antd reports the table change and the pagination change; both reload page 2
    expect(requests.every((r) => r.query.limit === "10")).toBe(true);
    const pageCount = requests.length;

    // choosing the current page again does not reload
    await userEvent.click(screen.getByTitle("2"));
    expect(requests).toHaveLength(pageCount);
  });

  it("sorts by creation date on the server", async () => {
    const requests = listUsers();
    renderWithProviders(<AccountManagerPage />);
    await screen.findByText("Nhiếp Ảnh");

    await userEvent.click(screen.getByText("Ngày tạo"));

    await waitFor(() =>
      expect(requests.at(-1)?.query).toEqual({
        limit: "10",
        page: "0",
        orderByCreatedAt: "asc",
      }),
    );
    // antd also sorts the loaded rows with the column comparator: oldest first
    await waitFor(() =>
      expect(bodyRows().map((r) => r.textContent)).toEqual([
        expect.stringContaining("Khách Hàng"),
        expect.stringContaining("Nhiếp Ảnh"),
      ]),
    );

    await userEvent.click(screen.getByText("Ngày tạo"));
    await waitFor(() =>
      expect(requests.at(-1)?.query.orderByCreatedAt).toBe("desc"),
    );
  });

  it("searches accounts by name", async () => {
    const requests = listUsers();
    renderWithProviders(<AccountManagerPage />);
    await screen.findByText("Nhiếp Ảnh");

    await userEvent.click(
      document.querySelector<HTMLElement>(".ant-table-filter-trigger")!,
    );
    await userEvent.type(
      await screen.findByPlaceholderText("Tìm kiếm Tên"),
      "Khách",
    );
    await userEvent.click(screen.getByRole("button", { name: /Tìm kiếm/ }));

    await waitFor(() =>
      expect(requests.at(-1)?.query).toEqual({
        limit: "10",
        page: "0",
        search: "Khách",
        orderByCreatedAt: "desc",
      }),
    );
  });

  it("stops loading when the list fails", async () => {
    server.use(http.get("*/user", () => new HttpResponse(null, { status: 500 })));

    renderWithProviders(<AccountManagerPage />);

    await waitFor(() =>
      expect(document.querySelector(".ant-spin-spinning")).toBeNull(),
    );
    expect(document.querySelector(".ant-empty")).not.toBeNull();
    expect(bodyRows()).toHaveLength(0);
  });

  it("shows the account details and invalidates the cached detail on close", async () => {
    listUsers();
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(["user-detail-manager", "u1"], photographer);
    renderWithProviders(<AccountManagerPage />, { queryClient });
    await screen.findByText("Nhiếp Ảnh");

    await openRowMenu("Nhiếp Ảnh", "Chi tiết");

    const dialog = await screen.findByRole("dialog");
    expect(
      within(dialog).getByText("Thông tin chi tiết tài khoản"),
    ).toBeInTheDocument();
    expect(within(dialog).getByText("Nhiếp Ảnh")).toBeInTheDocument();
    expect(within(dialog).getByText("user@test.vn")).toBeInTheDocument();

    await userEvent.click(within(dialog).getByRole("button", { name: "Close" }));

    await waitFor(() =>
      expect(
        queryClient.getQueryState(["user-detail-manager", "u1"])?.isInvalidated,
      ).toBe(true),
    );
  });

  it("bans an account and refreshes the table", async () => {
    const requests = listUsers();
    const updates = mockEndpoint("patch", "*/user/:id", {});
    // the edit modal loads the account; it reloads with no account once the modal closes
    const detailIds: string[] = [];
    server.use(
      http.get("*/user/:id", ({ params }) => {
        detailIds.push(String(params.id));
        return HttpResponse.json(params.id === "u1" ? photographer : {});
      }),
    );
    renderWithProviders(<AccountManagerPage />);
    await screen.findByText("Nhiếp Ảnh");

    await openRowMenu("Nhiếp Ảnh", "Cập nhật chỉnh sửa");

    const dialog = await screen.findByRole("dialog");
    expect(
      within(dialog).getByText("Chỉnh sửa thông tin tài khoản"),
    ).toBeInTheDocument();
    const activeToggle = await within(dialog).findByRole("checkbox");
    await waitFor(() => expect(activeToggle).toBeChecked());

    await userEvent.click(activeToggle);
    await userEvent.click(within(dialog).getByText("Lưu chỉnh sửa"));

    expect(await screen.findByText("Cập nhật thành công")).toBeInTheDocument();
    expect(updates).toHaveLength(1);
    expect(updates[0].path).toMatch(/\/user\/u1$/);
    expect(updates[0].json).toEqual({
      enabled: false,
      name: "Nhiếp Ảnh",
      mail: "user@test.vn",
      phonenumber: "0901234567",
      quote: "Xin chào",
      location: "Hà Nội",
    });
    // the table reloads the current page after the update
    await waitFor(() => expect(requests).toHaveLength(2));
    expect(requests[1].query).toEqual({
      limit: "10",
      page: "0",
      orderByCreatedAt: "desc",
    });
    // closing the modal invalidates the account detail, which is still shown and reloads
    await waitFor(() =>
      expect(detailIds.filter((id) => id === "u1")).toHaveLength(2),
    );
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });
});
