import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { MockInstance } from "vitest";
import { http, HttpResponse } from "msw";
import { createTestQueryClient, renderWithProviders } from "../../test/render";
import { server } from "../../test/server";
import { mockEndpoint } from "../../test/mockEndpoint";
import type { Schema } from "../../apis/types";
import useModalStore from "../../states/UseModalStore";
import MyPhotoshootPackageCard, {
  type PhotographerPhotoshootPackage,
} from "./MyPhotoshootPackageCard";

vi.mock("../../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

const owner: Schema<"UserDto"> = {
  id: "ptg-1",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  roles: ["photographer"],
  enabled: true,
  username: "ptg",
  cover: "",
  location: "",
  mail: "",
  phonenumber: "",
  socialLinks: [],
  expertises: [],
  avatar: "",
  name: "Nhiếp ảnh gia",
  quote: "",
};

const photoshootPackage = (
  overrides: Partial<PhotographerPhotoshootPackage> = {},
): PhotographerPhotoshootPackage => ({
  id: "pk1",
  title: "Gói cưới",
  subtitle: "Trọn gói",
  price: 2000000,
  thumbnail: "https://cdn.test/thumb.jpg",
  description: "Chụp cả ngày",
  status: "ENABLED",
  user: owner,
  reviews: [],
  showcases: [],
  createdAt: new Date(2026, 8, 12, 12).toISOString(),
  _count: { bookings: 5 },
  ...overrides,
});

type RenderOptions = {
  packageDetail?: PhotographerPhotoshootPackage;
  page?: number;
  numberOfRecord?: number;
};

const renderCard = ({
  packageDetail = photoshootPackage(),
  page = 2,
  numberOfRecord = 9,
}: RenderOptions = {}) => {
  const setPage = vi.fn();
  const parentClick = vi.fn();
  const queryClient = createTestQueryClient();
  queryClient.setQueryData(["findAllPhotoshootPackages", page, "desc"], {});
  const view = renderWithProviders(
    <div onClick={parentClick}>
      <MyPhotoshootPackageCard
        packageDetail={packageDetail}
        page={page}
        setPage={setPage}
        numberOfRecord={numberOfRecord}
        itemsPerPage={8}
      />
    </div>,
    { queryClient },
  );
  return { ...view, setPage, parentClick, queryClient };
};

const clickDelete = async (container: HTMLElement) => {
  const icon = container.querySelector(".anticon-delete");
  await userEvent.click(icon?.parentElement as HTMLElement);
};

describe("MyPhotoshootPackageCard", () => {
  let consoleError: MockInstance<typeof console.error>;

  beforeEach(() => {
    consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 8, 15, 12));
    useModalStore.setState({
      isUpdatePhotoshootPackageModal: false,
      selectedUpdatePhotoshootPackage: {},
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    // the tooltip nested in the popconfirm makes rc-trigger fall back to the deprecated findDOMNode
    const unexpected = consoleError.mock.calls
      .map((args) => args.map(String).join(" "))
      .filter((message) => !message.includes("deprecated"));
    consoleError.mockRestore();
    expect(unexpected.join("\n")).toBe("");
  });

  it("shows the package summary", () => {
    renderCard();

    expect(screen.getByText("Gói cưới")).toBeInTheDocument();
    expect(screen.getByText("2.000.000đ")).toBeInTheDocument();
    expect(screen.getByText("Chụp cả ngày")).toBeInTheDocument();
    expect(screen.getByText("Tạo 3 ngày trước")).toBeInTheDocument();
    expect(screen.getByText("5 lượt thuê")).toBeInTheDocument();
    expect(screen.getByAltText("demo")).toHaveAttribute(
      "src",
      "https://cdn.test/thumb.jpg",
    );
    expect(screen.queryByText(/đang\s+bị vô hiệu hóa/)).toBeNull();
  });

  it("opens the update modal for enabled packages", async () => {
    const { container, parentClick } = renderCard();

    await userEvent.click(
      container.querySelector(".anticon-edit")?.parentElement as HTMLElement,
    );

    expect(useModalStore.getState().isUpdatePhotoshootPackageModal).toBe(true);
    expect(useModalStore.getState().selectedUpdatePhotoshootPackage).toBe("pk1");
    expect(parentClick).not.toHaveBeenCalled();
  });

  it("does not edit disabled packages", async () => {
    const { container, parentClick } = renderCard({
      packageDetail: photoshootPackage({ status: "DISABLED", _count: undefined }),
    });

    expect(screen.getByText(/đang\s+bị vô hiệu hóa/)).toBeInTheDocument();
    expect(screen.getByText("lượt thuê")).toBeInTheDocument();

    await userEvent.click(
      container.querySelector(".anticon-edit")?.parentElement as HTMLElement,
    );

    expect(useModalStore.getState().isUpdatePhotoshootPackageModal).toBe(false);
    // the disabled edit icon does not stop the click from opening the package
    expect(parentClick).toHaveBeenCalledTimes(1);
  });

  it("deletes the last package of a page and steps back a page", async () => {
    const deletes = mockEndpoint("delete", "*/photographer/photoshoot-package/:id", {});
    const { container, setPage, parentClick, queryClient } = renderCard({
      page: 2,
      numberOfRecord: 9,
    });

    await clickDelete(container);
    expect(parentClick).not.toHaveBeenCalled();
    await userEvent.click(await screen.findByRole("button", { name: "Có" }));

    await waitFor(() => expect(setPage).toHaveBeenCalledWith(1));
    expect(deletes).toHaveLength(1);
    expect(deletes[0].path).toMatch(/\/photographer\/photoshoot-package\/pk1$/);
    expect(
      queryClient.getQueryState(["findAllPhotoshootPackages", 2, "desc"])
        ?.isInvalidated,
    ).toBe(true);
    expect(parentClick).not.toHaveBeenCalled();
  });

  it("stays on the page when packages are left", async () => {
    const deletes = mockEndpoint("delete", "*/photographer/photoshoot-package/:id", {});
    const { container, setPage, queryClient } = renderCard({
      page: 1,
      numberOfRecord: 3,
    });

    await clickDelete(container);
    await userEvent.click(await screen.findByRole("button", { name: "Có" }));

    await waitFor(() =>
      expect(
        queryClient.getQueryState(["findAllPhotoshootPackages", 1, "desc"])
          ?.isInvalidated,
      ).toBe(true),
    );
    expect(deletes).toHaveLength(1);
    expect(setPage).not.toHaveBeenCalled();
  });

  it("notifies when the package cannot be deleted", async () => {
    server.use(
      http.delete(
        "*/photographer/photoshoot-package/:id",
        () => new HttpResponse(null, { status: 500 }),
      ),
    );
    const { container, setPage } = renderCard();

    await clickDelete(container);
    await userEvent.click(await screen.findByRole("button", { name: "Có" }));

    expect(await screen.findByText("Tạo gói chụp thất bại")).toBeInTheDocument();
    expect(
      screen.getByText("Không thể tạo gói của bạn. Vui lòng thử lại."),
    ).toBeInTheDocument();
    expect(setPage).not.toHaveBeenCalled();
  });

  it("keeps the package when the deletion is cancelled", async () => {
    const deletes = mockEndpoint("delete", "*/photographer/photoshoot-package/:id", {});
    const { container, parentClick } = renderCard();

    await clickDelete(container);
    await userEvent.click(await screen.findByRole("button", { name: "Không" }));

    expect(deletes).toHaveLength(0);
    expect(parentClick).not.toHaveBeenCalled();
  });
});
