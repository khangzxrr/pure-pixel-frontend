import { useEffect, useState } from "react";
import { decode } from "blurhash";

const LazyThumbnail = ({ id, src, blurHash, className, onClick }) => {
  const [decodedBlurHash, setDecodedBlurHash] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const pixels = decode(blurHash, 32, 32); // You can adjust the width/height here for the initial blur
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.width = 32;
    canvas.height = 32;
    context.putImageData(new ImageData(pixels, 32, 32), 0, 0);
    setDecodedBlurHash(canvas.toDataURL());
  }, [blurHash]);

  return (
    <div
      className={{
        ...className,
      }}
    >
      {/* Placeholder for the blurred image */}
      {isLoading && decodedBlurHash ? (
        <img
          src={decodedBlurHash}
          alt="blurred image"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ease-in-out ${isLoading ? "opacity-100" : "opacity-0"}`}
        />
      ) : null}

      {/* Actual image */}
      <img
        src={src}
        onLoad={() => setIsLoading(false)}
        className={`w-full h-auto object-cover transition-opacity duration-500 ease-in-out ${isLoading ? "opacity-0" : "opacity-100"}`}
      />
    </div>
  );
};

export default LazyThumbnail;
