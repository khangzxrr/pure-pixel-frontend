import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { renderWithProviders } from "../../test/render";
import { server } from "../../test/server";
import ReportBookingModal from "./ReportBookingModal";

vi.mock("../../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

const captureReport = (status = 201) => {
  const bodies: unknown[] = [];
  server.use(
    http.post("*/user/report", async ({ request }) => {
      bodies.push(await request.json());
      return status < 400
        ? HttpResponse.json({ id: "r1" }, { status })
        : new HttpResponse(null, { status });
    }),
  );
  return bodies;
};

const DETAILS = "Nhập tin nhắn của bạn ở đây.";

describe("ReportBookingModal", () => {
  it.each([
    ["not visible", false, "b1"],
    ["missing the booking id", true, ""],
  ])("stays closed when %s", (_case, visible, id) => {
    renderWithProviders(
      <ReportBookingModal
        visible={visible}
        onClose={vi.fn()}
        id={id}
        reportType="BOOKING"
      />,
    );

    expect(screen.queryByText("Cảnh báo")).toBeNull();
  });

  it("reports the reason with details and closes", async () => {
    const bodies = captureReport();
    const onClose = vi.fn();
    renderWithProviders(
      <ReportBookingModal visible onClose={onClose} id="b1" reportType="BOOKING" />,
    );

    expect(screen.getByText("Cảnh báo")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Gửi báo cáo" })).toBeDisabled();

    await userEvent.click(screen.getByLabelText("Vi phạm bản quyền"));
    await userEvent.type(screen.getByPlaceholderText(DETAILS), "dùng ảnh của tôi");
    await userEvent.click(screen.getByRole("button", { name: "Gửi báo cáo" }));

    expect(
      await screen.findByText("Báo cáo gói chụp này thành công"),
    ).toBeInTheDocument();
    expect(bodies).toEqual([
      {
        content: "Vi phạm bản quyền: dùng ảnh của tôi",
        reportType: "BOOKING",
        referenceId: "b1",
      },
    ]);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.getByLabelText("Vi phạm bản quyền")).not.toBeChecked();
    expect(screen.getByPlaceholderText(DETAILS)).toHaveValue("");
  });

  it("sends only the reason when there are no details", async () => {
    const bodies = captureReport();
    renderWithProviders(
      <ReportBookingModal
        visible
        onClose={vi.fn()}
        id="b2"
        reportType="BOOKING_PHOTOGRAPHER_REPORT_USER"
      />,
    );

    await userEvent.click(screen.getByLabelText("Chưa xử lý"));
    await userEvent.click(screen.getByRole("button", { name: "Gửi báo cáo" }));

    await waitFor(() => expect(bodies).toHaveLength(1));
    expect(bodies[0]).toEqual({
      content: "Chưa xử lý",
      reportType: "BOOKING_PHOTOGRAPHER_REPORT_USER",
      referenceId: "b2",
    });
    await screen.findByText("Báo cáo gói chụp này thành công");
  });

  it("warns and stays open when reporting fails", async () => {
    captureReport(500);
    const onClose = vi.fn();
    renderWithProviders(
      <ReportBookingModal visible onClose={onClose} id="b1" reportType="BOOKING" />,
    );

    await userEvent.click(screen.getByLabelText("Tài khoản giả mạo"));
    await userEvent.click(screen.getByRole("button", { name: "Gửi báo cáo" }));

    expect(await screen.findByText("Báo cáo gói chụp thất bại")).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Tài khoản giả mạo")).toBeChecked();
  });

  it("closes from the close button", async () => {
    const onClose = vi.fn();
    renderWithProviders(
      <ReportBookingModal visible onClose={onClose} id="b1" reportType="BOOKING" />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Close" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
