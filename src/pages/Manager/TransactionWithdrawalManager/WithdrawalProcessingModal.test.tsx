import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import type { MockInstance } from "vitest";
import { renderWithProviders } from "../../../test/render";
import { server } from "../../../test/server";
import { mockEndpoint } from "../../../test/mockEndpoint";
import PhotoService from "../../../services/PhotoService";
import WithdrawalProcessingModal from "./WithdrawalProcessingModal";
import { user, withdrawal } from "./withdrawalFixtures.test.data";

vi.mock("../../../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

const ACCEPT = "*/manager/transaction/t1/withdrawal/accept";
const DENY = "*/manager/transaction/t1/withdrawal/deny";
const CONFIRM_TITLE =
  "Bạn có chắc chắn muốn xác nhận chuyển tiền cho người dùng này?";

const setup = () => {
  const tableRef = vi.fn();
  const onClose = vi.fn();
  const view = renderWithProviders(
    <WithdrawalProcessingModal
      selectedData={withdrawal()}
      tableRef={tableRef}
      onClose={onClose}
    />,
  );
  return { ...view, tableRef, onClose };
};

// a response the test releases when it is ready
const gate = () => {
  let release = () => {};
  const released = new Promise<void>((resolve) => {
    release = resolve;
  });
  return { released, release };
};

const pickEvidence = async (container: HTMLElement) => {
  // antd also posts the picked file to its (empty) upload action
  server.use(http.post("*", () => HttpResponse.json({})));
  const input = container.querySelector<HTMLInputElement>('input[type="file"]');
  await userEvent.upload(
    input as HTMLInputElement,
    new File(["img"], "evidence.jpg", { type: "image/jpeg" }),
  );
};

const openDeny = () =>
  userEvent.click(screen.getByRole("button", { name: "Hủy yêu cầu rút tiền" }));

describe("WithdrawalProcessingModal", () => {
  let consoleLog: MockInstance<typeof console.log>;
  let consoleError: MockInstance<typeof console.error>;

  beforeEach(() => {
    // the deny handler logs its payload and both handlers log failures
    consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});
    consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows the request, the balance left and the amount", () => {
    setup();

    expect(screen.getByText("ID rút tiền: t1")).toBeInTheDocument();
    expect(screen.getByText("Nguyễn Văn A")).toBeInTheDocument();
    expect(
      screen.getByAltText("https://cdn.test/avatar-a.jpg"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(`${(250000).toLocaleString()}đ`),
    ).toBeInTheDocument();
    expect(
      screen.getByText(`Số tiền: ${(1500000).toLocaleString()}đ`),
    ).toBeInTheDocument();
    expect(screen.getByText("10:30 / 15-09-2026")).toBeInTheDocument();
    expect(screen.getByText("Vietcombank")).toBeInTheDocument();
    expect(screen.getByText("NGUYEN VAN A")).toBeInTheDocument();
    expect(screen.getByText("0123456789")).toBeInTheDocument();
  });

  it("accepts only after the transfer evidence is picked", async () => {
    const { container, tableRef, onClose } = setup();
    const requests = mockEndpoint("patch", ACCEPT, {});
    const confirm = screen.getByRole("button", { name: "Xác nhận chuyển tiền" });

    expect(confirm).toHaveClass("bg-gray-500");
    await userEvent.click(confirm);
    expect(screen.queryByText(CONFIRM_TITLE)).toBeNull();

    await pickEvidence(container);
    expect(await screen.findByAltText("Thumbnail")).toHaveAttribute(
      "src",
      "blob:mock",
    );
    expect(confirm).toHaveClass("bg-green-500");

    await userEvent.click(confirm);
    await screen.findByText(CONFIRM_TITLE);
    await userEvent.click(screen.getByRole("button", { name: "Đồng ý" }));

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(tableRef).toHaveBeenCalledTimes(1);
    expect(requests).toHaveLength(1);
    expect(requests[0].method).toBe("PATCH");
    expect(requests[0].path).toBe("/manager/transaction/t1/withdrawal/accept");
    expect((requests[0].form?.get("photo") as File).name).toBe("evidence.jpg");
  });

  it("greys out the actions while the transfer is being confirmed", async () => {
    const { container, tableRef } = setup();
    const { released, release } = gate();
    server.use(
      http.patch(ACCEPT, async () => {
        await released;
        return HttpResponse.json({});
      }),
    );

    await pickEvidence(container);
    await screen.findByAltText("Thumbnail");
    await userEvent.click(
      screen.getByRole("button", { name: "Xác nhận chuyển tiền" }),
    );
    await userEvent.click(await screen.findByRole("button", { name: "Đồng ý" }));

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Hủy yêu cầu rút tiền" }),
      ).toHaveClass("bg-gray-500"),
    );
    expect(
      screen.getByRole("button", { name: "Xác nhận chuyển tiền" }),
    ).toHaveClass("cursor-not-allowed");

    release();
    await waitFor(() => expect(tableRef).toHaveBeenCalledTimes(1));
  });

  it("logs a failed transfer confirmation and keeps the dialog open", async () => {
    const { container, tableRef, onClose } = setup();
    server.use(
      http.patch(ACCEPT, () => new HttpResponse(null, { status: 500 })),
    );

    await pickEvidence(container);
    await screen.findByAltText("Thumbnail");
    await userEvent.click(
      screen.getByRole("button", { name: "Xác nhận chuyển tiền" }),
    );
    await userEvent.click(await screen.findByRole("button", { name: "Đồng ý" }));

    await waitFor(() =>
      expect(consoleError).toHaveBeenCalledWith(
        "Error during withdrawal:",
        expect.anything(),
      ),
    );
    expect(tableRef).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("logs evidence that cannot be previewed", async () => {
    const unreadable = new Error("unreadable");
    vi.spyOn(PhotoService, "convertArrayBufferToObjectUrl").mockRejectedValue(
      unreadable,
    );
    const { container } = setup();

    await pickEvidence(container);

    await waitFor(() => expect(consoleLog).toHaveBeenCalledWith(unreadable));
    expect(screen.queryByAltText("Thumbnail")).toBeNull();
    expect(
      screen.getByRole("button", { name: "Xác nhận chuyển tiền" }),
    ).toHaveClass("bg-gray-500");
  });

  it("denies with the chosen reason and details, then refreshes the table", async () => {
    const { tableRef, onClose } = setup();
    const requests = mockEndpoint("patch", DENY, {});

    await openDeny();
    const send = screen.getByRole("button", { name: "Gửi báo cáo" });
    expect(send).toBeDisabled();

    await userEvent.click(screen.getByText("Tài khoản giả mạo"));
    expect(screen.getByText("Tài khoản giả mạo").closest("label")).toHaveClass(
      "border-blue-500",
    );
    expect(screen.getByText("Khác").closest("label")).toHaveClass(
      "border-gray-300",
    );
    await userEvent.type(
      screen.getByPlaceholderText("Nhập thông tin cung cấp thêm tại đây"),
      "Sai chủ tài khoản",
    );
    expect(send).toBeEnabled();
    await userEvent.click(send);

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(2));
    // once from the mutation's onSuccess and once after it resolves
    expect(tableRef).toHaveBeenCalledTimes(2);
    expect(requests).toEqual([
      expect.objectContaining({
        method: "PATCH",
        path: "/manager/transaction/t1/withdrawal/deny",
        json: { failReason: "Tài khoản giả mạo: Sai chủ tài khoản" },
      }),
    ]);
    expect(consoleLog).toHaveBeenCalledWith(
      "t1",
      "Tài khoản giả mạo: Sai chủ tài khoản",
    );
  });

  it("denies with the reason alone and blocks resending while pending", async () => {
    const { tableRef } = setup();
    const { released, release } = gate();
    const bodies: unknown[] = [];
    server.use(
      http.patch(DENY, async ({ request }) => {
        bodies.push(await request.json());
        await released;
        return HttpResponse.json({});
      }),
    );

    await openDeny();
    await userEvent.click(screen.getByText("Khác"));
    await userEvent.click(screen.getByRole("button", { name: "Gửi báo cáo" }));

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Gửi báo cáo" })).toBeDisabled(),
    );
    expect(screen.getByRole("button", { name: "Gửi báo cáo" })).toHaveClass(
      "bg-gray-300",
    );

    release();
    await waitFor(() => expect(tableRef).toHaveBeenCalledTimes(2));
    expect(bodies).toEqual([{ failReason: "Khác" }]);
  });

  it("logs a failed denial", async () => {
    const { tableRef, onClose } = setup();
    server.use(http.patch(DENY, () => new HttpResponse(null, { status: 500 })));

    await openDeny();
    await userEvent.click(screen.getByText("Số tiền không hợp lệ"));
    await userEvent.click(screen.getByRole("button", { name: "Gửi báo cáo" }));

    await waitFor(() =>
      expect(consoleError).toHaveBeenCalledWith(
        "Error during withdrawal denial:",
        expect.anything(),
      ),
    );
    expect(tableRef).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("goes back from the deny form to the request", async () => {
    renderWithProviders(
      <WithdrawalProcessingModal
        selectedData={withdrawal({ user: user({ name: "Trần Thị B" }) })}
        tableRef={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    await openDeny();
    const back = screen.getByText("Lý do hủy yêu cầu rút tiền")
      .previousElementSibling as Element;
    await userEvent.click(back);

    expect(screen.getByText("Trần Thị B")).toBeInTheDocument();
    expect(screen.queryByText("Lý do hủy yêu cầu rút tiền")).toBeNull();
  });
});
