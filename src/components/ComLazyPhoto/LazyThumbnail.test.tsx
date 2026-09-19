import { fireEvent, render } from "@testing-library/react";
import { decode } from "blurhash";
import LazyThumbnail from "./LazyThumbnail";

const parentSize = vi.hoisted(() => ({
  value: { width: 301 } as { width?: number },
}));

vi.mock("blurhash", () => ({
  decode: vi.fn(() => new Uint8ClampedArray(32 * 32 * 4)),
}));

vi.mock("@cutting/use-get-parent-size", () => ({
  useParentSize: () => parentSize.value,
}));

class ImageDataStub {
  constructor(
    public data: Uint8ClampedArray,
    public width: number,
    public height: number,
  ) {}
}

const observers: { callback: ResizeObserverCallback; disconnect: () => void }[] =
  [];

class ResizeObserverStub {
  disconnect = vi.fn();
  constructor(private callback: ResizeObserverCallback) {
    observers.push({ callback, disconnect: this.disconnect });
  }
  observe() {
    this.callback([], this as unknown as ResizeObserver);
  }
  unobserve() {}
}

const photo = { blurHash: "LEHV6nWB2yk8pyo0adR*.7kCMdnj", width: 600, height: 400 };

describe("LazyThumbnail", () => {
  let putImageData: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    parentSize.value = { width: 301 };
    observers.length = 0;
    putImageData = vi.fn();
    vi.stubGlobal("ImageData", ImageDataStub);
    vi.stubGlobal("ResizeObserver", ResizeObserverStub);
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(
      (() => ({ putImageData })) as unknown as HTMLCanvasElement["getContext"],
    );
    vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockReturnValue(
      "data:image/png;base64,blur",
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  const images = (container: HTMLElement) => {
    const [placeholder, photoImage] = Array.from(
      container.querySelectorAll("img"),
    );
    return { placeholder, photoImage };
  };

  it("paints the blurhash as a placeholder until the photo loads", () => {
    const { container } = render(
      <LazyThumbnail src="thumb.jpg" photo={photo} className="thumb" />,
    );
    const { placeholder, photoImage } = images(container);

    expect(decode).toHaveBeenCalledWith(photo.blurHash, 32, 32);
    expect(putImageData).toHaveBeenCalledWith(expect.any(ImageDataStub), 0, 0);
    expect(placeholder).toHaveAttribute("src", "data:image/png;base64,blur");
    expect(placeholder).toHaveClass("opacity-100");
    expect(photoImage).toHaveAttribute("src", "thumb.jpg");
    expect(photoImage).toHaveAttribute("loading", "lazy");
    expect(photoImage).toHaveClass("opacity-0");
    expect(container.firstChild).toHaveClass("thumb");

    fireEvent.load(photoImage);

    expect(placeholder).toHaveClass("opacity-0");
    expect(photoImage).toHaveClass("opacity-100");
  });

  it("sizes the placeholder from the parent width and the aspect ratio", () => {
    const { container } = render(
      <LazyThumbnail src="thumb.jpg" photo={photo} />,
    );

    // 301 / 1.5, rounded down once the observer reports
    expect(observers).toHaveLength(1);
    expect(images(container).photoImage).toHaveStyle({ height: "200px" });
    expect(container.querySelector(".w-full")).toHaveStyle({
      height: "200px",
    });
  });

  it("forwards clicks and disconnects the observer on unmount", () => {
    const onClick = vi.fn();
    const { container, unmount } = render(
      <LazyThumbnail src="thumb.jpg" photo={photo} onClick={onClick} />,
    );

    fireEvent.click(container.firstChild as HTMLElement);
    expect(onClick).toHaveBeenCalledTimes(1);

    unmount();
    expect(observers[0].disconnect).toHaveBeenCalledTimes(1);
  });

  it("skips painting without a 2D context", () => {
    vi.mocked(HTMLCanvasElement.prototype.getContext).mockImplementation(
      (() => null) as unknown as HTMLCanvasElement["getContext"],
    );
    const { container } = render(
      <LazyThumbnail src="thumb.jpg" photo={photo} />,
    );

    expect(putImageData).not.toHaveBeenCalled();
    expect(images(container).placeholder).toHaveAttribute(
      "src",
      "data:image/png;base64,blur",
    );
  });
});
