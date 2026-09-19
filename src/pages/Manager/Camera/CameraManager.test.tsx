import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Modal } from "antd";
import { act } from "react";
import { HttpResponse } from "msw";
import type { MockInstance } from "vitest";
import { renderWithProviders } from "../../../test/render";
import { mockEndpoint } from "../../../test/mockEndpoint";
import CameraManager from "./CameraManager";
import type { CameraRow } from "./TableCamera";

vi.mock("../../../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

const cameras: CameraRow[] = [
  {
    id: "cam-1",
    name: "Fujifilm X-T5",
    thumbnail: "https://cdn.test/xt5.jpg",
    description: "<b>Mirrorless</b>",
    userCount: 3,
    photoCount: 40,
  },
  {
    id: "cam-2",
    name: "Canon R5",
    thumbnail: "https://cdn.test/r5.jpg",
    description: "Full frame",
    userCount: 8,
    photoCount: 12,
  },
];

const mockList = () =>
  mockEndpoint("get", "*/manager/camera", {
    objects: cameras,
    totalPage: 1,
    totalRecord: cameras.length,
  });

const rowOf = (text: string) => {
  const row = screen.getByText(text).closest("tr");
  if (!row) throw new Error(`no row for ${text}`);
  return row;
};

const namesInOrder = () =>
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

describe("CameraManager", () => {
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

  it("lists the cameras newest first with their usage", async () => {
    const requests = mockList();
    renderWithProviders(<CameraManager />);

    expect(await screen.findByText("Fujifilm X-T5")).toBeInTheDocument();
    expect(requests[0].query).toEqual({
      limit: "9999",
      page: "0",
      orderByCreatedAt: "desc",
    });
    const row = rowOf("Fujifilm X-T5");
    expect(
      within(row).getByAltText("https://cdn.test/xt5.jpg"),
    ).toBeInTheDocument();
    expect(within(row).getByText("Mirrorless").tagName).toBe("B");
    expect(within(row).getByText("3")).toBeInTheDocument();
    expect(within(row).getByText("40")).toBeInTheDocument();
  });

  it("sorts by name, user count and photo count", async () => {
    mockList();
    renderWithProviders(<CameraManager />);
    await screen.findByText("Fujifilm X-T5");

    await userEvent.click(screen.getByText("Tên"));
    expect(namesInOrder()).toEqual(["Canon R5", "Fujifilm X-T5"]);

    await userEvent.click(screen.getByText("Số người sử dụng"));
    expect(namesInOrder()).toEqual(["Fujifilm X-T5", "Canon R5"]);

    await userEvent.click(screen.getByText("Tổng số ảnh"));
    expect(namesInOrder()).toEqual(["Canon R5", "Fujifilm X-T5"]);
  });

  it("reloads on refresh and logs a failed load", async () => {
    const requests = mockList();
    renderWithProviders(<CameraManager />);
    await screen.findByText("Fujifilm X-T5");

    await userEvent.click(screen.getByTitle("Làm mới"));
    await waitFor(() => expect(requests).toHaveLength(2));

    mockEndpoint("get", "*/manager/camera", () =>
      HttpResponse.json({}, { status: 500 }),
    );
    await userEvent.click(screen.getByTitle("Làm mới"));
    await waitFor(() =>
      expect(consoleError).toHaveBeenCalledWith(
        "Error fetching items:",
        expect.anything(),
      ),
    );
  });

  it("edits a camera and reloads the list", async () => {
    const requests = mockList();
    const updated = mockEndpoint("patch", "*/manager/camera/:id", {});
    renderWithProviders(<CameraManager />);
    await screen.findByText("Canon R5");

    await chooseAction("Canon R5", "Cập nhật chỉnh sửa");
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText("Cập nhật camera")).toBeInTheDocument();
    expect(within(dialog).getByPlaceholderText("Tên camera")).toHaveValue(
      "Canon R5",
    );
    await userEvent.click(
      within(dialog).getByRole("button", { name: "Cập nhật" }),
    );

    expect(await screen.findByText("Đã cập nhật")).toBeInTheDocument();
    expect(updated[0].path).toBe("/manager/camera/cam-2");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await waitFor(() => expect(requests).toHaveLength(2));
  });

  it("closes the edit modal", async () => {
    mockList();
    renderWithProviders(<CameraManager />);
    await screen.findByText("Canon R5");

    await chooseAction("Canon R5", "Cập nhật chỉnh sửa");
    const dialog = await screen.findByRole("dialog");
    await userEvent.click(
      within(dialog).getByRole("button", { name: "Close" }),
    );

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("deletes a camera after confirmation", async () => {
    const requests = mockList();
    const deleted = mockEndpoint("delete", "*/manager/camera/:id", {});
    renderWithProviders(<CameraManager />);
    await screen.findByText("Canon R5");

    await chooseAction("Canon R5", "Xóa");
    expect(
      await screen.findByText("Bạn có chắc chắn muốn xóa?"),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Xóa" }));

    expect(await screen.findByText("Đã xóa blog")).toBeInTheDocument();
    expect(deleted[0].path).toBe("/manager/camera/cam-2");
    await waitFor(() => expect(requests).toHaveLength(2));
  });

  it("reports a failed deletion", async () => {
    const requests = mockList();
    mockEndpoint("delete", "*/manager/camera/:id", () =>
      HttpResponse.json({}, { status: 500 }),
    );
    renderWithProviders(<CameraManager />);
    await screen.findByText("Canon R5");

    await chooseAction("Canon R5", "Xóa");
    await userEvent.click(await screen.findByRole("button", { name: "Xóa" }));

    expect(
      await screen.findByText("Lỗi", {
        selector: ".ant-notification-notice-message",
      }),
    ).toBeInTheDocument();
    expect(requests).toHaveLength(1);
  });
});
