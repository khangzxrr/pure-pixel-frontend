import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import type { MockInstance } from "vitest";
import { renderWithProviders } from "../../test/render";
import { server } from "../../test/server";
import { mockEndpoint } from "../../test/mockEndpoint";
import type { Schema } from "../../apis/types";
import useModalStore from "../../states/UseModalStore";
import PhotoshootPackageManagementV2 from "./PhotoshootPackageManagementV2";

const navigate = vi.hoisted(() => vi.fn());

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => navigate,
}));

vi.mock("../../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

// the create and update forms have their own tests
vi.mock("./CreatePhotoshootPackage", () => ({
  default: ({ onClose }: { onClose: () => void }) => (
    <button onClick={onClose}>close create form</button>
  ),
}));
vi.mock("./UpdatePhotoshootPackage", () => ({
  default: ({ onClose }: { onClose: () => void }) => (
    <button onClick={onClose}>close update form</button>
  ),
}));

const LIST_URL = "*/photographer/photoshoot-package";

const photoshootPackage = (
  id: string,
  title: string,
): Schema<"PhotoshootPackageDto"> => ({
  id,
  title,
  subtitle: "",
  price: 1000000,
  thumbnail: `https://cdn.test/${id}.jpg`,
  description: "",
  status: "ENABLED",
  user: {
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
  },
  reviews: [],
  showcases: [],
});

const serveMe = (packageCount: string, maxPackageCount: string) =>
  mockEndpoint("get", "*/me", { packageCount, maxPackageCount });

const serveList = (totalPage = 2) =>
  mockEndpoint("get", LIST_URL, {
    objects: [photoshootPackage("pk1", "Gói cưới"), photoshootPackage("pk2", "Gói kỷ yếu")],
    totalRecord: 10,
    totalPage,
  });

const progressWidth = (container: HTMLElement) =>
  container.querySelector<HTMLElement>(".bg-\\[\\#777777\\]")?.style.width;

describe("PhotoshootPackageManagementV2", () => {
  let consoleError: MockInstance<typeof console.error>;

  beforeEach(() => {
    consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    navigate.mockReset();
    useModalStore.setState({
      isUpdatePhotoshootPackageModal: false,
      selectedUpdatePhotoshootPackage: {},
      deleteShowcasesList: [],
    });
  });

  afterEach(() => {
    // antd warns about the deprecated Modal `visible` and the findDOMNode fallback of the card tooltips
    const unexpected = consoleError.mock.calls
      .map((args) => args.map(String).join(" "))
      .filter((message) => !message.includes("deprecated"));
    consoleError.mockRestore();
    expect(unexpected.join("\n")).toBe("");
  });

  it("shows the package quota and the first page of packages", async () => {
    serveMe("2", "5");
    const requests = serveList();

    const { container } = renderWithProviders(<PhotoshootPackageManagementV2 />);

    expect(await screen.findByText("Gói cưới")).toBeInTheDocument();
    expect(screen.getByText("Gói kỷ yếu")).toBeInTheDocument();
    expect(
      await screen.findByText("Số gói chụp có thể tạo thêm: 3 gói"),
    ).toBeInTheDocument();
    expect(screen.getByText("2 gói")).toBeInTheDocument();
    expect(progressWidth(container)).toBe("40%");
    expect(requests[0].query).toEqual({
      limit: "8",
      page: "0",
      orderByCreateAt: "desc",
    });
  });

  it("opens and closes the create form", async () => {
    serveMe("2", "5");
    serveList();
    renderWithProviders(<PhotoshootPackageManagementV2 />);

    await userEvent.click(await screen.findByRole("button", { name: "Tạo gói chụp" }));
    expect(await screen.findByRole("dialog")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "close create form" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("requests the chosen page", async () => {
    serveMe("2", "5");
    const requests = serveList();
    renderWithProviders(<PhotoshootPackageManagementV2 />);
    await screen.findByText("Gói cưới");

    await userEvent.click(screen.getByTitle("2"));
    await waitFor(() => expect(requests.at(-1)?.query.page).toBe("1"));
    const count = requests.length;

    await userEvent.click(screen.getByTitle("2"));
    expect(requests).toHaveLength(count);
  });

  it("hides the pagination for a single page", async () => {
    serveMe("2", "5");
    serveList(1);
    renderWithProviders(<PhotoshootPackageManagementV2 />);

    await screen.findByText("Gói cưới");
    expect(screen.queryByTitle("2")).toBeNull();
  });

  it("asks to upgrade when the quota is used up", async () => {
    serveMe("5", "5");
    serveList();
    const { container } = renderWithProviders(<PhotoshootPackageManagementV2 />);

    await userEvent.click(
      await screen.findByText(/Không thể tạo thêm gói chụp vì hết dung lượng/),
    );

    expect(navigate).toHaveBeenCalledWith("/upgrade");
    expect(screen.queryByRole("button", { name: "Tạo gói chụp" })).toBeNull();
    expect(progressWidth(container)).toBe("100%");
  });

  it("shows an unknown quota when the profile cannot be loaded", async () => {
    server.use(http.get("*/me", () => new HttpResponse(null, { status: 500 })));
    serveList();
    const { container } = renderWithProviders(<PhotoshootPackageManagementV2 />);

    await screen.findByText("Gói cưới");
    expect(screen.getByText("Chưa rõ gói")).toBeInTheDocument();
    expect(progressWidth(container)).toBe("0%");
    expect(
      screen.getByText(/Không thể tạo thêm gói chụp vì hết dung lượng/),
    ).toBeInTheDocument();
  });

  it("shows an empty list when the packages cannot be loaded", async () => {
    serveMe("1", "5");
    server.use(http.get(LIST_URL, () => new HttpResponse(null, { status: 500 })));
    renderWithProviders(<PhotoshootPackageManagementV2 />);

    expect(
      await screen.findByText("Số gói chụp có thể tạo thêm: 4 gói"),
    ).toBeInTheDocument();
    expect(screen.queryByAltText("demo")).toBeNull();
    expect(screen.queryByTitle("2")).toBeNull();
  });

  it("opens a package", async () => {
    serveMe("2", "5");
    serveList();
    renderWithProviders(<PhotoshootPackageManagementV2 />);

    await userEvent.click(await screen.findByText("Gói kỷ yếu"));

    expect(navigate).toHaveBeenCalledWith("/profile/photoshoot-package/pk2");
  });

  it("shows the update form while a package is being edited", async () => {
    serveMe("2", "5");
    serveList();
    useModalStore.setState({
      isUpdatePhotoshootPackageModal: true,
      selectedUpdatePhotoshootPackage: "pk1",
      deleteShowcasesList: ["s1"],
    });
    renderWithProviders(<PhotoshootPackageManagementV2 />);

    await userEvent.click(screen.getByRole("button", { name: "close update form" }));

    const state = useModalStore.getState();
    expect(state.isUpdatePhotoshootPackageModal).toBe(false);
    expect(state.selectedUpdatePhotoshootPackage).toBe("");
    expect(state.deleteShowcasesList).toEqual([]);
  });

  it("loads fewer packages on small screens", async () => {
    const width = window.innerWidth;
    window.innerWidth = 800;
    serveMe("2", "5");
    const requests = serveList();

    renderWithProviders(<PhotoshootPackageManagementV2 />);

    await screen.findByText("Gói cưới");
    expect(requests[0].query.limit).toBe("4");
    window.innerWidth = width;
  });
});
