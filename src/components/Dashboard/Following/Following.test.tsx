import { act, fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import Following from "./Following";

type InfiniteScrollStubProps = {
  children?: ReactNode;
  dataLength: number;
  next: () => void;
  hasMore: boolean;
  loader: ReactNode;
  endMessage?: ReactNode;
};

const emptyList = vi.hoisted(() => ({ next: false }));

// pass-through useState that can start the next state as an empty list once
vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  const useState = ((initial: unknown) => {
    if (emptyList.next) {
      emptyList.next = false;
      return actual.useState([]);
    }
    return actual.useState(initial);
  }) as typeof actual.useState;
  return { ...actual, default: { ...actual, useState }, useState };
});

vi.mock("react-infinite-scroll-component", () => ({
  default: ({
    children,
    dataLength,
    next,
    hasMore,
    loader,
    endMessage,
  }: InfiniteScrollStubProps) => (
    <div>
      <span data-testid="length">{dataLength}</span>
      <button onClick={next}>more</button>
      {hasMore ? loader : endMessage}
      {children}
    </div>
  ),
}));

vi.mock("./PhotographerCard", () => ({
  default: () => <div>card</div>,
}));

vi.mock("../../LoadingSpinner/LoadingSpinner", () => ({
  default: () => <div>loading</div>,
}));

describe("Following", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const loadMore = () => {
    fireEvent.click(screen.getByRole("button", { name: "more" }));
    act(() => {
      vi.advanceTimersByTime(1500);
    });
  };

  it("starts with ten placeholder photographers", () => {
    render(<Following />);

    expect(screen.getByText("Bạn chưa theo dõi ai cả")).toBeInTheDocument();
    expect(screen.getAllByText("card")).toHaveLength(10);
    expect(screen.getByTestId("length")).toHaveTextContent("10");
    expect(screen.getByText("loading")).toBeInTheDocument();
  });

  it("adds five more after a delay", () => {
    render(<Following />);

    fireEvent.click(screen.getByRole("button", { name: "more" }));
    act(() => {
      vi.advanceTimersByTime(1499);
    });
    expect(screen.getAllByText("card")).toHaveLength(10);

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(screen.getAllByText("card")).toHaveLength(15);
  });

  it("stops at fifty photographers", () => {
    render(<Following />);

    for (let round = 0; round < 8; round++) {
      loadMore();
    }
    expect(screen.getAllByText("card")).toHaveLength(50);

    loadMore();

    expect(screen.getAllByText("card")).toHaveLength(50);
    expect(
      screen.getByText("Bạn đã xem hết tất cả các nhiếp ảnh gia"),
    ).toBeInTheDocument();
    expect(screen.queryByText("loading")).toBeNull();
  });

  it("shows the load error when there are no photographers", () => {
    // the list starts with ten placeholders, so an empty list can only be simulated
    emptyList.next = true;

    render(<Following />);

    expect(
      screen.getByText("Không thể tải danh sách đang theo dõi"),
    ).toBeInTheDocument();
    expect(screen.queryByText("card")).toBeNull();
  });
});
