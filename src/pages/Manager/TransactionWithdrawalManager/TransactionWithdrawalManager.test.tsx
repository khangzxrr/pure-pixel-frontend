import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse } from "msw";
import type { MockInstance } from "vitest";
import { renderWithProviders } from "../../../test/render";
import { mockEndpoint } from "../../../test/mockEndpoint";
import TransactionWithdrawalManager from "./TransactionWithdrawalManager";
import type { WithdrawalTransaction } from "./TableTransactionWithdrawal";
import { user, vnd, withdrawal } from "./withdrawalFixtures.test.data";

vi.mock("../../../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

const pending = withdrawal({ id: "t1", status: "PENDING" });
const success = withdrawal({
  id: "t2",
  status: "SUCCESS",
  amount: 300000,
  user: user({ id: "u2", name: "Trần Thị B", avatar: "" }),
  createdAt: new Date(2026, 8, 14, 9, 0).toISOString(),
  wallet: undefined,
});
const cancelled = withdrawal({
  id: "t3",
  status: "CANCEL",
  amount: 800000,
  user: user({ id: "u3", name: "Lê Văn C" }),
  createdAt: new Date(2026, 8, 13, 8, 0).toISOString(),
});

const list = (objects: WithdrawalTransaction[]) => ({
  objects,
  totalRecord: objects.length,
  totalPage: 1,
});

// Testing Library collapses the no-break space of the formatted currency
const money = (amount: number) => vnd(amount).replace(/\s/g, " ");

// the table starts loading half a second after mounting
const LOAD = { timeout: 3000 };

const unauthorized = () => new HttpResponse(null, { status: 401 });

const rowOf = (name: string) => screen.getByText(name).closest("tr") as HTMLElement;

const names = () =>
  screen
    .getAllByRole("row")
    .map((row) => within(row).queryByText(/Nguyễn|Trần|Lê/)?.textContent)
    .filter(Boolean);

const openDetails = async (name: string) => {
  await userEvent.click(within(rowOf(name)).getByRole("button", { name: "ellipsis" }));
  await userEvent.click(await screen.findByText("Chi tiết"));
};

describe("TransactionWithdrawalManager", () => {
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

  it("lists withdrawals with VND amounts and the wallet totals", async () => {
    const requests = mockEndpoint(
      "get",
      "*/manager/transaction",
      list([pending, success, cancelled]),
    );
    const balance = mockEndpoint("get", "*/admin/dashboard/balance", {
      totalBalance: 5000000,
      totalWithdrawal: 1200000,
    });
    renderWithProviders(<TransactionWithdrawalManager />);

    expect(await screen.findByText("Nguyễn Văn A", {}, LOAD)).toBeInTheDocument();
    expect(requests[0].query).toEqual({
      limit: "9999",
      page: "0",
      types: "WITHDRAWAL",
      orderByCreatedAt: "desc",
    });
    expect(balance).toHaveLength(1);
    expect(
      await screen.findByText(
        new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        })
          .format(5000000)
          .replace(/\s/g, " "),
      ),
    ).toBeInTheDocument();

    const first = within(rowOf("Nguyễn Văn A"));
    expect(first.getByText(money(1500000))).toBeInTheDocument();
    expect(first.getByText(money(250000))).toBeInTheDocument();
    expect(first.getByText("10:30 / 15-09-2026")).toBeInTheDocument();
    expect(first.getByText("◔ Đang chờ")).toBeInTheDocument();
    expect(first.getByText(money(1500000))).toHaveTextContent(/^1\.500\.000\s₫$/);

    const second = within(rowOf("Trần Thị B"));
    expect(second.getByText("✓ Thành công")).toBeInTheDocument();
    expect(second.getByAltText("Avatar")).toHaveAttribute(
      "src",
      "https://via.placeholder.com/40",
    );
    expect(within(rowOf("Lê Văn C")).getByText("x Đã hủy")).toBeInTheDocument();
  });

  it("filters the list by status", async () => {
    mockEndpoint("get", "*/manager/transaction", list([pending, success, cancelled]));
    mockEndpoint("get", "*/admin/dashboard/balance", {
      totalBalance: 0,
      totalWithdrawal: 0,
    });
    renderWithProviders(<TransactionWithdrawalManager />);
    await screen.findByText("Nguyễn Văn A", {}, LOAD);

    // antd renders the header in its own table when the body scrolls
    const header = screen.getByText("Trạng thái").closest("th") as HTMLElement;
    await userEvent.click(
      header.querySelector(".ant-table-filter-trigger") as HTMLElement,
    );
    await userEvent.click(await screen.findByText("Đã hủy"));
    await userEvent.click(screen.getByRole("button", { name: "Đồng ý" }));

    await waitFor(() => expect(screen.queryByText("Nguyễn Văn A")).toBeNull());
    expect(screen.getByText("Lê Văn C")).toBeInTheDocument();
    expect(screen.queryByText("Trần Thị B")).toBeNull();
  });

  it("sorts by amount and by date", async () => {
    mockEndpoint("get", "*/manager/transaction", list([pending, success, cancelled]));
    mockEndpoint("get", "*/admin/dashboard/balance", {
      totalBalance: 0,
      totalWithdrawal: 0,
    });
    renderWithProviders(<TransactionWithdrawalManager />);
    await screen.findByText("Nguyễn Văn A", {}, LOAD);

    await userEvent.click(screen.getByText("Số tiền"));
    expect(names()).toEqual(["Trần Thị B", "Lê Văn C", "Nguyễn Văn A"]);

    await userEvent.click(screen.getByText("Ngày tạo"));
    expect(names()).toEqual(["Lê Văn C", "Trần Thị B", "Nguyễn Văn A"]);
  });

  it("denies a pending request and refreshes the table", async () => {
    let listed = 0;
    const requests = mockEndpoint("get", "*/manager/transaction", () =>
      HttpResponse.json(
        list(
          listed++ === 0
            ? [pending, success]
            : [{ ...pending, status: "CANCEL" }, success],
        ),
      ),
    );
    mockEndpoint("get", "*/admin/dashboard/balance", {
      totalBalance: 0,
      totalWithdrawal: 0,
    });
    const deny = mockEndpoint("patch", "*/manager/transaction/t1/withdrawal/deny", {});
    vi.spyOn(console, "log").mockImplementation(() => {});
    renderWithProviders(<TransactionWithdrawalManager />);
    await screen.findByText("Nguyễn Văn A", {}, LOAD);

    await openDetails("Nguyễn Văn A");
    expect(await screen.findByText("Xử lý rút tiền")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Hủy yêu cầu rút tiền" }));
    await userEvent.click(screen.getByText("Nội dung bất hợp pháp"));
    await userEvent.click(screen.getByRole("button", { name: "Gửi báo cáo" }));

    await waitFor(() => expect(requests.length).toBeGreaterThanOrEqual(3));
    expect(deny[0].json).toEqual({ failReason: "Nội dung bất hợp pháp" });
    expect(
      await within(rowOf("Nguyễn Văn A")).findByText("x Đã hủy"),
    ).toBeInTheDocument();
    vi.mocked(console.log).mockRestore();
  });

  it("shows the details of a processed request", async () => {
    const successWithReceipt = {
      ...success,
      withdrawalTransaction: {
        ...success.withdrawalTransaction!,
        bankName: "ACB",
      },
    };
    mockEndpoint("get", "*/manager/transaction", list([successWithReceipt]));
    mockEndpoint("get", "*/admin/dashboard/balance", {
      totalBalance: 0,
      totalWithdrawal: 0,
    });
    renderWithProviders(<TransactionWithdrawalManager />);
    await screen.findByText("Trần Thị B", {}, LOAD);

    await openDetails("Trần Thị B");

    expect(await screen.findByText("Chi tiết yêu cầu rút tiền")).toBeInTheDocument();
    expect(screen.getByText("ACB")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Đóng" }));
  });

  it("reloads on refresh and retries unauthorized requests", async () => {
    let listed = 0;
    const requests = mockEndpoint("get", "*/manager/transaction", () =>
      listed++ === 0 ? unauthorized() : HttpResponse.json(list([pending])),
    );
    let balanced = 0;
    const balance = mockEndpoint("get", "*/admin/dashboard/balance", () =>
      balanced++ === 0
        ? unauthorized()
        : HttpResponse.json({ totalBalance: 0, totalWithdrawal: 0 }),
    );
    renderWithProviders(<TransactionWithdrawalManager />);

    expect(await screen.findByText("Nguyễn Văn A", {}, LOAD)).toBeInTheDocument();
    await waitFor(() => expect(balance.length).toBeGreaterThanOrEqual(2));
    expect(consoleError).toHaveBeenCalledWith(
      "Error fetching items:",
      expect.anything(),
    );
    const before = requests.length;

    await userEvent.click(screen.getByTitle("Làm mới"));
    await waitFor(() => expect(requests.length).toBe(before + 1));
  });
});
