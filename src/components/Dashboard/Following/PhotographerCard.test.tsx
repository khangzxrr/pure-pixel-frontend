import { fireEvent, render, screen } from "@testing-library/react";
import PhotoList from "../ForYou/PhotoList";
import PhotographerCard from "./PhotographerCard";

describe("PhotographerCard", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows four sample photos and the photographer", () => {
    render(<PhotographerCard />);

    for (const index of [1, 2, 3, 4]) {
      expect(screen.getByAltText(`Photo ${index}`)).toBeInTheDocument();
    }
    expect(screen.queryByAltText("Photo 5")).toBeNull();
    expect(screen.getByText("Nguyễn Thành Trung")).toBeInTheDocument();
    expect(screen.getByText("Đồng Nai, Việt Nam")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Theo dõi" })).toBeInTheDocument();
  });

  it("picks the photos from the sample list", () => {
    // a constant comparator keeps the list order
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    render(<PhotographerCard />);

    expect(screen.getByAltText("Photo 1")).toHaveAttribute(
      "src",
      PhotoList[0].photo,
    );
    expect(screen.getByAltText("Photo 4")).toHaveAttribute(
      "src",
      PhotoList[3].photo,
    );
  });

  it("opens the options menu without following the link", async () => {
    // antd's Dropdown still calls findDOMNode internally; hide only that library warning
    const realError = console.error;
    vi.spyOn(console, "error").mockImplementation((...args: unknown[]) => {
      if (String(args[0]).includes("findDOMNode is deprecated")) {
        return;
      }
      realError(...args);
    });
    const { container } = render(<PhotographerCard />);
    const trigger = container.querySelector("a");
    expect(trigger).not.toBeNull();

    // fireEvent returns false when the handler prevented the default action
    expect(fireEvent.click(trigger as HTMLAnchorElement)).toBe(false);

    expect(await screen.findByText("Block user")).toBeInTheDocument();
  });
});
