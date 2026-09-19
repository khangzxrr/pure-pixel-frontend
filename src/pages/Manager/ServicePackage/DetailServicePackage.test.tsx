import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse } from "msw";
import { renderWithProviders } from "../../../test/render";
import { mockEndpoint } from "../../../test/mockEndpoint";
import DetailServicePackage from "./DetailServicePackage";
import { servicePackage } from "./servicePackageFixtures.test.data";
import type { ServicePackageRow } from "./TableServicePackage";
import {
  user,
  vnd,
} from "../TransactionWithdrawalManager/withdrawalFixtures.test.data";

vi.mock("../../../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

const renderDetail = (selected: ServicePackageRow) => {
  const reload = vi.fn();
  renderWithProviders(<DetailServicePackage selected={selected} reload={reload} />);
  return { reload };
};

const valueOf = (label: string) =>
  screen.getByText(label).nextElementSibling as HTMLElement;

const description = () =>
  document.querySelector(".ant-notification-notice-description");

describe("DetailServicePackage", () => {
  it("shows the package, its price in VND, owner and creation date", () => {
    renderDetail(servicePackage());

    expect(valueOf("Tên gói:")).toHaveTextContent("Chụp cưới");
    expect(valueOf("Số tiền:").textContent).toBe(vnd(5000000));
    // the detail prints the description as text, markup included
    expect(valueOf("Nội dung:")).toHaveTextContent(
      "<p>Trọn gói <b>ngày cưới</b></p>",
    );
    expect(valueOf("Người sở hữu:")).toHaveTextContent("Nguyễn Văn A");
    expect(
      screen.getByAltText("https://cdn.test/avatar-a.jpg"),
    ).toBeInTheDocument();
    expect(valueOf("Ngày tạo:")).toHaveTextContent("10:30 / 15-09-2026");
    expect(
      valueOf("Hình ảnh:").querySelector("img.ant-image-img"),
    ).toHaveAttribute("src", "https://cdn.test/sp1.jpg");
  });

  it("locks an enabled package", async () => {
    const requests = mockEndpoint(
      "post",
      "*/manager/photoshoot-package/sp1/disable",
      {},
    );
    const { reload } = renderDetail(servicePackage({ status: "ENABLED" }));

    await userEvent.click(screen.getByRole("button", { name: /Khóa gói dịch vụ/ }));

    expect(reload).toHaveBeenCalledTimes(1);
    expect(
      await screen.findByRole("button", { name: /Đã khóa gói dịch vụ/ }),
    ).toBeInTheDocument();
    expect(screen.getByText("Đã khóa")).toBeInTheDocument();
    expect(requests).toEqual([
      expect.objectContaining({
        method: "POST",
        path: "/manager/photoshoot-package/sp1/disable",
      }),
    ]);
  });

  it("shows the server message when locking fails", async () => {
    mockEndpoint("post", "*/manager/photoshoot-package/sp1/disable", () =>
      HttpResponse.json({ message: "Gói đang có lịch hẹn" }, { status: 400 }),
    );
    renderDetail(servicePackage({ status: "ENABLED" }));

    await userEvent.click(screen.getByRole("button", { name: /Khóa gói dịch vụ/ }));

    expect(await screen.findByText("Khóa thất bạt")).toBeInTheDocument();
    expect(description()).toHaveTextContent("Gói đang có lịch hẹn");
    expect(
      screen.getByRole("button", { name: /^Khóa gói dịch vụ/ }),
    ).toBeInTheDocument();
  });

  it("unlocks a disabled package", async () => {
    const requests = mockEndpoint(
      "post",
      "*/manager/photoshoot-package/sp1/enable",
      {},
    );
    const { reload } = renderDetail(servicePackage({ status: "DISABLED" }));

    await userEvent.click(
      screen.getByRole("button", { name: /Đã khóa gói dịch vụ/ }),
    );

    expect(await screen.findByText("Đã mở khóa")).toBeInTheDocument();
    expect(description()).toHaveTextContent("Đã mở khóa gói dịch vụ");
    expect(
      screen.getByRole("button", { name: /^Khóa gói dịch vụ/ }),
    ).toBeInTheDocument();
    expect(reload).toHaveBeenCalledTimes(1);
    expect(requests).toHaveLength(1);
  });

  it("reports a failed unlock without a server message", async () => {
    mockEndpoint(
      "post",
      "*/manager/photoshoot-package/sp1/enable",
      () => new HttpResponse(null, { status: 500 }),
    );
    renderDetail(
      servicePackage({ status: "DISABLED", user: user({ avatar: "" }) }),
    );

    expect(screen.queryByAltText("https://cdn.test/avatar-a.jpg")).toBeNull();
    await userEvent.click(
      screen.getByRole("button", { name: /Đã khóa gói dịch vụ/ }),
    );

    expect(await screen.findByText("Khóa thất bại")).toBeInTheDocument();
    await waitFor(() => expect(description()).toHaveTextContent(""));
  });

  it("leaves a missing price blank", () => {
    renderDetail({
      ...servicePackage(),
      price: undefined as unknown as number,
    });

    expect(valueOf("Số tiền:").textContent).toBe("");
  });
});
