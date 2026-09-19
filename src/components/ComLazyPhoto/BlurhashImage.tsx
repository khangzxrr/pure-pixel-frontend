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
  className,
  imgClassName,
  onClick,
}: BlurhashImageProps) => {
  const [state, setState] = useState<LoadState>("loading");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const hasAspectRatio = !!width && !!height && width > 0 && height > 0;
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
      className={`relative overflow-hidden bg-neutral-800 ${className ?? ""}`}
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
