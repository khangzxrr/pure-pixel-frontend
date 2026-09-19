import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse } from "msw";
import type { QueryClient } from "@tanstack/react-query";
import { createTestQueryClient, renderWithProviders } from "../../test/render";
import { mockEndpoint } from "../../test/mockEndpoint";
import DropdownSeller from "./DropdownSeller";

vi.mock("../../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

vi.mock("./PhotoManagementModal", () => ({
  default: ({
    id,
    close,
  }: {
    id: string;
    close: () => void;
  }) => (
    <div>
      <p>photo-management-{id}</p>
      <button onClick={close}>close edit modal</button>
    </div>
  ),
}));

const photo = {
  id: "photo-1",
  title: "Sunset",
};

const openMenu = async (container: HTMLElement) => {
  const trigger = container.querySelector("svg")?.parentElement;
  if (!trigger) throw new Error("dropdown trigger not found");
  await userEvent.click(trigger);
};

const renderDropdown = (queryClient?: QueryClient, callData = vi.fn()) =>
  renderWithProviders(<DropdownSeller photo={photo} callData={callData} />, {
    queryClient,
  });

describe("DropdownSeller", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("opens the edit modal from the dropdown menu", async () => {
    const { container } = renderDropdown();

    await openMenu(container);
    await userEvent.click(await screen.findByText("Chỉnh sửa"));

    expect(await screen.findByText("photo-management-photo-1")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "close edit modal" }));
    await waitFor(() =>
      expect(screen.queryByText("photo-management-photo-1")).toBeNull(),
    );
  });

  it("stops selling a photo and refreshes the list", async () => {
    const requests = mockEndpoint("post", "*/photo/:id/stop-selling", {});
    const callData = vi.fn();
    const queryClient = createTestQueryClient();
    const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries");
    const { container } = renderDropdown(queryClient, callData);

    await openMenu(container);
    await userEvent.click(await screen.findByText("Ngừng bán ảnh"));
    expect(
      await screen.findByText("Bạn có chắc muốn ngưng bán ảnh này không?"),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Xóa" }));

    expect(await screen.findByText("Ngưng bán thành công")).toBeInTheDocument();
    expect(requests[0].path).toBe("/photo/photo-1/stop-selling");
    expect(callData).toHaveBeenCalledTimes(1);
    expect(invalidateQueries).toHaveBeenCalledWith("my-photo");
  });

  it("shows an error notification when stop selling fails", async () => {
    mockEndpoint("post", "*/photo/:id/stop-selling", () =>
      HttpResponse.json({}, { status: 500 }),
    );
    const callData = vi.fn();
    const { container } = renderDropdown(undefined, callData);

    await openMenu(container);
    await userEvent.click(await screen.findByText("Ngừng bán ảnh"));
    await userEvent.click(await screen.findByRole("button", { name: "Xóa" }));

    expect(await screen.findByText("Thao tác thất bại")).toBeInTheDocument();
    expect(
      screen.getByText("Ngưng bán ảnh thất bại, vui lòng thử lại sau"),
    ).toBeInTheDocument();
    expect(callData).not.toHaveBeenCalled();
  });
});
