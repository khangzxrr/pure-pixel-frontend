import { screen } from "@testing-library/react";
import { renderWithProviders } from "../test/render";
import NewfeedLayout from "./NewfeedLayout";

const newsfeedMock = vi.fn();

vi.mock("@react-keycloak/web", async () => {
  const { createKeycloakMock } = await import("../test/keycloak");
  return {
    useKeycloak: () => ({
      keycloak: createKeycloakMock(),
      initialized: true,
    }),
  };
});

vi.mock("../services/Keycloak", () => ({
  default: {
    getTokenParsed: () => ({ id: "u1", name: "Feed User" }),
  },
}));

vi.mock("../apis/NewsfeedApi", () => ({
  default: {
    getAllNewsfeed: (...args: unknown[]) => newsfeedMock(...args),
  },
}));

vi.mock("../components/ComNewfeed/ProfileUpload", () => ({
  default: ({ userInfo }: { userInfo?: { name?: string } }) => (
    <div>upload for {userInfo?.name}</div>
  ),
}));

vi.mock("../components/ComNewfeed/NewfeedCard", () => ({
  default: ({
    id,
    title,
    commentCount,
    likeCount,
  }: {
    id: string;
    title: string;
    commentCount: number;
    likeCount: number;
  }) => <div>{`card ${id} ${title} ${commentCount} ${likeCount}`}</div>,
}));

vi.mock("antd", async () => {
  const actual = await vi.importActual<Record<string, unknown>>("antd");
  return {
    ...actual,
    Skeleton: () => <div data-testid="newsfeed-skeleton">skeleton</div>,
  };
});

beforeEach(() => {
  newsfeedMock.mockReset();
});

describe("NewfeedLayout", () => {
  it("shows skeleton placeholders while the newsfeed is loading", () => {
    newsfeedMock.mockReturnValue(new Promise(() => {}));

    renderWithProviders(<NewfeedLayout />);

    expect(screen.getAllByTestId("newsfeed-skeleton")).toHaveLength(5);
  });

  it("loads the first newsfeed page and renders its cards", async () => {
    newsfeedMock.mockResolvedValue({
      objects: [
        {
          id: "post-1",
          title: "Feed title",
          createdAt: "2024-09-01",
          photos: [],
          user: { id: "user-2", name: "Other User", avatar: "/other.png" },
          _count: { comments: 4, likes: 7 },
        },
      ],
      totalPage: 2,
    });

    renderWithProviders(<NewfeedLayout />);

    expect(await screen.findByText("upload for Feed User")).toBeInTheDocument();
    expect(newsfeedMock).toHaveBeenCalledWith(3, 0);
    expect(
      await screen.findByText("card post-1 Feed title 4 7"),
    ).toBeInTheDocument();
  });
});
