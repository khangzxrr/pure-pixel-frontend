import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { decode } from "blurhash";
import BlurhashImage from "./BlurhashImage";

vi.mock("blurhash", () => ({
  decode: vi.fn(() => new Uint8ClampedArray(32 * 32 * 4).fill(7)),
}));

const HASH = "LEHV6nWB2yk8pyo0adR*.7kCMdnj";

// jsdom has no canvas: hand out a fake 2d context that records what was drawn
const fakeContext = () => {
  const imageData = { data: new Uint8ClampedArray(32 * 32 * 4) };
  return {
    imageData,
    createImageData: vi.fn(() => imageData),
    putImageData: vi.fn(),
  };
};

const wrapper = () => screen.getByTestId("blurhash-image");
const photo = () => screen.getByRole("img", { name: "Hoàng hôn" });

describe("BlurhashImage", () => {
  let context: ReturnType<typeof fakeContext>;

  beforeEach(() => {
    vi.mocked(decode).mockClear();
    context = fakeContext();
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(
      () => context as unknown as CanvasRenderingContext2D,
    );
  });

  afterEach(() => vi.restoreAllMocks());

  it("paints the decoded blurhash as a placeholder while the photo loads", () => {
    render(<BlurhashImage src="/a.jpg" alt="Hoàng hôn" blurHash={HASH} width={1200} height={800} />);

    expect(wrapper()).toHaveAttribute("data-state", "loading");
    const placeholder = screen.getByTestId("blurhash-placeholder");
    expect(placeholder.tagName).toBe("CANVAS");
    expect(placeholder).toHaveAttribute("aria-hidden", "true");
    expect(decode).toHaveBeenCalledWith(HASH, 32, 32);
    expect(context.createImageData).toHaveBeenCalledWith(32, 32);
    expect(context.imageData.data[0]).toBe(7);
    expect(context.putImageData).toHaveBeenCalledWith(context.imageData, 0, 0);

    expect(photo()).toHaveAttribute("src", "/a.jpg");
    expect(photo()).toHaveAttribute("loading", "lazy");
    expect(photo()).toHaveClass("opacity-0");
  });

  it("reserves the photo's aspect ratio so the box never collapses", () => {
    render(<BlurhashImage src="/a.jpg" alt="Hoàng hôn" blurHash={HASH} width={1200} height={800} />);
    expect(wrapper().style.aspectRatio).toBe("1200 / 800");
  });

  it("leaves the size to the caller without usable dimensions", () => {
    render(<BlurhashImage src="/a.jpg" alt="Hoàng hôn" blurHash={HASH} width={0} height={800} />);
    expect(wrapper().style.aspectRatio).toBe("");
  });

  it("fades the photo in once it has loaded", () => {
    render(<BlurhashImage src="/a.jpg" alt="Hoàng hôn" blurHash={HASH} width={3} height={2} />);

    fireEvent.load(photo());

    expect(wrapper()).toHaveAttribute("data-state", "loaded");
    expect(photo()).toHaveClass("opacity-100");
    expect(photo()).not.toHaveClass("opacity-0");
    expect(photo().className).toMatch(/transition-opacity/);
  });

  it("keeps the placeholder underneath after the photo has loaded", () => {
    render(<BlurhashImage src="/a.jpg" alt="Hoàng hôn" blurHash={HASH} width={3} height={2} />);
    fireEvent.load(photo());

    const placeholder = screen.getByTestId("blurhash-placeholder");
    expect(placeholder).toHaveAttribute("width", "32");
    expect(placeholder).toHaveAttribute("height", "32");
    expect(placeholder).toHaveClass("absolute", "inset-0", "w-full", "h-full");
  });

  it("uses a covering, lazily decoded photo with a reduced-motion friendly fade by default", () => {
    render(<BlurhashImage src="/a.jpg" alt="Hoàng hôn" blurHash={HASH} width={3} height={2} />);

    expect(photo()).toHaveAttribute("decoding", "async");
    expect(photo()).toHaveClass(
      "absolute",
      "inset-0",
      "w-full",
      "h-full",
      "object-cover",
      "transition-opacity",
      "duration-500",
      "ease-out",
      "motion-reduce:transition-none",
    );
  });

  it("decodes each hash once across re-renders", () => {
    const { rerender } = render(
      <BlurhashImage src="/a.jpg" alt="Hoàng hôn" blurHash={HASH} width={3} height={2} />,
    );
    rerender(<BlurhashImage src="/a.jpg" alt="Hoàng hôn" blurHash={HASH} width={3} height={2} className="x" />);

    expect(decode).toHaveBeenCalledTimes(1);
  });

  it("keeps the placeholder when the photo fails to load", () => {
    render(<BlurhashImage src="/broken.jpg" alt="Hoàng hôn" blurHash={HASH} width={3} height={2} />);

    fireEvent.error(photo());

    expect(wrapper()).toHaveAttribute("data-state", "error");
    expect(screen.getByTestId("blurhash-placeholder")).toBeInTheDocument();
    expect(photo()).toHaveClass("opacity-0");
  });

  it("starts loading again when the source changes", () => {
    const { rerender } = render(
      <BlurhashImage src="/a.jpg" alt="Hoàng hôn" blurHash={HASH} width={3} height={2} />,
    );
    fireEvent.load(photo());
    expect(wrapper()).toHaveAttribute("data-state", "loaded");

    rerender(<BlurhashImage src="/b.jpg" alt="Hoàng hôn" blurHash={HASH} width={3} height={2} />);

    expect(wrapper()).toHaveAttribute("data-state", "loading");
    expect(photo()).toHaveAttribute("src", "/b.jpg");
    expect(photo()).toHaveClass("opacity-0");
  });

  it("shows a cached replacement photo immediately after the source changes", () => {
    const { rerender } = render(
      <BlurhashImage src="/a.jpg" alt="Hoàng hôn" blurHash={HASH} width={3} height={2} />,
    );
    vi.spyOn(HTMLImageElement.prototype, "complete", "get").mockReturnValue(true);
    vi.spyOn(HTMLImageElement.prototype, "naturalWidth", "get").mockReturnValue(640);

    rerender(<BlurhashImage src="/cached.jpg" alt="Hoàng hôn" blurHash={HASH} width={3} height={2} />);

    expect(wrapper()).toHaveAttribute("data-state", "loaded");
  });

  it("shows an already cached photo without waiting for a load event", () => {
    vi.spyOn(HTMLImageElement.prototype, "complete", "get").mockReturnValue(true);
    vi.spyOn(HTMLImageElement.prototype, "naturalWidth", "get").mockReturnValue(640);

    render(<BlurhashImage src="/cached.jpg" alt="Hoàng hôn" blurHash={HASH} width={3} height={2} />);

    expect(wrapper()).toHaveAttribute("data-state", "loaded");
    expect(photo()).toHaveClass("opacity-100");
  });

  it.each([
    ["missing", undefined],
    ["empty", ""],
  ])("uses a neutral placeholder when the hash is %s", (_label, blurHash) => {
    render(<BlurhashImage src="/a.jpg" alt="Hoàng hôn" blurHash={blurHash} width={3} height={2} />);

    expect(decode).not.toHaveBeenCalled();
    expect(screen.queryByTestId("blurhash-placeholder")).not.toBeInTheDocument();
    expect(wrapper()).toHaveAttribute("data-state", "loading");
    expect(wrapper()).toHaveClass("bg-neutral-800");
  });

  it("uses a neutral placeholder when the hash cannot be decoded", () => {
    vi.mocked(decode).mockImplementationOnce(() => {
      throw new Error("blurhash length mismatch");
    });

    render(<BlurhashImage src="/a.jpg" alt="Hoàng hôn" blurHash="bad" width={3} height={2} />);

    expect(screen.queryByTestId("blurhash-placeholder")).not.toBeInTheDocument();
    expect(photo()).toBeInTheDocument();
  });

  it("still renders the photo when the browser gives no 2d context", () => {
    vi.mocked(HTMLCanvasElement.prototype.getContext).mockImplementation(() => null);

    render(<BlurhashImage src="/a.jpg" alt="Hoàng hôn" blurHash={HASH} width={3} height={2} />);
    fireEvent.load(photo());

    expect(wrapper()).toHaveAttribute("data-state", "loaded");
  });

  it("passes classes and clicks through", async () => {
    const onClick = vi.fn();
    render(
      <BlurhashImage
        src="/a.jpg"
        alt="Hoàng hôn"
        blurHash={HASH}
        width={3}
        height={2}
        className="rounded-lg w-full"
        imgClassName="object-contain"
        onClick={onClick}
      />,
    );

    expect(wrapper()).toHaveClass("rounded-lg", "w-full", "relative", "overflow-hidden");
    expect(photo()).toHaveClass("object-contain");
    expect(photo()).not.toHaveClass("object-cover");
    await userEvent.click(photo());
    expect(onClick).toHaveBeenCalledTimes(1);
    // the handler sits on the frame, so clicking the frame itself works too
    await userEvent.click(wrapper());
    expect(onClick).toHaveBeenCalledTimes(2);
  });
});
