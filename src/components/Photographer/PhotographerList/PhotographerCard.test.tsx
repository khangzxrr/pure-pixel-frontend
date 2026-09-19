import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import type { MockInstance } from "vitest";
import type { Schema } from "../../../apis/types";
import UseUserOtherStore from "../../../states/UseUserOtherStore";
import { renderWithProviders } from "../../../test/render";
import { server } from "../../../test/server";
import PhotographerCard from "./PhotographerCard";

const navigate = vi.hoisted(() => vi.fn());
const session = vi.hoisted(() => ({ authenticated: true }));

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => navigate,
}));

vi.mock("@react-keycloak/web", async () => {
  const { createKeycloakMock } = await import("../../../test/keycloak");
  return {
    useKeycloak: () => ({
      keycloak: createKeycloakMock({
        authenticated: session.authenticated,
        sub: "viewer-1",
      }),
      initialized: true,
    }),
  };
});

vi.mock("../../../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

vi.mock("../../ComFollow/FollowButton", () => ({
  default: ({
    userId,
    photographer,
  }: {
    userId?: string;
    photographer: { id: string };
  }) => (
    <div>
      follow {photographer.id} by {userId ?? "guest"}
    </div>
  ),
}));

vi.mock("../../ComReport/ComReport", () => ({
  default: ({
    onclose,
    tile,
    id,
    reportType,
  }: {
    onclose: () => void;
    tile?: string;
    id: string;
    reportType: string;
  }) => (
    <div>
      <p>
        {tile} {id} {reportType}
      </p>
      <button onClick={onclose}>close report</button>
    </div>
  ),
}));

vi.mock("../../ComLoginWarning/LoginWarningModal", () => ({
  default: () => <div>login warning</div>,
}));

const photographer = (
  overrides: Partial<Schema<"PhotographerDTO">> = {},
): Schema<"PhotographerDTO"> => ({
  deletedAt: null,
  photoCount: 2,
  voteCount: 3,
  normalizedName: "lan",
  mail: "lan@purepixel.test",
  phonenumber: "",
  socialLinks: [],
  expertises: [],
  id: "p-1",
  name: "Lan",
  avatar: "https://cdn.test/avatar.jpg",
  cover: "",
  quote: "Capturing golden hours",
  location: "",
  createdAt: "2026-09-15T07:00:00.000Z",
  updatedAt: "2026-09-15T07:00:00.000Z",
  ...overrides,
});

// the photographer's latest public photos; records each query
const respondWithPhotos = (objects: { id: string; signedUrl: { thumbnail: string } }[]) => {
  const queries: Record<string, string>[] = [];
  server.use(
    http.get("*/photo/public", ({ request }) => {
      queries.push(Object.fromEntries(new URL(request.url).searchParams));
      return HttpResponse.json({ objects, totalPage: 1 });
    }),
  );
  return queries;
};

const openMenuAndChoose = async (label: string) => {
  await userEvent.click(screen.getByRole("button"));
  await userEvent.click(await screen.findByText(label));
};

describe("PhotographerCard", () => {
  let consoleError: MockInstance<typeof console.error>;

  beforeAll(() => {
    // headless ui reads animations when menus close; jsdom lacks the API and headless ui warns when it polyfills it
    Element.prototype.getAnimations = () => [];
  });

  beforeEach(() => {
    session.authenticated = true;
    navigate.mockClear();
    UseUserOtherStore.setState({ nameUserOther: "", userOtherId: null });
    consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    // the login modal still uses antd's deprecated `visible` prop
    const unexpected = consoleError.mock.calls
      .map(([text]) => String(text))
      .filter((text) => !text.includes("deprecated"));
    expect(unexpected).toEqual([]);
    consoleError.mockRestore();
  });

  it("shows the photographer's photos and lets a signed in user message or report", async () => {
    const queries = respondWithPhotos([
      { id: "ph1", signedUrl: { thumbnail: "https://cdn.test/1.jpg" } },
      { id: "ph2", signedUrl: { thumbnail: "https://cdn.test/2.jpg" } },
    ]);

    renderWithProviders(
      <PhotographerCard photographer={photographer()} maxQuoteLength={10} />,
    );

    await waitFor(() =>
      expect(screen.getByAltText("Photo 2")).toHaveAttribute(
        "src",
        "https://cdn.test/2.jpg",
      ),
    );
    expect(screen.queryByAltText("Photo 3")).toBeNull();
    expect(queries).toEqual([{ limit: "4", page: "0", photographerId: "p-1" }]);
    expect(screen.getByAltText("Lan")).toHaveAttribute(
      "src",
      "https://cdn.test/avatar.jpg",
    );
    expect(screen.getByText("“Capturing ...”")).toBeInTheDocument();
    expect(screen.getByText("follow p-1 by viewer-1")).toBeInTheDocument();

    await userEvent.click(screen.getByText("Lan"));
    expect(navigate).toHaveBeenCalledWith("/user/p-1/photos");
    expect(UseUserOtherStore.getState()).toMatchObject({
      nameUserOther: "Lan",
      userOtherId: "p-1",
    });

    await openMenuAndChoose("Nhắn tin");
    expect(navigate).toHaveBeenLastCalledWith("/message?to=p-1");

    await openMenuAndChoose("Báo cáo");
    expect(screen.getByText("Báo cáo nhiếp ảnh gia p-1 USER")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "close report" }));
    expect(screen.queryByText("Báo cáo nhiếp ảnh gia p-1 USER")).toBeNull();
  });

  it("falls back to placeholders and asks guests to sign in", async () => {
    session.authenticated = false;
    respondWithPhotos([]);

    renderWithProviders(
      <PhotographerCard photographer={photographer({ name: "", quote: "" })} />,
    );

    expect(screen.getByAltText("Photo 4")).toHaveAttribute(
      "src",
      expect.stringContaining("freepik.com"),
    );
    expect(screen.getByText("Không xác định")).toBeInTheDocument();
    expect(screen.getByText("“Không xác định”")).toBeInTheDocument();
    expect(screen.getByText("follow p-1 by guest")).toBeInTheDocument();

    await openMenuAndChoose("Nhắn tin");
    await waitFor(() => expect(screen.getByText("login warning")).toBeVisible());
    expect(navigate).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    await waitFor(() =>
      expect(screen.getByText("login warning")).not.toBeVisible(),
    );

    await openMenuAndChoose("Báo cáo");
    await waitFor(() => expect(screen.getByText("login warning")).toBeVisible());
    expect(screen.queryByRole("button", { name: "close report" })).toBeNull();
  });

  it("keeps a short quote whole", async () => {
    respondWithPhotos([]);

    renderWithProviders(<PhotographerCard photographer={photographer()} />);

    expect(screen.getByText("“Capturing golden hours”")).toBeInTheDocument();
    await waitFor(() => expect(screen.getAllByAltText(/^Photo /)).toHaveLength(4));
  });
});
