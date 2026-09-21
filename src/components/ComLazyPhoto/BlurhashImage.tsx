import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type MouseEventHandler,
} from "react";
import { decode } from "blurhash";

type BlurhashImageProps = {
  src: string;
  alt: string;
  blurHash?: string | null;
  width?: number | null;
  height?: number | null;
  /**
   * "intrinsic" reserves the photo's own aspect ratio (feed);
   * "fill" ignores it and fills the caller's fixed frame (cropped product cards).
   */
  ratio?: "intrinsic" | "fill";
  className?: string;
  imgClassName?: string;
  onClick?: MouseEventHandler<HTMLElement>;
};

type LoadState = "loading" | "loaded" | "error";

const BlurhashImage = ({
  src,
  alt,
  blurHash,
  width,
  height,
  ratio = "intrinsic",
  className,
  imgClassName,
  onClick,
}: BlurhashImageProps) => {
  const [state, setState] = useState<LoadState>("loading");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const hasAspectRatio =
    ratio === "intrinsic" && !!width && !!height && width > 0 && height > 0;
  const pixels = useMemo<Uint8ClampedArray | null>(() => {
    if (!blurHash) return null;
    try {
      return decode(blurHash, 32, 32);
    } catch {
      return null;
    }
  }, [blurHash]);

  useLayoutEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth > 0) {
      setState("loaded");
    } else {
      setState("loading");
    }
  }, [src]);

  useEffect(() => {
    if (!pixels) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imageData = ctx.createImageData(32, 32);
    imageData.data.set(pixels);
    ctx.putImageData(imageData, 0, 0);
  }, [pixels]);

  const wrapperStyle = hasAspectRatio
    ? { aspectRatio: `${width} / ${height}` }
    : undefined;

  const fitClass = imgClassName?.includes("object-")
    ? ""
    : "object-cover";

  return (
    <div
      data-testid="blurhash-image"
      data-state={state}
      className={`relative overflow-hidden bg-surface-elevated ${className ?? ""}`}
      style={wrapperStyle}
      onClick={onClick}
    >
      {pixels && (
        <canvas
          ref={canvasRef}
          data-testid="blurhash-placeholder"
          aria-hidden="true"
          width={32}
          height={32}
          className="absolute inset-0 w-full h-full"
        />
      )}
      {state === "error" && (
        <div
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center text-ink-disabled"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-8 w-8"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <circle cx="9" cy="10" r="1.5" />
            <path d="m4 17 5-4.5 4 3.5 3-2.5 4 3.5" />
          </svg>
        </div>
      )}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setState("loaded")}
        onError={() => setState("error")}
        className={`absolute inset-0 w-full h-full ${fitClass} transition-opacity duration-500 ease-out motion-reduce:transition-none ${
          state === "loaded" ? "opacity-100" : "opacity-0"
        } ${imgClassName ?? ""}`}
      />
    </div>
  );
};

export default BlurhashImage;
