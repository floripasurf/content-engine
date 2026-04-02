import React from "react";
import { useCurrentFrame, interpolate } from "remotion";

interface CaptionBarProps {
  text: string;
  accentColor?: string;
}

export const CaptionBar: React.FC<CaptionBarProps> = ({
  text,
  accentColor = "#8B5CF6",
}) => {
  const frame = useCurrentFrame();

  const slideIn = interpolate(frame, [0, 10], [100, 0], {
    extrapolateRight: "clamp",
  });

  const words = text.split(/\s+/);
  // Highlight current word based on frame
  const wordsPerFrame = words.length / 90; // assume ~3 seconds for caption
  const currentWordIdx = Math.min(
    Math.floor(frame * wordsPerFrame),
    words.length - 1
  );

  return (
    <div
      style={{
        position: "absolute",
        bottom: 120,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        transform: `translateY(${slideIn}%)`,
        zIndex: 40,
      }}
    >
      <div
        style={{
          background: "rgba(0,0,0,0.75)",
          backdropFilter: "blur(10px)",
          borderRadius: 16,
          padding: "16px 28px",
          maxWidth: "85%",
        }}
      >
        <p
          style={{
            fontSize: 32,
            fontWeight: 700,
            color: "#FFFFFF",
            textAlign: "center",
            lineHeight: 1.4,
            margin: 0,
          }}
        >
          {words.map((word, i) => (
            <span
              key={i}
              style={{
                color: i <= currentWordIdx ? accentColor : "#FFFFFF",
                transition: "color 0.1s",
              }}
            >
              {word}{" "}
            </span>
          ))}
        </p>
      </div>
    </div>
  );
};
