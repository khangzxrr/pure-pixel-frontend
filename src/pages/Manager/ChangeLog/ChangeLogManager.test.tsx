import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Modal } from "antd";
import { act } from "react";
import { HttpResponse } from "msw";
import type { MockInstance } from "vitest";
import { renderWithProviders } from "../../../test/render";
import { mockEndpoint } from "../../../test/mockEndpoint";
import type { Schema } from "../../../apis/types";
import ChangeLogManager from "./ChangeLogManager";

vi.mock("../../../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

vi.mock("react-quill", () => ({
  default: ({
    value,
    onChange,
  }: {
    value: string;
    onChange: (value: string) => void;
  }) => (
    <textarea
      aria-label="editor"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  ),
}));

type ChangeLogEntry = Schema<"ChangeLogDto">;

const entry = (overrides: Partial<ChangeLogEntry>): ChangeLogEntry => ({
  id: "cl-1",
  version: "1.0.0",
  title: "Ra mắt",
  content: "<p>Nội dung một</p>",
  status: "PUBLISHED",
  publishedAt: new Date(2026, 8, 15, 8, 30).toISOString(),
  createdAt: "2026-09-15T07:00:00.000Z",
  updatedAt: "2026-09-15T07:00:00.000Z",
  ...overrides,
});

const entries = [
  entry({}),
  entry({
    id: "cl-2",
    version: "0.9.0",
    title: "Bản thử",
    content: "<p>Nội dung hai</p>",
    status: "DRAFT",
    publishedAt: null,
  }),
];

const mockList = (objects: ChangeLogEntry[] = entries) =>
  mockEndpoint("get", "*/changelog/manage", {
    objects,
    totalPage: 1,
    totalRecord: objects.length,
  });

const rowOf = (text: string) => {
  const row = screen.getByText(text).closest("tr");
  if (!row) throw new Error(`no row for ${text}`);
  return row;
};

const versionsInOrder = () =>
  screen
    .getAllByRole("row")
    .map((row) => row.querySelector("td")?.textContent)
    .filter(Boolean);

const chooseAction = async (rowText: string, action: string) => {
  await userEvent.click(
    within(rowOf(rowText)).getByRole("button", { name: "ellipsis" }),
  );
  await userEvent.click(await screen.findByText(action));
};

describe("ChangeLogManager", () => {
  let consoleError: MockInstance<typeof console.error>;
  let consoleLog: MockInstance<typeof console.log>;

  beforeEach(() => {
    consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    act(() => Modal.destroyAll());
    // antd warns about the deprecated Dropdown/Menu APIs the shared menu uses
    const unexpected = consoleError.mock.calls
      .map(([message]) => String(message))
      .filter(
        (message) =>
          !message.includes("deprecated") &&
          !message.includes("Error fetching items:"),
      );
    expect(unexpected).toEqual([]);
    consoleError.mockRestore();
    consoleLog.mockRestore();
  });

  it("lists every entry with its status and publish date", async () => {
    const requests = mockList();
    renderWithProviders(<ChangeLogManager />);

    expect(await screen.findByText("Ra mắt")).toBeInTheDocument();
    expect(requests[0].query).toEqual({ limit: "9999", page: "0" });
    expect(within(rowOf("Ra mắt")).getByText("Công khai")).toBeInTheDocument();
    expect(
      within(rowOf("Ra mắt")).getByText("15/09/2026 08:30"),
    ).toBeInTheDocument();
    expect(within(rowOf("Bản thử")).getByText("Bản nháp")).toBeInTheDocument();
    expect(within(rowOf("Bản thử")).getByText("—")).toBeInTheDocument();
    expect(screen.getByText("Nội dung hai")).toBeInTheDocument();
  });

  it("sorts by version, title and publish date and filters by status", async () => {
    mockList();
    renderWithProviders(<ChangeLogManager />);
    await screen.findByText("Ra mắt");

    await userEvent.click(screen.getByText("Phiên bản"));
    expect(versionsInOrder()).toEqual(["0.9.0", "1.0.0"]);

    await userEvent.click(screen.getByText("Tiêu đề"));
    expect(versionsInOrder()).toEqual(["0.9.0", "1.0.0"]);

    await userEvent.click(screen.getByText("Ngày công khai"));
    expect(versionsInOrder()).toEqual(["0.9.0", "1.0.0"]);

    await userEvent.click(screen.getByLabelText("filter"));
    await userEvent.click(
      await screen.findByRole("menuitem", { name: "Công khai" }),
    );
    await userEvent.click(screen.getByRole("button", { name: "Đồng ý" }));
    await waitFor(() => expect(screen.queryByText("Bản thử")).toBeNull());
    expect(screen.getByText("Ra mắt")).toBeInTheDocument();
  });

  it("logs a failed load", async () => {
    mockEndpoint("get", "*/changelog/manage", () =>
      HttpResponse.json({}, { status: 500 }),
    );
    renderWithProviders(<ChangeLogManager />);

    await waitFor(() =>
      expect(consoleError).toHaveBeenCalledWith(
        "Error fetching items:",
        expect.anything(),
      ),
    );
    expect(screen.queryByText("Ra mắt")).toBeNull();
  });

  it("creates an entry from the modal and reloads the list", async () => {
    const lists = mockList();
    const created = mockEndpoint("post", "*/changelog", entries[0]);
    renderWithProviders(<ChangeLogManager />);
    await screen.findByText("Ra mắt");

    await userEvent.click(
      screen.getByRole("button", { name: "+ Tạo bản cập nhật" }),
    );
    const dialog = await screen.findByRole("dialog");
    await userEvent.type(
      within(dialog).getByPlaceholderText("Ví dụ: 1.2.0"),
      "1.1.0",
    );
    await userEvent.type(
      within(dialog).getByPlaceholderText("Tiêu đề bản cập nhật"),
      "Sửa lỗi",
    );
    await userEvent.type(within(dialog).getByLabelText("editor"), "<p>a</p>");
    await userEvent.click(
      within(dialog).getByRole("button", { name: "Tạo mới" }),
    );

    expect(await screen.findByText("Đã tạo thành công")).toBeInTheDocument();
    expect(created[0].json).toEqual({
      version: "1.1.0",
      title: "Sửa lỗi",
      status: "DRAFT",
      content: "<p>a</p>",
    });
    await waitFor(() => expect(lists).toHaveLength(2));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("edits an entry from the row menu and reloads the list", async () => {
    const lists = mockList();
    const updated = mockEndpoint("patch", "*/changelog/:id", entries[1]);
    renderWithProviders(<ChangeLogManager />);
    await screen.findByText("Bản thử");

    await chooseAction("Bản thử", "Cập nhật chỉnh sửa");
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText("Cập nhật nhật ký")).toBeInTheDocument();
    expect(within(dialog).getByPlaceholderText("Ví dụ: 1.2.0")).toHaveValue(
      "0.9.0",
    );
    await userEvent.selectOptions(
      within(dialog).getByRole("combobox"),
      "PUBLISHED",
    );
    await userEvent.click(
      within(dialog).getByRole("button", { name: "Cập nhật" }),
    );

    expect(await screen.findByText("Đã cập nhật")).toBeInTheDocument();
    expect(updated[0].path).toBe("/changelog/cl-2");
    expect(updated[0].json).toEqual({
      version: "0.9.0",
      title: "Bản thử",
      status: "PUBLISHED",
      content: "<p>Nội dung hai</p>",
    });
    await waitFor(() => expect(lists).toHaveLength(2));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("closes the edit modal without saving", async () => {
    mockList();
    renderWithProviders(<ChangeLogManager />);
    await screen.findByText("Ra mắt");

    await chooseAction("Ra mắt", "Cập nhật chỉnh sửa");
    const dialog = await screen.findByRole("dialog");
    await userEvent.click(
      within(dialog).getByRole("button", { name: "Close" }),
    );

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("deletes an entry after confirmation and reloads the list", async () => {
    const lists = mockList();
    const deleted = mockEndpoint("delete", "*/changelog/:id", {});
    renderWithProviders(<ChangeLogManager />);
    await screen.findByText("Ra mắt");

    await chooseAction("Ra mắt", "Xóa");
    expect(
      await screen.findByText("Bạn có chắc chắn muốn xóa?"),
    ).toBeInTheDocument();
    expect(deleted).toHaveLength(0);
    await userEvent.click(screen.getByRole("button", { name: "Xóa" }));

    expect(await screen.findByText("Đã xóa bản cập nhật")).toBeInTheDocument();
    expect(deleted[0].path).toBe("/changelog/cl-1");
    await waitFor(() => expect(lists).toHaveLength(2));
  });

  it("keeps the entry when the deletion is cancelled", async () => {
    mockList();
    const deleted = mockEndpoint("delete", "*/changelog/:id", {});
    renderWithProviders(<ChangeLogManager />);
    await screen.findByText("Ra mắt");

    await chooseAction("Ra mắt", "Xóa");
    await userEvent.click(await screen.findByRole("button", { name: "Hủy" }));

    await waitFor(() =>
      expect(screen.queryByText("Bạn có chắc chắn muốn xóa?")).toBeNull(),
    );
    expect(deleted).toHaveLength(0);
  });

  it("reports a failed deletion", async () => {
    const lists = mockList();
    mockEndpoint("delete", "*/changelog/:id", () =>
      HttpResponse.json({}, { status: 500 }),
    );
    renderWithProviders(<ChangeLogManager />);
    await screen.findByText("Ra mắt");

    await chooseAction("Ra mắt", "Xóa");
    await userEvent.click(await screen.findByRole("button", { name: "Xóa" }));

    expect(
      await screen.findByText("Lỗi", {
        selector: ".ant-notification-notice-message",
      }),
    ).toBeInTheDocument();
    expect(lists).toHaveLength(1);
  });
});
