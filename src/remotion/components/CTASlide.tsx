import React from "react";
import { useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";

interface CTASlideProps {
  text: string;
  brandEmoji: string;
  accentColor?: string;
}

export const CTASlide: React.FC<CTASlideProps> = ({
  text,
  brandEmoji,
  accentColor = "#8B5CF6",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 150, mass: 0.8 },
  });

  const opacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 40,
        opacity,
      }}
    >
      {/* Large brand emoji */}
      <div
        style={{
          fontSize: 120,
          transform: `scale(${scale})`,
        }}
      >
        {brandEmoji}
      </div>

      {/* CTA text */}
      <div
        style={{
          fontSize: 52,
          fontWeight: 800,
          color: "#FFFFFF",
          textAlign: "center",
          maxWidth: "80%",
          lineHeight: 1.3,
          textShadow: "0 4px 20px rgba(0,0,0,0.5)",
        }}
      >
        {text}
      </div>

      {/* Accent bar */}
      <div
        style={{
          width: interpolate(scale, [0, 1], [0, 200]),
          height: 4,
          backgroundColor: accentColor,
          borderRadius: 2,
        }}
      />
    </div>
  );
};
