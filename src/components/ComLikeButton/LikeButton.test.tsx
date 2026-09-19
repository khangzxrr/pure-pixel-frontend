import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { renderWithProviders } from "../../test/render";
import { server } from "../../test/server";
import LikeButton from "./LikeButton";

vi.mock("../../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

type Calls = { votes: unknown[]; unvotes: unknown[] };

const respond = ({
  liked = false,
  lookupStatus = 200,
  voteStatus = 201,
  unvoteStatus = 200,
}: {
  liked?: boolean;
  lookupStatus?: number;
  voteStatus?: number;
  unvoteStatus?: number;
} = {}) => {
  const calls: Calls = { votes: [], unvotes: [] };
  const reply = (status: number) =>
    status < 400 ? HttpResponse.json({}, { status }) : new HttpResponse(null, { status });
  server.use(
    http.get("*/photo/:id/vote", () =>
      lookupStatus < 400
        ? HttpResponse.json(liked ? { id: "vote-1", isUpvote: true } : null)
        : new HttpResponse(null, { status: lookupStatus }),
    ),
    http.post("*/photo/:id/vote", async ({ request, params }) => {
      calls.votes.push({ id: params.id, body: await request.json() });
      return reply(voteStatus);
    }),
    http.delete("*/photo/:id/vote", async ({ request, params }) => {
      calls.unvotes.push({ id: params.id, body: await request.json() });
      return reply(unvoteStatus);
    }),
  );
  return calls;
};

const heart = (container: HTMLElement) => container.querySelector("svg") as SVGElement;

describe("LikeButton", () => {
  let log: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // the component logs failed requests
    log = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("shows an empty heart when the photo is not liked", async () => {
    respond();
    const { container, queryClient: _client } = renderWithProviders(
      <LikeButton photoId="p1" reloadData={vi.fn()} />,
    );

    await waitFor(() => expect(heart(container)).toHaveClass("size-7"));
    expect(heart(container)).not.toHaveClass("text-red-500");
  });

  it("shows a red heart of the given size when the photo is liked", async () => {
    respond({ liked: true });
    const { container } = renderWithProviders(
      <LikeButton photoId="p1" size="size-5" reloadData={vi.fn()} />,
    );

    await waitFor(() => expect(heart(container)).toHaveClass("text-red-500"));
    expect(heart(container)).toHaveClass("size-5");
  });

  it("does not look up a vote without a photo", () => {
    const { container } = renderWithProviders(
      <LikeButton photoId="" reloadData={vi.fn()} />,
    );
    expect(heart(container)).not.toHaveClass("text-red-500");
  });

  it("logs a failed lookup and stays unliked", async () => {
    respond({ lookupStatus: 500 });
    const { container } = renderWithProviders(
      <LikeButton photoId="p1" reloadData={vi.fn()} />,
    );

    await waitFor(() => expect(log).toHaveBeenCalledTimes(1));
    expect(heart(container)).not.toHaveClass("text-red-500");
  });

  it("likes the photo and reloads it", async () => {
    const calls = respond();
    const reloadData = vi.fn();
    const { container } = renderWithProviders(
      <LikeButton photoId="p1" reloadData={reloadData} />,
    );

    fireEvent.click(heart(container));

    await waitFor(() => expect(heart(container)).toHaveClass("text-red-500"));
    expect(calls.votes).toEqual([{ id: "p1", body: { isUpvote: true } }]);
    expect(reloadData).toHaveBeenCalledTimes(1);
  });

  it("removes the like and reloads the photo", async () => {
    const calls = respond({ liked: true });
    const reloadData = vi.fn();
    const { container } = renderWithProviders(
      <LikeButton photoId="p1" reloadData={reloadData} />,
    );
    await waitFor(() => expect(heart(container)).toHaveClass("text-red-500"));

    fireEvent.click(heart(container));

    await waitFor(() => expect(heart(container)).not.toHaveClass("text-red-500"));
    expect(calls.unvotes).toEqual([{ id: "p1", body: { isUpvote: true } }]);
    expect(reloadData).toHaveBeenCalledTimes(1);
  });

  it("logs a failed like and stays unliked", async () => {
    const calls = respond({ voteStatus: 500 });
    const reloadData = vi.fn();
    const { container } = renderWithProviders(
      <LikeButton photoId="p1" reloadData={reloadData} />,
    );

    fireEvent.click(heart(container));

    await waitFor(() => expect(log).toHaveBeenCalledTimes(1));
    expect(calls.votes).toHaveLength(1);
    expect(reloadData).not.toHaveBeenCalled();
    expect(heart(container)).not.toHaveClass("text-red-500");
  });

  it("logs a failed unlike and stays liked", async () => {
    respond({ liked: true, unvoteStatus: 500 });
    const reloadData = vi.fn();
    const { container } = renderWithProviders(
      <LikeButton photoId="p1" reloadData={reloadData} />,
    );
    await waitFor(() => expect(heart(container)).toHaveClass("text-red-500"));

    fireEvent.click(heart(container));

    await waitFor(() => expect(log).toHaveBeenCalledTimes(1));
    expect(reloadData).not.toHaveBeenCalled();
    expect(heart(container)).toHaveClass("text-red-500");
  });

  it("blocks a sixth click within a minute and warns the user", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    // the component opens the notification while rendering; React warns about that (see report)
    const realError = console.error;
    vi.spyOn(console, "error").mockImplementation((...args: unknown[]) => {
      if (String(args[0]).includes("Cannot update a component")) {
        return;
      }
      realError(...args);
    });
    // failing votes keep the heart empty, so every click is a like attempt
    const calls = respond({ voteStatus: 500 });
    const { container } = renderWithProviders(
      <LikeButton photoId="p1" reloadData={vi.fn()} />,
    );

    for (let click = 0; click < 5; click++) {
      fireEvent.click(heart(container));
    }
    await waitFor(() => expect(calls.votes).toHaveLength(5));

    fireEvent.click(heart(container));
    expect((await screen.findAllByText("Thao tác thất bại")).length).toBeGreaterThan(0);
    expect(screen.getAllByText("Vui lòng thử lại sau 5 phút").length).toBeGreaterThan(0);

    // still blocked
    fireEvent.click(heart(container));
    expect(calls.votes).toHaveLength(5);

    await act(async () => {
      vi.advanceTimersByTime(60 * 1000);
    });

    fireEvent.click(heart(container));
    await waitFor(() => expect(calls.votes).toHaveLength(6));
  });
});
