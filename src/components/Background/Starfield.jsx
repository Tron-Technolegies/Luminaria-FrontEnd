import React, { useEffect, useRef } from "react";

export default function Starfield() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let animationFrameId;

    const stars = [];
    const numStars = 200;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", resize);
    resize();

    // Initialize stars
    for (let i = 0; i < numStars; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 1.5,
            baseAlpha: Math.random() * 0.5 + 0.1,
            blinkSpeed: Math.random() * 0.02 + 0.005,
            color: Math.random() > 0.8 ? "#b026ff" : (Math.random() > 0.5 ? "#0073ff" : "#ffffff"),
            angle: Math.random() * Math.PI * 2,
        });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw gradient background
      const gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height,
        0,
        canvas.width / 2,
        canvas.height,
        canvas.height
      );
      gradient.addColorStop(0, "rgba(20, 5, 40, 0.4)"); // Base purplish glow at bottom
      gradient.addColorStop(1, "rgba(3, 3, 8, 1)"); // Dark space
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw stars
      stars.forEach(star => {
        star.angle += star.blinkSpeed;
        const alpha = star.baseAlpha + Math.sin(star.angle) * 0.3;
        
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
        ctx.fill();
        ctx.globalAlpha = 1.0;
        
        // Slight movement upwards
        star.y -= 0.1;
        if(star.y < 0) {
            star.y = canvas.height;
            star.x = Math.random() * canvas.width;
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[-1] pointer-events-none w-full h-full"
    />
  );
}
