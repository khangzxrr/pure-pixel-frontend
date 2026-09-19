import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Schema } from "../../apis/types";
import TableTransactilonList from "./TableTransactilonList";
import { renderWithProviders } from "../../test/render";
import { mockEndpoint } from "../../test/mockEndpoint";

vi.mock("../../services/Keycloak", () => ({
  default: {
    isLoggedIn: () => false,
    getToken: () => undefined,
    getTokenParsed: () => undefined,
  },
}));

vi.mock("./TypesDropdown", () => ({
  default: ({
    types,
    setTypes,
    setPage,
  }: {
    types: string;
    setTypes: (types: string) => void;
    setPage: (page: number) => void;
  }) => (
    <button
      onClick={() => {
        setTypes(types === "" ? "DEPOSIT" : "");
        setPage(1);
      }}
    >
      type:{types || "all"}
    </button>
  ),
}));

vi.mock("./StatusDropdown", () => ({
  default: ({
    statuses,
    setStatuses,
    setPage,
  }: {
    statuses: string;
    setStatuses: (statuses: string) => void;
    setPage: (page: number) => void;
  }) => (
    <button
      onClick={() => {
        setStatuses(statuses === "" ? "SUCCESS" : "");
        setPage(1);
      }}
    >
      status:{statuses || "all"}
    </button>
  ),
}));

vi.mock("./PaymentMethodDropdown", () => ({
  default: ({
    paymentMethods,
    setPaymentMethods,
    setPage,
  }: {
    paymentMethods: string;
    setPaymentMethods: (paymentMethods: string) => void;
    setPage: (page: number) => void;
  }) => (
    <button
      onClick={() => {
        setPaymentMethods(paymentMethods === "" ? "WALLET" : "");
        setPage(1);
      }}
    >
      payment:{paymentMethods || "all"}
    </button>
  ),
}));

vi.mock("./SortDateDropdown", () => ({
  default: ({
    orderByCreatedAt,
    setOrderByCreatedAt,
  }: {
    orderByCreatedAt: "asc" | "desc";
    setOrderByCreatedAt: (orderByCreatedAt: "asc" | "desc") => void;
  }) => (
    <button
      onClick={() =>
        setOrderByCreatedAt(orderByCreatedAt === "desc" ? "asc" : "desc")
      }
    >
      sort:{orderByCreatedAt}
    </button>
  ),
}));

type Transaction = Schema<"TransactionDto">;

const tx = (overrides: Partial<Transaction> = {}): Transaction =>
  ({
    id: "t1",
    paymentPayload: {},
    paymentMethod: "SEPAY",
    type: "DEPOSIT",
    status: "SUCCESS",
    amount: 100000,
    fee: 0,
    createdAt: "2026-09-19T03:45:00.000Z",
    updatedAt: "2026-09-19T03:45:00.000Z",
    userId: "u1",
    user: {
      id: "u1",
      avatar: "",
      email: "u1@test.dev",
      name: "User One",
      role: "CUSTOMER",
      status: "ACTIVE",
      createdAt: "2026-09-19T03:45:00.000Z",
      updatedAt: "2026-09-19T03:45:00.000Z",
    },
    ...overrides,
  }) as Transaction;

describe("TableTransactilonList", () => {
  it("renders wallet transactions, notes, methods, statuses, and pagination", async () => {
    const requests = mockEndpoint("get", "*/wallet/transaction", {
      objects: [
        tx(),
        tx({
          id: "t2",
          type: "IMAGE_SELL",
          paymentMethod: "WALLET",
          amount: 50000,
          fee: 5000,
        }),
        tx({
          id: "t3",
          type: "WITHDRAWAL",
          paymentMethod: "BANKING" as Transaction["paymentMethod"],
          status: "PENDING",
          amount: 25000,
        }),
      ],
      totalPage: 2,
    });

    renderWithProviders(<TableTransactilonList />);

    const depositAmounts = await screen.findAllByText(
      (_, element) => element?.textContent === "+100.000 ₫",
    );
    expect(depositAmounts.length).toBeGreaterThan(0);
    expect(requests[0].query).toEqual({
      limit: "10",
      page: "0",
      orderByCreatedAt: "desc",
    });
    expect(
      screen.getAllByText((_, element) => element?.textContent === "+45.000 ₫")
        .length,
    ).toBeGreaterThan(0);
    expect(screen.getByText("Nạp tiền")).toBeInTheDocument();
    expect(screen.getByText("Bán ảnh")).toBeInTheDocument();
    expect(screen.getByText("Rút tiền")).toBeInTheDocument();
    expect(screen.getByText("Nhận được 90% giá trị bức ảnh")).toBeInTheDocument();
    expect(screen.getByText("Xử lý trong vòng 3 ngày")).toBeInTheDocument();
    expect(screen.getByText("Sepay")).toBeInTheDocument();
    expect(screen.getByText("Ví")).toBeInTheDocument();
    expect(screen.getByText("BANKING")).toBeInTheDocument();
    expect(screen.getAllByText("✓ Thành công").length).toBeGreaterThan(0);
    expect(screen.getByText("◔ Đang chờ")).toBeInTheDocument();
    expect(screen.getByAltText("sepay")).toBeInTheDocument();
    expect(screen.getByTitle("2")).toBeInTheDocument();
    expect(screen.getAllByText(/\d{2}:\d{2}/).length).toBeGreaterThan(0);
  });

  it("updates the query when paging and changing filters", async () => {
    const requests = mockEndpoint("get", "*/wallet/transaction", {
      objects: [tx()],
      totalPage: 2,
    });

    renderWithProviders(<TableTransactilonList />);
    await screen.findAllByText((_, element) => element?.textContent === "+100.000 ₫");

    await userEvent.click(screen.getByTitle("2"));
    await waitFor(() =>
      expect(requests.at(-1)?.query).toMatchObject({ page: "1" }),
    );

    await userEvent.click(screen.getAllByText("type:all")[0]);
    await waitFor(() =>
      expect(requests.at(-1)?.query).toMatchObject({
        page: "0",
        types: "DEPOSIT",
      }),
    );

    await userEvent.click(screen.getAllByText("status:all")[0]);
    await waitFor(() =>
      expect(requests.at(-1)?.query).toMatchObject({
        statuses: "SUCCESS",
        types: "DEPOSIT",
      }),
    );

    await userEvent.click(screen.getAllByText("payment:all")[0]);
    await waitFor(() =>
      expect(requests.at(-1)?.query).toMatchObject({
        paymentMethods: "WALLET",
        statuses: "SUCCESS",
      }),
    );

    await userEvent.click(screen.getAllByText("sort:desc")[0]);
    await waitFor(() =>
      expect(requests.at(-1)?.query).toMatchObject({
        orderByCreatedAt: "asc",
        paymentMethods: "WALLET",
      }),
    );
  });

  it("renders an empty table without pagination when there is only one page", async () => {
    mockEndpoint("get", "*/wallet/transaction", {
      objects: [],
      totalPage: 1,
    });

    renderWithProviders(<TableTransactilonList />);

    await waitFor(() =>
      expect(screen.getAllByRole("table").length).toBeGreaterThan(0),
    );
    expect(screen.queryByTitle("2")).toBeNull();
    expect(
      within(screen.getAllByRole("table")[0]).queryByText("+100.000 ₫"),
    ).toBeNull();
  });
});
