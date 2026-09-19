import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { renderWithProviders } from "../../test/render";
import { server } from "../../test/server";
import UseChangeLogStore from "../../states/UseChangeLogStore";
import UseNotificationStore from "../../states/UseNotificationStore";
import type { Schema } from "../../apis/types";
import ServerSide from "./ServerSide";

type TokenParsed = {
  sub: string;
  resource_access: { purepixel: { roles: string[] } };
};

const session = vi.hoisted(() => ({
  token: undefined as TokenParsed | undefined,
}));

vi.mock("../../services/Keycloak", () => ({
  default: {
    isLoggedIn: () => false,
    getToken: () => undefined,
    getTokenParsed: () => session.token,
  },
}));

const signIn = (roles: string[]) => {
  session.token = { sub: "user-1", resource_access: { purepixel: { roles } } };
};

const latest = (
  publishedAt: string | null,
): Schema<"ChangeLogDto"> => ({
  id: "1",
  version: "v1.1.0",
  title: "Tính năng mới",
  content: "<p>Nội dung</p>",
  status: "PUBLISHED",
  publishedAt,
  createdAt: "2026-09-10T07:00:00.000Z",
  updatedAt: "2026-09-10T07:00:00.000Z",
});

const respondWith = (entry: Schema<"ChangeLogDto">) =>
  server.use(http.get("*/changelog/latest", () => HttpResponse.json(entry)));

const badgeOf = (title: string) =>
  screen.getByTitle(title).querySelector(".bg-red-500");

// waits until the latest change log has been fetched, so a missing badge is final
const renderLoaded = async () => {
  const result = renderWithProviders(<ServerSide />);
  await waitFor(() =>
    expect(
      result.queryClient.getQueryState(["changelog-latest"])?.status,
    ).toBe("success"),
  );
  return result;
};

describe("ServerSide", () => {
  beforeEach(() => {
    session.token = undefined;
    window.localStorage.clear();
    UseChangeLogStore.setState({ lastSeenAt: null });
    UseNotificationStore.setState({
      isNotificationOpen: false,
      isNewNotification: true,
    });
  });

  describe("change log badge", () => {
    it("shows when the latest entry was never opened", async () => {
      respondWith(latest("2026-09-15T08:00:00.000Z"));
      renderWithProviders(<ServerSide />);

      await waitFor(() => expect(badgeOf("Cập nhật")).not.toBeNull());
    });

    it("shows when the latest entry is newer than the last one seen", async () => {
      UseChangeLogStore.setState({ lastSeenAt: "2026-09-01T08:00:00.000Z" });
      respondWith(latest("2026-09-15T08:00:00.000Z"));
      renderWithProviders(<ServerSide />);

      await waitFor(() => expect(badgeOf("Cập nhật")).not.toBeNull());
    });

    it.each([
      ["the latest entry was already seen", "2026-09-15T08:00:00.000Z"],
      ["a newer entry was seen", "2026-09-20T08:00:00.000Z"],
    ])("hides when %s", async (_case, lastSeenAt) => {
      UseChangeLogStore.setState({ lastSeenAt });
      respondWith(latest("2026-09-15T08:00:00.000Z"));

      await renderLoaded();

      expect(badgeOf("Cập nhật")).toBeNull();
    });

    it("hides when the latest entry has no publish date", async () => {
      respondWith(latest(null));

      await renderLoaded();

      expect(badgeOf("Cập nhật")).toBeNull();
    });

    it("never marks other links", async () => {
      respondWith(latest("2026-09-15T08:00:00.000Z"));
      renderWithProviders(<ServerSide />);

      await waitFor(() => expect(badgeOf("Cập nhật")).not.toBeNull());
      expect(badgeOf("Khám phá")).toBeNull();
      expect(badgeOf("Chính sách")).toBeNull();
    });
  });

  it("shows only the public links when signed out", async () => {
    respondWith(latest(null));
    await renderLoaded();

    expect(screen.getByAltText("logo")).toBeInTheDocument();
    for (const title of ["Khám phá", "Nâng cấp", "Cập nhật", "Chính sách"]) {
      expect(screen.getByTitle(title)).toBeInTheDocument();
    }
    for (const title of ["Tải lên", "Thông báo", "Tin nhắn"]) {
      expect(screen.queryByTitle(title)).toBeNull();
    }
  });

  it("shows notifications and messages, but not upload, to signed-in customers", async () => {
    signIn([]);
    respondWith(latest(null));
    await renderLoaded();

    expect(screen.getByTitle("Thông báo")).toBeInTheDocument();
    expect(screen.getByTitle("Tin nhắn")).toBeInTheDocument();
    expect(screen.queryByTitle("Tải lên")).toBeNull();
  });

  it("shows upload to photographers and toggles the notification panel", async () => {
    signIn(["photographer"]);
    respondWith(latest(null));
    await renderLoaded();

    expect(screen.getByTitle("Tải lên")).toHaveAttribute("href", "/upload");

    await userEvent.click(screen.getByTitle("Thông báo"));

    expect(UseNotificationStore.getState().isNotificationOpen).toBe(true);
  });

  it("treats a token without roles as a customer", async () => {
    session.token = { sub: "user-1" } as TokenParsed;
    respondWith(latest(null));
    await renderLoaded();

    expect(screen.getByTitle("Tin nhắn")).toBeInTheDocument();
    expect(screen.queryByTitle("Tải lên")).toBeNull();
  });
});
