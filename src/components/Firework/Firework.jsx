import { useRef, useEffect } from "react";
import { Fireworks } from "@fireworks-js/react";
import useFireworkStore from "../../states/UseFireworkStore";

export function Firework() {
  const ref = useRef(null);
  const { isFiring, stopFireworks } = useFireworkStore();

  useEffect(() => {
    if (isFiring && ref.current) {
      ref.current.start();
      const timer = setTimeout(() => {
        ref.current.stop();
        stopFireworks(); // Stop and reset the Zustand state after 3 seconds
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isFiring, stopFireworks]);

  // Only render Fireworks component when `isFiring` is true
  if (!isFiring) return null;

  return (
    <Fireworks
      ref={ref}
      options={{ opacity: 0.5 }}
      style={{
        width: "100%",
        height: "100%",
        position: "fixed",
        top: 0,
        left: 0,
      }}
    />
  );
}
