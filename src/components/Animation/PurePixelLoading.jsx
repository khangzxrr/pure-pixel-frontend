import React, { useEffect, useRef } from "react";
import "./Animation.css";

const PurePixelLoading = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");

    let dashLen = 220,
      dashOffset = dashLen,
      speed = 13,
      txt = "Pure Pixel",
      x = 30,
      i = 0;

    ctx.font = "80px Charm";
    ctx.lineWidth = 1;
    ctx.globalAlpha = 2 / 3;
    ctx.strokeStyle = "#FFF";
    ctx.fillStyle = "#FFF";
    const drawLoop = () => {
      ctx.clearRect(x, 0, 60, 150); // Clear a portion of the canvas for each character

      ctx.setLineDash([dashLen - dashOffset, dashOffset - speed]);
      dashOffset -= speed;
      ctx.strokeText(txt[i], x, 90);

      if (dashOffset > 0) {
        requestAnimationFrame(drawLoop);
      } else {
        ctx.fillText(txt[i], x, 90); // Fill the text after the stroke is complete
        dashOffset = dashLen;
        x += ctx.measureText(txt[i++]).width + ctx.lineWidth * Math.random();

        if (i < txt.length) {
          requestAnimationFrame(drawLoop);
        } else {
          // All characters are drawn, reset and restart the animation
          setTimeout(() => {
            clearCanvasAndRestart();
          }, 500); // Add a short delay before restarting
        }
      }
    };

    const clearCanvasAndRestart = () => {
      // Clear the entire canvas
      ctx.clearRect(0, 0, 640, 100);
      // Reset variables
      x = 30;
      i = 0;
      dashOffset = dashLen;
      // Restart the loop
      drawLoop();
    };

    drawLoop(); // Start the initial animation loop
  }, []);

  return (
    <div id="test" className="fancy_title">
      <canvas ref={canvasRef} width="500" height="500"></canvas>
    </div>
  );
};

export default PurePixelLoading;
