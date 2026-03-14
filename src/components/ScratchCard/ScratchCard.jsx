import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function ScratchCard({ rewardText, onComplete }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isScratchedDone, setIsScratchedDone] = useState(false);
  const isDrawing = useRef(false);
  const isRevealed = useRef(false);

  const latestOnComplete = useRef(onComplete);
  
  useEffect(() => {
    latestOnComplete.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    
    const drawInitialState = () => {
      canvas.width = canvas.parentElement.clientWidth || 300;
      canvas.height = canvas.parentElement.clientHeight || 200;
      
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, "#4a1c6a");
      gradient.addColorStop(0.5, "#1a0b3a");
      gradient.addColorStop(1, "#21094e");
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.font = "bold 28px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("SCRATCH HERE", canvas.width / 2, canvas.height / 2);

      // Add a subtle pattern/noise or stars over it
      for (let i = 0; i < 50; i++) {
        ctx.fillStyle = "rgba(255,255,255,0.3)";
        ctx.beginPath();
        ctx.arc(
          Math.random() * canvas.width,
          Math.random() * canvas.height,
          Math.random() * 2,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    };

    drawInitialState();

    const getCoordinates = (e) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches && e.touches.length > 0 ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches && e.touches.length > 0 ? e.touches[0].clientY : e.clientY;
      return {
        x: clientX - rect.left,
        y: clientY - rect.top,
      };
    };

    const scratch = (e) => {
      if (!isDrawing.current || isRevealed.current) return;
      if (e.cancelable) e.preventDefault();
      
      const { x, y } = getCoordinates(e);
      
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(x, y, 80, 0, Math.PI * 2); // Increased brush size to 80px for mobile
      ctx.fill();
      
      checkScratched();
    };

    const checkScratched = () => {
      try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        let transparentPixels = 0;
        
        // Exact 1-to-1 pixel check for accuracy (every 4th value is Alpha)
        for (let i = 3; i < data.length; i += 4) {
          // Check if alpha is essentially transparent
          if (data[i] < 10) {
            transparentPixels++;
          }
        }
        
        const totalPixels = data.length / 4;
        const percentageScratched = transparentPixels / totalPixels;

        // Reliable 50% threshold
        if (percentageScratched > 0.50) {
          isRevealed.current = true;
          setIsScratchedDone(true);
          // Trigger the completion correctly
          if (latestOnComplete.current) latestOnComplete.current();
        }
      } catch (err) {
        // Handle cross-origin canvas read issues if any
        console.error(err);
      }
    };

    const handleDown = (e) => {
      if (isRevealed.current) return;
      isDrawing.current = true;
      scratch(e);
    };

    const handleUp = () => {
      isDrawing.current = false;
    };

    canvas.addEventListener("mousedown", handleDown);
    canvas.addEventListener("mousemove", scratch);
    window.addEventListener("mouseup", handleUp);
    
    canvas.addEventListener("touchstart", handleDown, { passive: false });
    canvas.addEventListener("touchmove", scratch, { passive: false });
    window.addEventListener("touchend", handleUp);

    return () => {
      canvas.removeEventListener("mousedown", handleDown);
      canvas.removeEventListener("mousemove", scratch);
      window.removeEventListener("mouseup", handleUp);
      
      canvas.removeEventListener("touchstart", handleDown);
      canvas.removeEventListener("touchmove", scratch);
      window.removeEventListener("touchend", handleUp);
    };
  }, []);

  const formatReward = (reward) => {
    switch (reward?.toLowerCase()) {
      case "polishing": return "Free car checkup + Polishing";
      case "interior": return "Free car checkup + Interior Detailing";
      case "carwash": return "Free car checkup + Car wash";
      default: return reward?.toUpperCase() || "MYSTERY REWARD";
    }
  };

  const formattedReward = formatReward(rewardText);
  const getRewardIcon = () => {
    switch (rewardText?.toLowerCase()) {
      case "polishing": return "✨";
      case "interior": return "🛋️";
      case "carwash": return "🚗💦";
      default: return "🎁";
    }
  };

  return (
    <div 
      ref={containerRef} 
      className="relative w-full max-w-sm aspect-[4/3] rounded-2xl overflow-hidden glass-panel flex flex-col items-center justify-center select-none shadow-2xl border-brand-purple/30 mx-auto"
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-0 bg-gradient-to-br from-brand-dark to-brand-purple-dark">
        <motion.div 
          initial={false}
          animate={{ scale: isScratchedDone ? [0.8, 1.1, 1] : 1 }}
          transition={{ duration: 0.5, type: "spring" }}
        >
          <div className="text-6xl mb-4">{getRewardIcon()}</div>
          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-green to-brand-blue drop-shadow-lg">
            {formattedReward}
          </h2>
          <p className="text-slate-300 mt-2 font-medium">Congratulations!</p>
        </motion.div>
      </div>

      <canvas
        ref={canvasRef}
        className={`absolute inset-0 z-10 w-full h-full cursor-pointer transition-opacity duration-700 ${isScratchedDone ? "opacity-0 pointer-events-none" : "opacity-100"}`}
      />
    </div>
  );
}
