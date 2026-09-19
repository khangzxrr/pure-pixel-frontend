import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import type { MockInstance } from "vitest";
import { createTestQueryClient, renderWithProviders } from "../../test/render";
import { server } from "../../test/server";
import { mockEndpoint } from "../../test/mockEndpoint";
import type { Schema } from "../../apis/types";
import useModalStore from "../../states/UseModalStore";
import UpdatePhotoshootPackage from "./UpdatePhotoshootPackage";

type PhotoshootPackage = Schema<"PhotoshootPackageDto">;

vi.mock("../../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

const DETAIL_URL = "*/photographer/photoshoot-package/:id";
const SHOWCASES_URL =
  "*/photographer/photoshoot-package-showcase/photoshoot-package/:id";

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
  overrides: Partial<PhotoshootPackage> = {},
): PhotoshootPackage => ({
  id: "pk1",
  title: "Gói cưới",
  subtitle: "Trọn gói",
  price: 2000000,
  thumbnail: "https://cdn.test/thumb.jpg",
  description: "Chụp cả ngày",
  status: "ENABLED",
  user: owner,
  reviews: [],
  showcases: [{ id: "s1", photoUrl: "https://cdn.test/s1.jpg" }],
  ...overrides,
});

const servePackage = (value: PhotoshootPackage) => {
  const details = mockEndpoint("get", DETAIL_URL, value);
  mockEndpoint("get", SHOWCASES_URL, {
    objects: value.showcases ?? [],
    totalPage: 1,
    totalRecord: 1,
  });
  return details;
};

const submit = () =>
  userEvent.click(screen.getByRole("button", { name: "Cập nhật gói chụp" }));

describe("UpdatePhotoshootPackage", () => {
  let consoleError: MockInstance<typeof console.error>;

  beforeEach(() => {
    consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    useModalStore.setState({
      isUpdatePhotoshootPackageModal: true,
      selectedUpdatePhotoshootPackage: "pk1",
      deleteShowcasesList: [],
    });
  });

  afterEach(() => {
    // antd warns about the deprecated Modal `visible` and the findDOMNode fallback of its tooltips
    const unexpected = consoleError.mock.calls
      .map((args) => args.map(String).join(" "))
      .filter((message) => !message.includes("deprecated"));
    consoleError.mockRestore();
    expect(unexpected.join("\n")).toBe("");
  });

  it("loads the package into the form and saves the changes", async () => {
    const details = servePackage(photoshootPackage());
    const updates = mockEndpoint("patch", DETAIL_URL, {});
    const onClose = vi.fn();
    renderWithProviders(<UpdatePhotoshootPackage onClose={onClose} />);

    const title = screen.getByPlaceholderText("Tựa đề của gói");
    await waitFor(() => expect(title).toHaveValue("Gói cưới"));
    expect(screen.getByPlaceholderText("Phụ đề")).toHaveValue("Trọn gói");
    expect(screen.getByPlaceholderText("Nhập giá")).toHaveValue("2.000.000 ₫");
    expect(
      screen.getByPlaceholderText("Phần mô tả chi tiết gói sẽ nằm ở đây"),
    ).toHaveValue("Chụp cả ngày");
    expect(screen.getByAltText("Showcase 1")).toHaveAttribute(
      "src",
      "https://cdn.test/s1.jpg",
    );
    expect(details[0].path).toMatch(/\/photographer\/photoshoot-package\/pk1$/);

    await userEvent.clear(title);
    await userEvent.type(title, "Gói mới");
    await userEvent.type(screen.getByPlaceholderText("Phụ đề"), " có album");
    await userEvent.type(
      screen.getByPlaceholderText("Phần mô tả chi tiết gói sẽ nằm ở đây"),
      " và tối",
    );
    await submit();

    expect(await screen.findByText("Cập nhật thành công")).toBeInTheDocument();
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(updates).toHaveLength(1);
    expect(updates[0].path).toMatch(/\/photographer\/photoshoot-package\/pk1$/);
    const form = updates[0].form as FormData;
    expect(Object.fromEntries(form)).toEqual({
      title: "Gói mới",
      subtitle: "Trọn gói có album",
      price: "2000000",
      description: "Chụp cả ngày và tối",
    });
  });

  it("shows validation errors", async () => {
    servePackage(photoshootPackage());
    const updates = mockEndpoint("patch", DETAIL_URL, {});
    renderWithProviders(<UpdatePhotoshootPackage onClose={vi.fn()} />);
    const title = screen.getByPlaceholderText("Tựa đề của gói");
    await waitFor(() => expect(title).toHaveValue("Gói cưới"));

    await userEvent.clear(title);
    await userEvent.clear(screen.getByPlaceholderText("Phụ đề"));
    await userEvent.clear(screen.getByPlaceholderText("Nhập giá"));
    await userEvent.clear(
      screen.getByPlaceholderText("Phần mô tả chi tiết gói sẽ nằm ở đây"),
    );
    await submit();

    expect(await screen.findByText("Vui lòng nhập tiêu đề.")).toBeInTheDocument();
    expect(screen.getByText("Vui lòng nhập phụ đề.")).toBeInTheDocument();
    expect(screen.getByText("Giá gói là bắt buộc")).toBeInTheDocument();
    expect(screen.getByText("Vui lòng nhập mô tả.")).toBeInTheDocument();
    expect(updates).toHaveLength(0);
  });

  it("requires at least one showcase photo", async () => {
    servePackage(photoshootPackage({ showcases: [] }));
    const updates = mockEndpoint("patch", DETAIL_URL, {});
    renderWithProviders(<UpdatePhotoshootPackage onClose={vi.fn()} />);
    await waitFor(() =>
      expect(screen.getByPlaceholderText("Tựa đề của gói")).toHaveValue("Gói cưới"),
    );

    await submit();

    expect(
      await screen.findByText("Thiếu ảnh cho bộ sưu tập"),
    ).toBeInTheDocument();
    expect(updates).toHaveLength(0);
  });

  it("starts from cached showcases and blank values the package lacks", async () => {
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(
      ["photoshoot-package-showcases-by-photographer", "pk1"],
      { objects: [{ id: "s7", photoUrl: "https://cdn.test/s7.jpg" }] },
    );
    const empty = photoshootPackage({
      title: "",
      subtitle: "",
      price: 0,
      description: "",
      showcases: undefined as unknown as PhotoshootPackage["showcases"],
    });
    let resolveDetail: () => void = () => {};
    const detailSent = new Promise<void>((resolve) => {
      resolveDetail = resolve;
    });
    server.use(
      http.get(DETAIL_URL, async () => {
        await detailSent;
        return HttpResponse.json(empty);
      }),
    );
    mockEndpoint("get", SHOWCASES_URL, { objects: [] });
    renderWithProviders(<UpdatePhotoshootPackage onClose={vi.fn()} />, {
      queryClient,
    });

    // before the package arrives the collection comes from the cache
    expect(screen.getByAltText("Showcase 1")).toHaveAttribute(
      "src",
      "https://cdn.test/s7.jpg",
    );

    resolveDetail();
    await waitFor(() => expect(screen.queryByAltText("Showcase 1")).toBeNull());
    expect(screen.getByPlaceholderText("Tựa đề của gói")).toHaveValue("");
    expect(screen.getByPlaceholderText("Nhập giá")).toHaveValue("");
  });

  it("keeps the modal open when the update fails", async () => {
    servePackage(photoshootPackage());
    server.use(http.patch(DETAIL_URL, () => new HttpResponse(null, { status: 500 })));
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    const onClose = vi.fn();
    renderWithProviders(<UpdatePhotoshootPackage onClose={onClose} />);
    await waitFor(() =>
      expect(screen.getByPlaceholderText("Tựa đề của gói")).toHaveValue("Gói cưới"),
    );

    await submit();

    expect(
      await screen.findByText("Cập nhật gói chụp thất bại"),
    ).toBeInTheDocument();
    expect(log).toHaveBeenCalledWith(expect.objectContaining({ name: "AxiosError" }));
    await waitFor(() =>
      expect(consoleError).toHaveBeenCalledWith(
        "Error updating photoshoot package:",
        expect.objectContaining({ name: "AxiosError" }),
      ),
    );
    consoleError.mockClear();
    expect(onClose).not.toHaveBeenCalled();
    log.mockRestore();
  });

  it("clears the selection when the modal is dismissed", async () => {
    const details = servePackage(photoshootPackage());
    // until the parent unmounts it, the cleared selection loads the package with an empty id
    const emptyIdDetails = mockEndpoint(
      "get",
      "*/photographer/photoshoot-package/",
      {},
    );
    const emptyIdShowcases = mockEndpoint(
      "get",
      "*/photographer/photoshoot-package-showcase/photoshoot-package/",
      { objects: [] },
    );
    useModalStore.setState({ deleteShowcasesList: ["s1"] });
    renderWithProviders(<UpdatePhotoshootPackage onClose={vi.fn()} />);
    await waitFor(() =>
      expect(screen.getByPlaceholderText("Tựa đề của gói")).toHaveValue("Gói cưới"),
    );
    expect(details).toHaveLength(1);

    await userEvent.click(screen.getByRole("button", { name: "Close" }));

    const state = useModalStore.getState();
    expect(state.isUpdatePhotoshootPackageModal).toBe(false);
    expect(state.selectedUpdatePhotoshootPackage).toBe("");
    expect(state.deleteShowcasesList).toEqual([]);
    // the package detail is invalidated while it is still shown, so it reloads
    await waitFor(() => expect(details).toHaveLength(2));
    await waitFor(() => expect(emptyIdDetails).toHaveLength(1));
    expect(emptyIdShowcases).toHaveLength(1);
  });
});
