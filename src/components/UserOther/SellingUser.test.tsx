import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { Route, Routes, useLocation } from "react-router-dom";
import { renderWithProviders } from "../../test/render";
import { server } from "../../test/server";
import SellingUser from "./SellingUser";

vi.mock("../LoadingSpinner/LoadingSpinner", () => ({
  default: () => <div>loading spinner</div>,
}));

vi.mock("../../services/Keycloak", () => ({
  default: {
    isLoggedIn: () => false,
    updateToken: vi.fn(),
    forceRefreshToken: vi.fn(),
    getToken: () => undefined,
    getTokenParsed: () => undefined,
  },
}));

const LocationDisplay = () => {
  const location = useLocation();
  return <div data-testid="pathname">{location.pathname}</div>;
};

const renderSellingUser = () =>
  renderWithProviders(
    <>
      <Routes>
        <Route path="/user/:userId/selling" element={<SellingUser />} />
        <Route
          path="/user/product-photo/:id"
          element={<div>product photo page</div>}
        />
      </Routes>
      <LocationDisplay />
    </>,
    { route: "/user/u1/selling" },
  );

describe("SellingUser", () => {
  it("shows loading, formats selling prices, paginates, and opens a product", async () => {
    const pages = {
      0: {
        objects: [
          {
            id: "photo-1",
            title: "Ảnh bán lẻ",
            signedUrl: { thumbnail: "/1.jpg" },
            photoSellings: [{ pricetags: [{ price: 1200000 }] }],
          },
          {
            id: "photo-2",
            title: "Ảnh nhiều mức giá",
            signedUrl: { thumbnail: "/2.jpg" },
            photoSellings: [{ pricetags: [{ price: 300000 }, { price: 900000 }] }],
          },
          {
            id: "photo-3",
            title: "Ảnh chưa định giá",
            signedUrl: { thumbnail: "/3.jpg" },
            photoSellings: [],
          },
        ],
        totalPage: 2,
      },
      1: {
        objects: [
          {
            id: "photo-4",
            title: null,
            signedUrl: { thumbnail: "/4.jpg" },
            photoSellings: [{ pricetags: [{ price: 450000 }] }],
          },
        ],
        totalPage: 2,
      },
    } as const;
    const requestedPages: string[] = [];

    server.use(
      http.get("*/photo/public", async ({ request }) => {
        const url = new URL(request.url);
        requestedPages.push(url.searchParams.get("page") ?? "missing");
        expect(url.searchParams.get("limit")).toBe("9");
        expect(url.searchParams.get("selling")).toBe("true");
        expect(url.searchParams.get("photographerId")).toBe("u1");
        await new Promise((resolve) => setTimeout(resolve, 20));
        return HttpResponse.json(
          pages[Number(url.searchParams.get("page") ?? 0) as 0 | 1],
        );
      }),
    );

    renderSellingUser();

    expect(await screen.findByText("loading spinner")).toBeInTheDocument();
    expect(await screen.findByText("Ảnh bán lẻ")).toBeInTheDocument();
    expect(screen.getByText("1.200.000đ")).toBeInTheDocument();
    expect(
      screen.getAllByText((_, element) =>
        Boolean(
          element?.textContent?.includes("300.000đ") &&
            element?.textContent?.includes("900.000đ"),
        ),
      ).length,
    ).toBeGreaterThan(0);
    expect(screen.getByText("Chưa có giá")).toBeInTheDocument();

    await userEvent.click(screen.getByText("2"));

    expect(await screen.findByText("Không xác định")).toBeInTheDocument();
    expect(requestedPages).toEqual(["0", "1"]);

    await userEvent.click(screen.getByAltText("Ảnh"));

    expect(await screen.findByText("product photo page")).toBeInTheDocument();
    expect(screen.getByTestId("pathname")).toHaveTextContent(
      "/user/product-photo/photo-4",
    );
  });

  it("shows the empty state when no selling photos are available", async () => {
    server.use(
      http.get("*/photo/public", () =>
        HttpResponse.json({ objects: [], totalPage: 0 }),
      ),
    );

    renderSellingUser();

    expect(
      await screen.findByText("Không tìm thấy ảnh khả dụng!"),
    ).toBeInTheDocument();
    expect(screen.queryByText("Chưa có giá")).toBeNull();
  });
});
