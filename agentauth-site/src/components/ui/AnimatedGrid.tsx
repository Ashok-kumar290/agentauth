"use client";

import { useEffect, useRef } from "react";

/**
 * AnimatedGrid - Cyberpunk-style animated grid background
 * Creates an infinite grid with subtle pulse animations
 */
export function AnimatedGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const draw = () => {
      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const gridSize = 60;
      const offsetX = (time * 0.5) % gridSize;
      const offsetY = (time * 0.3) % gridSize;

      // Draw vertical lines
      ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
      ctx.lineWidth = 1;

      for (let x = -offsetX; x < canvas.width + gridSize; x += gridSize) {
        const pulse = Math.sin(time * 0.02 + x * 0.01) * 0.5 + 0.5;
        ctx.strokeStyle = `rgba(16, 185, 129, ${0.02 + pulse * 0.03})`;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      // Draw horizontal lines
      for (let y = -offsetY; y < canvas.height + gridSize; y += gridSize) {
        const pulse = Math.sin(time * 0.02 + y * 0.01) * 0.5 + 0.5;
        ctx.strokeStyle = `rgba(16, 185, 129, ${0.02 + pulse * 0.03})`;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw intersection points with glow
      for (let x = -offsetX; x < canvas.width + gridSize; x += gridSize) {
        for (let y = -offsetY; y < canvas.height + gridSize; y += gridSize) {
          const pulse = Math.sin(time * 0.03 + x * 0.005 + y * 0.005) * 0.5 + 0.5;
          const radius = 1 + pulse * 1.5;
          
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(16, 185, 129, ${0.1 + pulse * 0.2})`;
          ctx.fill();
        }
      }

      time += 1;
      animationId = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ opacity: 0.6 }}
    />
  );
}

/**
 * GlowOrb - Floating glow orb for ambient effect
 */
export function GlowOrb({ 
  color = "emerald", 
  size = 400, 
  position,
  blur = 100,
  className = ""
}: { 
  color?: "emerald" | "blue" | "purple" | "white";
  size?: number | "sm" | "md" | "lg" | "xl";
  position?: "center" | "top-left" | "top-right" | "bottom-left" | "bottom-right";
  blur?: number;
  className?: string;
}) {
  const colors = {
    emerald: "rgba(16, 185, 129, 0.15)",
    blue: "rgba(59, 130, 246, 0.15)",
    purple: "rgba(139, 92, 246, 0.15)",
    white: "rgba(255, 255, 255, 0.08)",
  };

  const sizes = {
    sm: 200,
    md: 300,
    lg: 400,
    xl: 600,
  };

  const positions = {
    center: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
    "top-left": "top-0 left-0 -translate-x-1/2 -translate-y-1/2",
    "top-right": "top-0 right-0 translate-x-1/2 -translate-y-1/2",
    "bottom-left": "bottom-0 left-0 -translate-x-1/2 translate-y-1/2",
    "bottom-right": "bottom-0 right-0 translate-x-1/2 translate-y-1/2",
  };

  const resolvedSize = typeof size === "string" ? sizes[size] : size;
  const positionClass = position ? positions[position] : "";

  return (
    <div
      className={`absolute ${positionClass} rounded-full pointer-events-none animate-pulse ${className}`}
      style={{
        width: resolvedSize,
        height: resolvedSize,
        background: `radial-gradient(circle, ${colors[color]}, transparent 70%)`,
        filter: `blur(${blur}px)`,
      }}
    />
  );
}

/**
 * FloatingParticles - Subtle floating particles
 */
export function FloatingParticles({ count = 30 }: { count?: number }) {
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 20 + 20,
    delay: Math.random() * 10,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-emerald-500/20"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size,
            animation: `float ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.2; }
          25% { transform: translateY(-20px) translateX(10px); opacity: 0.5; }
          50% { transform: translateY(-10px) translateX(-10px); opacity: 0.3; }
          75% { transform: translateY(-30px) translateX(5px); opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
