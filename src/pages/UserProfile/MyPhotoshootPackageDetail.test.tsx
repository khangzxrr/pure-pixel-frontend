import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { renderWithProviders } from "../../test/render";
import { server } from "../../test/server";
import { mockEndpoint } from "../../test/mockEndpoint";
import type { Schema } from "../../apis/types";
import useModalStore from "../../states/UseModalStore";
import MyPhotoshootPackageDetail from "./MyPhotoshootPackageDetail";

vi.mock("../../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

// the review list and the update modal have their own tests
vi.mock("../../components/Booking/BookingPackageReview", () => ({
  default: ({ photoshootPackage }: { photoshootPackage: { reviews: unknown[] } }) => (
    <div>reviews: {photoshootPackage.reviews.length}</div>
  ),
}));
vi.mock("./UpdatePhotoshootPackage", () => ({
  default: ({ onClose }: { onClose: () => void }) => (
    <button onClick={onClose}>close update modal</button>
  ),
}));

const photoshootPackage: Schema<"PhotoshootPackageDto"> = {
  id: "pk1",
  title: "Gói cưới",
  subtitle: "Trọn gói",
  price: 2000000,
  thumbnail: "https://cdn.test/thumb.jpg",
  description: "Chụp cả ngày",
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
  showcases: [{ id: "s1", photoUrl: "https://cdn.test/s1.jpg" }],
};

const renderDetail = () =>
  renderWithProviders(<MyPhotoshootPackageDetail />, {
    route: "/profile/photoshoot-package/pk1",
    path: "/profile/photoshoot-package/:photoshootPackageId",
  });

describe("MyPhotoshootPackageDetail", () => {
  beforeEach(() => {
    useModalStore.setState({
      isUpdatePhotoshootPackageModal: false,
      selectedUpdatePhotoshootPackage: {},
      deleteShowcasesList: ["s9"],
    });
  });

  it("loads the package with its showcases and reviews", async () => {
    const requests = mockEndpoint(
      "get",
      "*/photographer/photoshoot-package/:id",
      photoshootPackage,
    );

    const { container } = renderDetail();

    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(await screen.findByText("Gói cưới")).toBeInTheDocument();
    expect(screen.getByText("reviews: 0")).toBeInTheDocument();
    expect(
      Array.from(container.querySelectorAll("img")).map((img) => img.src),
    ).toEqual(["https://cdn.test/thumb.jpg", "https://cdn.test/s1.jpg"]);
    expect(screen.queryByText("Loading...")).toBeNull();
    expect(requests[0].path).toMatch(/\/photographer\/photoshoot-package\/pk1$/);
  });

  it("shows the loading error", async () => {
    server.use(
      http.get(
        "*/photographer/photoshoot-package/:id",
        () => new HttpResponse(null, { status: 500 }),
      ),
    );

    renderDetail();

    expect(
      await screen.findByText("Error: Request failed with status code 500"),
    ).toBeInTheDocument();
  });

  it("opens the update modal and resets the selection when it closes", async () => {
    mockEndpoint("get", "*/photographer/photoshoot-package/:id", photoshootPackage);
    renderDetail();

    await userEvent.click(await screen.findByRole("button", { name: /Chỉnh sửa/ }));

    expect(useModalStore.getState().selectedUpdatePhotoshootPackage).toBe("pk1");
    await userEvent.click(screen.getByRole("button", { name: "close update modal" }));

    const state = useModalStore.getState();
    expect(state.isUpdatePhotoshootPackageModal).toBe(false);
    expect(state.selectedUpdatePhotoshootPackage).toBe("");
    expect(state.deleteShowcasesList).toEqual([]);
    expect(screen.queryByRole("button", { name: "close update modal" })).toBeNull();
  });
});
