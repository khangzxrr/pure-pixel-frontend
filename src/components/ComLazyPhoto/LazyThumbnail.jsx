import { useEffect, useRef, useState } from "react";
import { decode } from "blurhash";
import { useParentSize } from "@cutting/use-get-parent-size";

const LazyThumbnail = ({ id, src, photo, className, onClick }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  const ref = useRef();
  const { width } = useParentSize(ref);

  const pixels = decode(photo.blurHash, 32, 32); // You can adjust the width/height here for the initial blur
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  canvas.width = 32;
  canvas.height = 32;
  context.putImageData(new ImageData(pixels, 32, 32), 0, 0);

  const aspectRatio = photo.width / photo.height;

  const [placedholderHeight, setPlaceholderHeight] = useState(
    width / aspectRatio,
  );

  const blurHashUrl = canvas.toDataURL();

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      setPlaceholderHeight(Math.floor(width / aspectRatio));
    });

    resizeObserver.observe(ref.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div className={className} ref={ref}>
      <div className="w-full" style={{ height: placedholderHeight }}>
        <img
          src={blurHashUrl}
          style={{ height: placedholderHeight }}
          className={`absolute w-full top-0 left-0 object-cover transition ease-in-out duration-300 ${isLoaded ? "opacity-0" : "opacity-100"}`}
        />

        <img
          loading="lazy"
          style={{ height: placedholderHeight }}
          //ORDER onLoad BEFORE src IS IMPORTANT
          //OR it will cause flicking loading
          onLoad={() => setIsLoaded(true)}
          src={src}
          className={`absolute top-0 left-0 w-full object-cover transition ease-in-out duration-300 ${isLoaded ? "opacity-100" : "opacity-0"}`}
        />
      </div>
    </div>
  );
};

export default LazyThumbnail;
