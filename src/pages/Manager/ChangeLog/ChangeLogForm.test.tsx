import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { server } from "../../../test/server";
import type { MockInstance } from "vitest";
import { renderWithProviders } from "../../../test/render";
import { mockEndpoint } from "../../../test/mockEndpoint";
import type { Schema } from "../../../apis/types";
import ChangeLogForm from "./ChangeLogForm";

vi.mock("../../../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

// Quill cannot run in jsdom: a textarea that reports its value like the editor does
vi.mock("react-quill", () => ({
  default: ({
    value,
    onChange,
    placeholder,
  }: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
  }) => (
    <textarea
      aria-label="editor"
      placeholder={placeholder}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  ),
}));

const entry: Schema<"ChangeLogDto"> = {
  id: "cl-1",
  version: "1.0.0",
  title: "Ra mắt",
  content: "<p>Nội dung cũ</p>",
  status: "DRAFT",
  publishedAt: null,
  createdAt: "2026-09-15T07:00:00.000Z",
  updatedAt: "2026-09-15T07:00:00.000Z",
};

const versionInput = () => screen.getByPlaceholderText("Ví dụ: 1.2.0");
const titleInput = () => screen.getByPlaceholderText("Tiêu đề bản cập nhật");
const editor = () => screen.getByLabelText("editor");
const statusSelect = () => screen.getByRole("combobox");

describe("ChangeLogForm", () => {
  let consoleError: MockInstance<typeof console.error>;

  beforeEach(() => {
    consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleError.mockRestore();
  });

  it("creates a published entry and resets the form", async () => {
    const requests = mockEndpoint("post", "*/changelog", entry);
    const onSaved = vi.fn();
    const onClose = vi.fn();
    renderWithProviders(<ChangeLogForm onSaved={onSaved} onClose={onClose} />);

    expect(screen.getByText("Tạo bản cập nhật")).toBeInTheDocument();
    await userEvent.type(versionInput(), "1.2.0");
    await userEvent.type(titleInput(), "Tính năng mới");
    await userEvent.selectOptions(statusSelect(), "PUBLISHED");
    await userEvent.type(editor(), "<p>Mới</p>");
    await userEvent.click(screen.getByRole("button", { name: "Tạo mới" }));

    expect(await screen.findByText("Đã tạo thành công")).toBeInTheDocument();
    expect(requests).toHaveLength(1);
    expect(requests[0].json).toEqual({
      version: "1.2.0",
      title: "Tính năng mới",
      status: "PUBLISHED",
      content: "<p>Mới</p>",
    });
    expect(onSaved).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(versionInput()).toHaveValue(""));
    expect(titleInput()).toHaveValue("");
    expect(editor()).toHaveValue("");
    expect(statusSelect()).toHaveValue("DRAFT");
    expect(screen.getByRole("button", { name: "Tạo mới" })).toBeEnabled();
  });

  it("creates a draft without callbacks", async () => {
    const requests = mockEndpoint("post", "*/changelog", entry);
    renderWithProviders(<ChangeLogForm />);

    await userEvent.type(versionInput(), "2.0.0");
    await userEvent.type(titleInput(), "Nháp");
    await userEvent.type(editor(), "x");
    await userEvent.click(screen.getByRole("button", { name: "Tạo mới" }));

    expect(await screen.findByText("Đã tạo thành công")).toBeInTheDocument();
    expect(requests[0].json).toMatchObject({ status: "DRAFT", content: "x" });
  });

  it("edits the given entry and keeps its values", async () => {
    const requests = mockEndpoint("patch", "*/changelog/:id", entry);
    const onSaved = vi.fn();
    const onClose = vi.fn();
    renderWithProviders(
      <ChangeLogForm
        selectedChangeLog={entry}
        onSaved={onSaved}
        onClose={onClose}
      />,
    );

    expect(screen.getByText("Cập nhật nhật ký")).toBeInTheDocument();
    expect(versionInput()).toHaveValue("1.0.0");
    expect(editor()).toHaveValue("<p>Nội dung cũ</p>");
    await userEvent.clear(titleInput());
    await userEvent.type(titleInput(), "Đổi tên");
    await userEvent.click(screen.getByRole("button", { name: "Cập nhật" }));

    expect(await screen.findByText("Đã cập nhật")).toBeInTheDocument();
    expect(requests[0].path).toBe("/changelog/cl-1");
    expect(requests[0].json).toEqual({
      version: "1.0.0",
      title: "Đổi tên",
      status: "DRAFT",
      content: "<p>Nội dung cũ</p>",
    });
    expect(onSaved).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(titleInput()).toHaveValue("Đổi tên");
  });

  it("publishes an edited entry", async () => {
    const requests = mockEndpoint("patch", "*/changelog/:id", entry);
    renderWithProviders(<ChangeLogForm selectedChangeLog={entry} />);

    await userEvent.selectOptions(statusSelect(), "PUBLISHED");
    await userEvent.click(screen.getByRole("button", { name: "Cập nhật" }));

    expect(await screen.findByText("Đã cập nhật")).toBeInTheDocument();
    expect(requests[0].json).toMatchObject({ status: "PUBLISHED" });
  });

  it("shows the validation errors without sending", async () => {
    const requests = mockEndpoint("post", "*/changelog", entry);
    renderWithProviders(<ChangeLogForm />);

    await userEvent.type(titleInput(), "x".repeat(201));
    await userEvent.click(screen.getByRole("button", { name: "Tạo mới" }));

    expect(
      await screen.findByText("Vui lòng nhập phiên bản"),
    ).toBeInTheDocument();
    expect(screen.getByText("Tiêu đề tối đa 200 ký tự")).toBeInTheDocument();

    await userEvent.clear(titleInput());
    await userEvent.type(versionInput(), "1".repeat(51));
    await userEvent.click(screen.getByRole("button", { name: "Tạo mới" }));
    expect(
      await screen.findByText("Phiên bản tối đa 50 ký tự"),
    ).toBeInTheDocument();
    expect(screen.getByText("Vui lòng nhập tiêu đề")).toBeInTheDocument();
    expect(requests).toHaveLength(0);
  });

  it("rejects a status outside the list", async () => {
    renderWithProviders(<ChangeLogForm selectedChangeLog={entry} />);

    // the select falls back to an empty value when given an unknown one
    fireEvent.change(statusSelect(), { target: { value: "ARCHIVED" } });
    await userEvent.click(screen.getByRole("button", { name: "Cập nhật" }));

    expect(
      await screen.findByText(/status must be one of the following values/),
    ).toBeInTheDocument();
  });

  it.each([
    ["empty", ""],
    ["an empty editor paragraph", "<p><br></p>"],
  ])("refuses %s content", async (_case, content) => {
    const requests = mockEndpoint("patch", "*/changelog/:id", entry);
    renderWithProviders(
      <ChangeLogForm selectedChangeLog={{ ...entry, content }} />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Cập nhật" }));

    expect(
      await screen.findByText("Vui lòng nhập nội dung bản cập nhật."),
    ).toBeInTheDocument();
    expect(screen.getByText("Nội dung không hợp lệ")).toBeInTheDocument();
    expect(requests).toHaveLength(0);
  });

  it("reports a failed save and enables the button again", async () => {
    let release = () => {};
    const pending = new Promise<void>((resolve) => {
      release = resolve;
    });
    server.use(
      http.post("*/changelog", async () => {
        await pending;
        return HttpResponse.json({ message: "boom" }, { status: 500 });
      }),
    );
    const onSaved = vi.fn();
    renderWithProviders(<ChangeLogForm onSaved={onSaved} />);

    await userEvent.type(versionInput(), "1.2.0");
    await userEvent.type(titleInput(), "Lỗi");
    await userEvent.type(editor(), "x");
    await userEvent.click(screen.getByRole("button", { name: "Tạo mới" }));

    expect(
      await screen.findByRole("button", { name: "Đang lưu..." }),
    ).toBeDisabled();
    release();

    expect(await screen.findByText("Vui lòng thử lại")).toBeInTheDocument();
    expect(
      await screen.findByRole("button", { name: "Tạo mới" }),
    ).toBeEnabled();
    expect(onSaved).not.toHaveBeenCalled();
    expect(versionInput()).toHaveValue("1.2.0");
    expect(consoleError).toHaveBeenCalledWith(
      expect.objectContaining({ status: 500 }),
    );
  });
});
