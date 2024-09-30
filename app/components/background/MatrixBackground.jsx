'use client';
import React, { useRef, useEffect, useState } from "react";

const MatrixBackground = ({ squareSize = 60, lineColor = '#82817e', gradientColor = 'rgba(255, 0, 0, 0.4)' }) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const canvasRef = useRef(null);

  useEffect(() => {
    function handleResize() {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const { width, height } = dimensions;

    canvas.width = width;
    canvas.height = height;

    // Draw matrix grid
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 1;

    for (let x = 0; x <= width; x += squareSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    for (let y = 0; y <= height; y += squareSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    
    const splashRadius = Math.max(width, height) / 3; 
    const verticalSpacing = height * 1.5; 

    for (let y = -splashRadius; y < height + splashRadius; y += verticalSpacing) {
     //left
      const leftGradient = ctx.createRadialGradient(0, y, 0, 0, y, splashRadius);
      leftGradient.addColorStop(0, gradientColor);
      leftGradient.addColorStop(1, "rgba(255, 0, 0, 0)");
      ctx.fillStyle = leftGradient;
      ctx.fillRect(0, y - splashRadius, splashRadius, splashRadius * 2);

      // right
      const rightGradient = ctx.createRadialGradient(width, y + verticalSpacing / 3, 0, width, y + verticalSpacing / 3, splashRadius);
      rightGradient.addColorStop(0, gradientColor);
      rightGradient.addColorStop(1, "rgba(255, 0, 0, 0)");
      ctx.fillStyle = rightGradient;
      ctx.fillRect(width - splashRadius, y + verticalSpacing / 3 - splashRadius, splashRadius, splashRadius * 2);
    }
  }, [dimensions, squareSize, lineColor, gradientColor]);

  return <canvas ref={canvasRef} className="fixed inset-0 -z-10" style={{ opacity: 0.9 }} />;
};

export default MatrixBackground;