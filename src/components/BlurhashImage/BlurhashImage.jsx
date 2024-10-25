import { useLayoutEffect, useRef, useState } from "react";
import { Blurhash } from "react-blurhash";

const BlurhashImage = (props) => {
  const [loaded, setLoaded] = useState(false);

  const targetRef = useRef();

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const [ratio, setRatio] = useState(0);

  useLayoutEffect(() => {
    if (targetRef.current) {
      setRatio(targetRef.current.offsetWidth / props.width);

      setDimensions({
        width: targetRef.current.offsetWidth,
        height: targetRef.current.offsetHeight,
      });
    }
  }, []);

  return (
    <div ref={targetRef} width="100%">
      <Blurhash
        height={props.height * ratio}
        hash="LEHV6nWB2yk8pyo0adR*.7kCMdnj"
        punch={1}
      />
      <img
        loading="lazy"
        onClick={() => props.onClick()}
        style={
          !loaded
            ? {
                height: "100%",
                position: "absolute",
                top: 0,
                opacity: 0,
              }
            : {
                height: "100%",
                position: "absolute",
                top: 0,
                opacity: 1,
                transition: "0.5s all ease-in-out",
              }
        }
        src={props.src}
        onLoad={() => {
          setLoaded(true);
        }}
      />
    </div>
  );
};

export default BlurhashImage;
