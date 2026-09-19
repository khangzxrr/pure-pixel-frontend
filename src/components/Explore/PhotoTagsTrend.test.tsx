import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { renderWithProviders } from "../../test/render";
import { server } from "../../test/server";
import UseCategoryStore from "../../states/UseCategoryStore";
import PhotoTagsTrend from "./PhotoTagsTrend";

vi.mock("../../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

const respondWithTags = () => {
  const requests: string[] = [];
  server.use(
    http.get("*/photo-tag", ({ request }) => {
      requests.push(new URL(request.url).search);
      return HttpResponse.json([
        { name: "sunset", _count: { photo: 3 } },
        { name: "city", _count: { photo: 2 } },
      ]);
    }),
  );
  return requests;
};

const rowOf = (tag: string) => screen.getByText(tag).parentElement;

describe("PhotoTagsTrend", () => {
  beforeEach(() => {
    UseCategoryStore.setState({ searchByTags: ["old"] });
  });

  it("loads the top five tags", async () => {
    const requests = respondWithTags();
    renderWithProviders(<PhotoTagsTrend />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(await screen.findByText("sunset")).toBeInTheDocument();
    expect(screen.getByText("city")).toBeInTheDocument();
    expect(requests).toEqual(["?top=5"]);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("searches by a tag and clears it again", async () => {
    respondWithTags();
    renderWithProviders(<PhotoTagsTrend />, { route: "/explore" });

    await userEvent.click(await screen.findByText("sunset"));

    expect(UseCategoryStore.getState().searchByTags).toEqual(["sunset"]);
    expect(rowOf("sunset")).toHaveClass("bg-gray-500");
    expect(rowOf("city")).not.toHaveClass("bg-gray-500");

    await userEvent.click(screen.getByRole("button"));

    expect(UseCategoryStore.getState().searchByTags).toEqual([""]);
    expect(rowOf("sunset")).not.toHaveClass("bg-gray-500");
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("keeps the tag search on other pages", async () => {
    respondWithTags();
    renderWithProviders(<PhotoTagsTrend />, { route: "/explore" });

    await screen.findByText("sunset");
    expect(UseCategoryStore.getState().searchByTags).toEqual(["old"]);
  });

  it("resets the tag search when the inspiration page opens", async () => {
    respondWithTags();
    renderWithProviders(<PhotoTagsTrend />, { route: "/explore/inspiration" });

    await screen.findByText("sunset");
    expect(UseCategoryStore.getState().searchByTags).toEqual([""]);
  });

  it("shows the error message when loading fails", async () => {
    server.use(
      http.get("*/photo-tag", () => new HttpResponse(null, { status: 500 })),
    );
    renderWithProviders(<PhotoTagsTrend />);

    expect(
      await screen.findByText(
        "Error fetching tags: Request failed with status code 500",
      ),
    ).toBeInTheDocument();
  });

  it("renders an empty list when there are no tags", async () => {
    server.use(http.get("*/photo-tag", () => HttpResponse.json(null)));
    const { container, queryClient } = renderWithProviders(<PhotoTagsTrend />);

    await waitFor(() =>
      expect(
        queryClient.getQueryState(["photoTags", { top: 5 }])?.status,
      ).toBe("success"),
    );
    expect(queryClient.getQueryData(["photoTags", { top: 5 }])).toBeNull();
    expect(container.firstChild).toBeEmptyDOMElement();
  });
});
