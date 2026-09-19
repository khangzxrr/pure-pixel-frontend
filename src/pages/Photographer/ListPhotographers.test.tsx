import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import type { ReactNode } from "react";
import type { Schema } from "../../apis/types";
import UsePhotographerFilterStore from "../../states/UsePhotographerFilterStore";
import { renderWithProviders } from "../../test/render";
import { server } from "../../test/server";
import ListPhotographers from "./ListPhotographers";

type Photographer = Schema<"PhotographerDTO">;

type InfiniteScrollStubProps = {
  children?: ReactNode;
  dataLength: number;
  next: () => void;
  hasMore: boolean;
  loader: ReactNode;
};

vi.mock("@react-keycloak/web", async () => {
  const { createKeycloakMock } = await import("../../test/keycloak");
  return {
    useKeycloak: () => ({
      keycloak: createKeycloakMock({ sub: "me" }),
      initialized: true,
    }),
  };
});

vi.mock("../../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

vi.mock("react-infinite-scroll-component", () => ({
  default: ({ children, dataLength, next, hasMore, loader }: InfiniteScrollStubProps) => (
    <div>
      <span data-testid="length">{dataLength}</span>
      <button onClick={next}>more</button>
      {hasMore && loader}
      {children}
    </div>
  ),
}));

vi.mock("../../components/Photographer/PhotographerList/PhotographerCard", () => ({
  default: ({ photographer }: { photographer: Photographer }) => (
    <div>card {photographer.name}</div>
  ),
}));

vi.mock("../../components/LoadingSpinner/LoadingSpinner", () => ({
  default: () => <div>loading</div>,
}));

const photographer = (id: string, name: string): Photographer => ({
  deletedAt: null,
  photoCount: 1,
  voteCount: 2,
  normalizedName: name,
  mail: `${id}@purepixel.test`,
  phonenumber: "",
  socialLinks: [],
  expertises: [],
  id,
  name,
  avatar: "",
  cover: "",
  quote: "",
  location: "",
  createdAt: "2026-09-15T07:00:00.000Z",
  updatedAt: "2026-09-15T07:00:00.000Z",
});

// answers each page from `pages` and records the query of every request
const respondWithPages = (pages: Photographer[][]) => {
  const queries: Record<string, string>[] = [];
  server.use(
    http.get("*/photographer", ({ request }) => {
      const query = Object.fromEntries(new URL(request.url).searchParams);
      queries.push(query);
      return HttpResponse.json({
        objects: pages[Number(query.page)],
        totalPage: pages.length,
      });
    }),
  );
  return queries;
};

describe("ListPhotographers", () => {
  beforeEach(() => {
    UsePhotographerFilterStore.setState({
      searchResult: "",
      filterByVote: { name: "", param: "" },
    });
  });

  it("lists other photographers and loads the next page", async () => {
    const queries = respondWithPages([
      [photographer("p1", "An"), photographer("me", "Tôi")],
      [photographer("p2", "Bình")],
    ]);

    renderWithProviders(<ListPhotographers />);

    expect(screen.getByText("loading")).toBeInTheDocument();
    expect(await screen.findByText("card An")).toBeInTheDocument();
    expect(screen.queryByText("card Tôi")).toBeNull();
    expect(screen.getByTestId("length")).toHaveTextContent("1");
    expect(queries).toEqual([{ limit: "10", page: "0", orderByFollower: "desc" }]);

    await userEvent.click(screen.getByRole("button", { name: "more" }));

    expect(await screen.findByText("card Bình")).toBeInTheDocument();
    expect(screen.getByText("card An")).toBeInTheDocument();
    expect(queries[1]).toEqual({ limit: "10", page: "1", orderByFollower: "desc" });
    expect(screen.queryByText("loading")).toBeNull();
  });

  it("sends the search text and vote ordering", async () => {
    UsePhotographerFilterStore.setState({
      searchResult: "Lan",
      filterByVote: { name: "Tăng dần", param: "asc" },
    });
    const queries = respondWithPages([[photographer("p1", "Lan")]]);

    renderWithProviders(<ListPhotographers />);

    expect(await screen.findByText("card Lan")).toBeInTheDocument();
    expect(queries).toEqual([
      {
        limit: "10",
        page: "0",
        search: "Lan",
        orderByVoteCount: "asc",
        orderByFollower: "desc",
      },
    ]);
  });

  it("says when nobody is found", async () => {
    UsePhotographerFilterStore.setState({
      filterByVote: { name: "Giảm dần", param: "desc" },
    });
    const queries = respondWithPages([[photographer("me", "Tôi")]]);

    renderWithProviders(<ListPhotographers />);

    expect(
      await screen.findByText("Không tìm thấy nhiếp ảnh gia khả dụng!"),
    ).toBeInTheDocument();
    expect(queries[0].orderByVoteCount).toBe("desc");
  });

  it("shows the request error", async () => {
    server.use(
      http.get("*/photographer", () => HttpResponse.json({}, { status: 500 })),
    );

    renderWithProviders(<ListPhotographers />);

    expect(
      await screen.findByText("Request failed with status code 500"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Không tìm thấy nhiếp ảnh gia khả dụng!"),
    ).toBeInTheDocument();
  });
});
