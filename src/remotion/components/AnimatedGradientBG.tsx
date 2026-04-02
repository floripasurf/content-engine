import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
} from "remotion";

interface AnimatedGradientBGProps {
  accentColor: string;
  secondaryColor?: string;
  variant?: number; // 0-3, different gradient styles
}

/**
 * Animated gradient mesh background with floating geometric shapes.
 * Used as fallback when no Pexels API key / stock footage is available.
 * Looks like abstract Instagram story backgrounds.
 */
export const AnimatedGradientBG: React.FC<AnimatedGradientBGProps> = ({
  accentColor,
  secondaryColor,
  variant = 0,
}) => {
  const frame = useCurrentFrame();

  // Parse accent color to HSL-ish values for variation
  const hueShift = interpolate(frame, [0, 900], [0, 360], {
    extrapolateRight: "extend",
  });

  // Palette presets per variant
  const palettes = [
    // Dark moody blue/purple
    { bg1: "#0a0a1a", bg2: "#1a0a2e", bg3: "#0a1a2e", blob1: accentColor, blob2: secondaryColor || "#8B5CF6" },
    // Warm dark orange/red
    { bg1: "#1a0a0a", bg2: "#2a1510", bg3: "#1a1005", blob1: "#F97316", blob2: "#EF4444" },
    // Cool teal/green
    { bg1: "#0a1a15", bg2: "#0a2a20", bg3: "#051a1a", blob1: "#14B8A6", blob2: "#22C55E" },
    // Brand-colored
    { bg1: "#0a0a15", bg2: "#15102a", bg3: "#0a151a", blob1: accentColor, blob2: secondaryColor || "#EC4899" },
  ];

  const pal = palettes[variant % palettes.length];

  // Floating circle positions (smooth sine/cosine motion)
  const circles = [
    {
      x: interpolate(Math.sin(frame * 0.008), [-1, 1], [10, 70]),
      y: interpolate(Math.cos(frame * 0.006), [-1, 1], [5, 55]),
      size: interpolate(Math.sin(frame * 0.004), [-1, 1], [300, 500]),
      color: pal.blob1,
      opacity: 0.15,
    },
    {
      x: interpolate(Math.cos(frame * 0.007), [-1, 1], [30, 90]),
      y: interpolate(Math.sin(frame * 0.009), [-1, 1], [40, 90]),
      size: interpolate(Math.cos(frame * 0.005), [-1, 1], [250, 450]),
      color: pal.blob2,
      opacity: 0.12,
    },
    {
      x: interpolate(Math.sin(frame * 0.005 + 2), [-1, 1], [0, 60]),
      y: interpolate(Math.cos(frame * 0.007 + 1), [-1, 1], [20, 80]),
      size: interpolate(Math.sin(frame * 0.003 + 1), [-1, 1], [200, 400]),
      color: pal.blob1,
      opacity: 0.1,
    },
  ];

  // Floating geometric shapes (lines, small circles)
  const particles: { x: number; y: number; size: number; rotation: number; type: "circle" | "line" | "ring" }[] = [];
  for (let i = 0; i < 12; i++) {
    const speed = 0.003 + (i * 0.001);
    const offset = i * 1.5;
    particles.push({
      x: interpolate(Math.sin(frame * speed + offset), [-1, 1], [5, 95]),
      y: interpolate(Math.cos(frame * speed * 0.7 + offset), [-1, 1], [5, 95]),
      size: 4 + (i % 4) * 3,
      rotation: frame * (0.5 + i * 0.1),
      type: i % 3 === 0 ? "circle" : i % 3 === 1 ? "line" : "ring",
    });
  }

  return (
    <AbsoluteFill>
      {/* Base gradient */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(${135 + hueShift * 0.1}deg, ${pal.bg1} 0%, ${pal.bg2} 50%, ${pal.bg3} 100%)`,
        }}
      />

      {/* Gradient mesh blobs */}
      {circles.map((c, i) => (
        <div
          key={`blob-${i}`}
          style={{
            position: "absolute",
            left: `${c.x}%`,
            top: `${c.y}%`,
            width: c.size,
            height: c.size,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${c.color} 0%, transparent 70%)`,
            opacity: c.opacity,
            transform: "translate(-50%, -50%)",
            filter: "blur(60px)",
          }}
        />
      ))}

      {/* Floating particles */}
      {particles.map((p, i) => (
        <div
          key={`particle-${i}`}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.type === "line" ? p.size * 4 : p.size,
            height: p.type === "line" ? 2 : p.size,
            borderRadius: p.type === "ring" ? "50%" : p.type === "circle" ? "50%" : 1,
            backgroundColor: p.type === "ring" ? "transparent" : "rgba(255,255,255,0.08)",
            border: p.type === "ring" ? "1px solid rgba(255,255,255,0.06)" : "none",
            transform: `rotate(${p.rotation}deg)`,
          }}
        />
      ))}

      {/* Subtle noise/grain texture overlay */}
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.015) 1px, transparent 0)`,
          backgroundSize: "30px 30px",
        }}
      />
    </AbsoluteFill>
  );
};
