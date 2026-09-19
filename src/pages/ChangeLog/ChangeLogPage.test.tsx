import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { renderWithProviders } from "../../test/render";
import { server } from "../../test/server";
import UseChangeLogStore from "../../states/UseChangeLogStore";
import type { Schema } from "../../apis/types";
import ChangeLogPage from "./ChangeLogPage";

type ChangeLogEntry = Schema<"ChangeLogDto">;

const navigate = vi.hoisted(() => vi.fn());

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => navigate,
}));

vi.mock("../../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

const entry = (overrides: Partial<ChangeLogEntry>): ChangeLogEntry => ({
  id: "1",
  version: "v1.0.0",
  title: "Ra mắt",
  content: "<p>Nội dung</p>",
  status: "PUBLISHED",
  publishedAt: "2026-09-15T08:00:00.000Z",
  createdAt: "2026-09-15T07:00:00.000Z",
  updatedAt: "2026-09-15T07:00:00.000Z",
  ...overrides,
});

const respondWith = (objects: ChangeLogEntry[]) =>
  server.use(
    http.get("*/changelog", () => HttpResponse.json({ objects, totalPage: 1 })),
  );

describe("ChangeLogPage", () => {
  afterEach(() => {
    window.localStorage.clear();
    UseChangeLogStore.setState({ lastSeenAt: null });
  });

  it("lists entries newest first and marks the newest as seen", async () => {
    respondWith([
      entry({ id: "2", version: "v1.1.0", title: "Tính năng mới" }),
      entry({
        id: "1",
        version: "v1.0.0",
        publishedAt: "2026-09-01T08:00:00.000Z",
      }),
    ]);

    renderWithProviders(<ChangeLogPage />);

    expect(await screen.findByText("Tính năng mới")).toBeInTheDocument();
    expect(screen.getByText("v1.0.0")).toBeInTheDocument();
    expect(screen.getAllByText("Nội dung")).toHaveLength(2);
    expect(screen.getByText("15/09/2026")).toBeInTheDocument();
    expect(UseChangeLogStore.getState().lastSeenAt).toBe(
      "2026-09-15T08:00:00.000Z",
    );
  });

  it("requests the first 100 entries", async () => {
    let query = "";
    server.use(
      http.get("*/changelog", ({ request }) => {
        query = new URL(request.url).search;
        return HttpResponse.json({ objects: [], totalPage: 0 });
      }),
    );

    renderWithProviders(<ChangeLogPage />);

    await screen.findByText("Chưa có bản cập nhật nào");
    expect(query).toBe("?limit=100&page=0");
    expect(UseChangeLogStore.getState().lastSeenAt).toBeNull();
  });

  it("shows an error when loading fails", async () => {
    server.use(
      http.get("*/changelog", () => new HttpResponse(null, { status: 500 })),
    );

    renderWithProviders(<ChangeLogPage />);

    expect(
      await screen.findByText(/Không tải được nhật ký cập nhật/),
    ).toBeInTheDocument();
    expect(screen.queryByText("Chưa có bản cập nhật nào")).toBeNull();
  });

  it("goes back home", async () => {
    respondWith([]);
    renderWithProviders(<ChangeLogPage />);

    await userEvent.click(screen.getByText("Về trang chủ"));

    expect(navigate).toHaveBeenCalledWith("/");
  });
});
