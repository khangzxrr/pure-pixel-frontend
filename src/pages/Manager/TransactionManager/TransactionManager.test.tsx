import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse } from "msw";
import type { MockInstance } from "vitest";
import { renderWithProviders } from "../../../test/render";
import { mockEndpoint } from "../../../test/mockEndpoint";
import type { Schema } from "../../../apis/types";
import TransactionManager from "./TransactionManager";
import {
  requestedAt,
  user,
  vnd,
} from "../TransactionWithdrawalManager/withdrawalFixtures.test.data";

vi.mock("../../../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

type Transaction = Schema<"TransactionDto">;

const tx = (overrides: Partial<Transaction> = {}): Transaction => ({
  id: "tx1",
  paymentPayload: {},
  paymentMethod: "SEPAY",
  type: "DEPOSIT",
  status: "SUCCESS",
  user: user(),
  amount: 100000,
  fee: 0,
  createdAt: requestedAt,
  updatedAt: requestedAt,
  userId: "u1",
  ...overrides,
});

const deposit = tx();
const sale = tx({
  id: "tx2",
  user: user({ id: "u2", name: "Trần Thị B", avatar: "" }),
  type: "IMAGE_SELL",
  paymentMethod: "WALLET",
  status: "PENDING",
  amount: 50000,
  fee: 5000,
  createdAt: new Date(2026, 8, 14, 9, 0).toISOString(),
});
const purchase = tx({
  id: "tx3",
  user: user({ id: "u3", name: "Lê Văn C" }),
  type: "IMAGE_BUY",
  paymentMethod: "WALLET",
  status: "FAILED",
  amount: 20000,
  createdAt: new Date(2026, 8, 13, 8, 0).toISOString(),
});

const page = (objects: Transaction[], totalRecord = objects.length) => ({
  objects,
  totalRecord,
  totalPage: 1,
});

// Testing Library collapses the no-break space of the formatted currency
const money = (amount: number) => vnd(amount).replace(/\s/g, " ");

const rowOf = (name: string) =>
  screen.getByText(name).closest("tr") as HTMLElement;

const names = () =>
  screen
    .getAllByRole("row")
    .map((row) => within(row).queryByText(/Nguyễn|Trần|Lê/)?.textContent)
    .filter(Boolean);

// antd renders the header in its own table when the body scrolls
const headerOf = (title: string) =>
  screen.getByText(title).closest("th") as HTMLElement;

const openDropdown = async (title: string) => {
  await userEvent.click(
    headerOf(title).querySelector(".ant-table-filter-trigger") as HTMLElement,
  );
  return waitFor(() => {
    const dropdown = document.querySelector(
      ".ant-dropdown:not(.ant-dropdown-hidden) .ant-table-filter-dropdown",
    );
    expect(dropdown).not.toBeNull();
    return dropdown as HTMLElement;
  });
};

const applyFilter = async (title: string, options: string[]) => {
  const dropdown = await openDropdown(title);
  for (const option of options) {
    await userEvent.click(within(dropdown).getByText(option));
  }
  await userEvent.click(within(dropdown).getByRole("button", { name: "Đồng ý" }));
};

describe("TransactionManager", () => {
  let consoleError: MockInstance<typeof console.error>;

  beforeEach(() => {
    consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    const unexpected = consoleError.mock.calls
      .map(([message]) => String(message))
      .filter(
        (message) =>
          // antd's filter dropdown still calls the deprecated findDOMNode
          !message.includes("deprecated") &&
          !message.startsWith("Error fetching items:"),
      );
    expect(unexpected).toEqual([]);
    consoleError.mockRestore();
  });

  it("loads the newest transactions with VND amounts, methods and statuses", async () => {
    const requests = mockEndpoint(
      "get",
      "*/manager/transaction",
      page([deposit, sale, purchase]),
    );
    renderWithProviders(<TransactionManager />);

    expect(await screen.findByText("Nguyễn Văn A")).toBeInTheDocument();
    expect(requests[0].query).toEqual({
      limit: "7",
      page: "0",
      orderByCreatedAt: "desc",
    });

    const first = rowOf("Nguyễn Văn A");
    expect(within(first).getByText("Nạp tiền")).toBeInTheDocument();
    expect(within(first).getByText(money(100000))).toBeInTheDocument();
    expect(first).toHaveTextContent(/^.*100\.000\s₫/);
    expect(within(first).getByAltText("sepay")).toBeInTheDocument();
    expect(within(first).getByText("Sepay")).toBeInTheDocument();
    expect(within(first).getByText("✓ Thành công")).toBeInTheDocument();
    expect(within(first).getByText("10:30 / 15-09-2026")).toBeInTheDocument();
    expect(
      within(first).getByAltText("https://cdn.test/avatar-a.jpg"),
    ).toBeInTheDocument();

    // a sale shows the fee before the amount
    const second = rowOf("Trần Thị B");
    expect(second).toHaveTextContent(`${money(5000)}/${money(50000)}`);
    expect(within(second).getByText("Bán ảnh")).toBeInTheDocument();
    expect(within(second).getByText("Ví")).toBeInTheDocument();
    expect(within(second).getByText("◔ Đang chờ")).toBeInTheDocument();
    expect(within(second).queryByRole("img", { name: /avatar/ })).toBeNull();

    expect(within(rowOf("Lê Văn C")).getByText("x Thất bại")).toBeInTheDocument();
    expect(rowOf("Lê Văn C")).not.toHaveTextContent("₫/");
  });

  it("filters by type and status on the server and in the table", async () => {
    const requests = mockEndpoint(
      "get",
      "*/manager/transaction",
      page([deposit, sale, purchase]),
    );
    renderWithProviders(<TransactionManager />);
    await screen.findByText("Nguyễn Văn A");

    await applyFilter("Loại", ["Nạp tiền", "Mua ảnh"]);

    await waitFor(() => expect(requests).toHaveLength(2));
    expect(requests[1].query.types.split(",").sort()).toEqual([
      "DEPOSIT",
      "IMAGE_BUY",
    ]);
    expect(requests[1].query).toMatchObject({
      limit: "7",
      page: "0",
      orderByCreatedAt: "desc",
    });
    await waitFor(() => expect(screen.queryByText("Trần Thị B")).toBeNull());
    expect(screen.getByText("Lê Văn C")).toBeInTheDocument();

    await applyFilter("Trạng thái", ["Thành công"]);

    await waitFor(() => expect(requests).toHaveLength(3));
    expect(requests[2].query).toMatchObject({ statuses: "SUCCESS" });
    expect(requests[2].query.types.split(",").sort()).toEqual([
      "DEPOSIT",
      "IMAGE_BUY",
    ]);
    await waitFor(() => expect(screen.queryByText("Lê Văn C")).toBeNull());
    expect(screen.getByText("Nguyễn Văn A")).toBeInTheDocument();
  });

  it("filters by payment method", async () => {
    const requests = mockEndpoint(
      "get",
      "*/manager/transaction",
      page([deposit, sale, purchase]),
    );
    renderWithProviders(<TransactionManager />);
    await screen.findByText("Nguyễn Văn A");

    await applyFilter("Hình thức thanh toán", ["Ví"]);

    await waitFor(() => expect(requests).toHaveLength(2));
    expect(requests[1].query).toMatchObject({ paymentMethods: "WALLET" });
    await waitFor(() => expect(screen.queryByText("Nguyễn Văn A")).toBeNull());
  });

  it("searches by the user's name", async () => {
    const requests = mockEndpoint(
      "get",
      "*/manager/transaction",
      page([deposit, sale, purchase]),
    );
    renderWithProviders(<TransactionManager />);
    await screen.findByText("Nguyễn Văn A");

    const dropdown = await openDropdown("Người giao dịch");
    await userEvent.type(
      within(dropdown).getByPlaceholderText("Tìm kiếm Người giao dịch"),
      "Trần",
    );
    await userEvent.click(within(dropdown).getByRole("button", { name: /Tìm kiếm/ }));

    await waitFor(() => expect(requests).toHaveLength(2));
    expect(requests[1].query).toMatchObject({ search: "Trần" });
    await waitFor(() => expect(screen.queryByText("Nguyễn Văn A")).toBeNull());
    expect(screen.getByText("Trần Thị B")).toBeInTheDocument();
  });

  it("sorts by amount and time on the server", async () => {
    const requests = mockEndpoint(
      "get",
      "*/manager/transaction",
      page([deposit, sale, purchase]),
    );
    renderWithProviders(<TransactionManager />);
    await screen.findByText("Nguyễn Văn A");

    await userEvent.click(screen.getByText("Số tiền"));
    await waitFor(() => expect(requests).toHaveLength(2));
    expect(requests[1].query).toEqual({
      limit: "7",
      page: "0",
      orderByAmount: "asc",
    });
    expect(names()).toEqual(["Lê Văn C", "Trần Thị B", "Nguyễn Văn A"]);

    await userEvent.click(screen.getByText("Số tiền"));
    await waitFor(() => expect(requests).toHaveLength(3));
    expect(requests[2].query).toMatchObject({ orderByAmount: "desc" });

    await userEvent.click(screen.getByText("Thời gian"));
    await waitFor(() => expect(requests).toHaveLength(4));
    expect(requests[3].query).toEqual({
      limit: "7",
      page: "0",
      orderByCreatedAt: "asc",
    });
    expect(names()).toEqual(["Lê Văn C", "Trần Thị B", "Nguyễn Văn A"]);
  });

  it("pages through the results and refreshes the current page", async () => {
    const requests = mockEndpoint(
      "get",
      "*/manager/transaction",
      page([deposit, sale, purchase], 20),
    );
    renderWithProviders(<TransactionManager />);
    await screen.findByText("Nguyễn Văn A");

    await userEvent.click(screen.getByTitle("2"));

    await waitFor(() =>
      expect(requests.at(-1)?.query).toMatchObject({ page: "1", limit: "7" }),
    );
    const before = requests.length;

    await userEvent.click(screen.getByTitle("Làm mới"));
    await waitFor(() => expect(requests).toHaveLength(before + 1));
    expect(requests.at(-1)?.query).toMatchObject({ page: "1" });
  });

  it("logs failed and unauthorized loads", async () => {
    let calls = 0;
    mockEndpoint("get", "*/manager/transaction", () =>
      new HttpResponse(null, { status: calls++ === 0 ? 500 : 401 }),
    );
    renderWithProviders(<TransactionManager />);

    await waitFor(() =>
      expect(consoleError).toHaveBeenCalledWith(
        "Error fetching items:",
        expect.anything(),
      ),
    );
    await userEvent.click(screen.getByTitle("Làm mới"));
    await waitFor(() => expect(consoleError).toHaveBeenCalledTimes(2));
  });
});
