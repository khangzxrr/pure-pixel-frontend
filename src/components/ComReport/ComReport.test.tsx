import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { message } from "antd";
import { http, HttpResponse } from "msw";
import type { MockInstance } from "vitest";
import { server } from "../../test/server";
import ComReport from "./ComReport";

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

describe("ComReport", () => {
  let success: MockInstance<typeof message.success>;
  let error: MockInstance<typeof message.error>;

  beforeEach(() => {
    // antd's static message API is asserted directly
    success = vi
      .spyOn(message, "success")
      .mockImplementation((() => undefined) as unknown as typeof message.success);
    error = vi
      .spyOn(message, "error")
      .mockImplementation((() => undefined) as unknown as typeof message.error);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("uses the default title and waits for a reason", () => {
    render(<ComReport onclose={vi.fn()} id="p1" reportType="PHOTO" />);

    expect(screen.getByRole("heading", { name: "Báo cáo" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Gửi báo cáo" })).toBeDisabled();
    expect(screen.getAllByRole("radio")).toHaveLength(6);
  });

  it("goes back without reporting", async () => {
    const onclose = vi.fn();
    render(
      <ComReport onclose={onclose} tile="Báo cáo bài viết" id="p1" reportType="PHOTO" />,
    );

    expect(screen.getByRole("heading", { name: "Báo cáo bài viết" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Back" }));

    expect(onclose).toHaveBeenCalledTimes(1);
  });

  it("sends the reason and details, then resets the form", async () => {
    const bodies = captureReport();
    const onclose = vi.fn();
    render(<ComReport onclose={onclose} id="p1" reportType="PHOTO" />);

    await userEvent.click(screen.getByLabelText("Spam"));
    expect(screen.getByLabelText("Spam")).toBeChecked();
    expect(screen.getByRole("button", { name: "Gửi báo cáo" })).toBeEnabled();
    await userEvent.type(
      screen.getByPlaceholderText("Nhập tin nhắn của bạn ở đây."),
      "quảng cáo",
    );
    await userEvent.click(screen.getByRole("button", { name: "Gửi báo cáo" }));

    await waitFor(() => expect(onclose).toHaveBeenCalledTimes(1));
    expect(bodies).toEqual([
      { content: "spam quảng cáo", reportType: "PHOTO", referenceId: "p1" },
    ]);
    expect(success).toHaveBeenCalledWith("Báo cáo thành công");
    expect(screen.getByLabelText("Spam")).not.toBeChecked();
    expect(screen.getByPlaceholderText("Nhập tin nhắn của bạn ở đây.")).toHaveValue("");
  });

  it("reports an error and keeps the form when sending fails", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    const bodies = captureReport(500);
    const onclose = vi.fn();
    render(<ComReport onclose={onclose} id="u1" reportType="USER" />);

    await userEvent.click(screen.getByLabelText("Khác"));
    await userEvent.click(screen.getByRole("button", { name: "Gửi báo cáo" }));

    await waitFor(() => expect(error).toHaveBeenCalledWith("Lỗi"));
    expect(bodies).toEqual([
      { content: "Khác ", reportType: "USER", referenceId: "u1" },
    ]);
    expect(log).toHaveBeenCalledTimes(1);
    expect(onclose).not.toHaveBeenCalled();
    expect(success).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Khác")).toBeChecked();
  });
});
