import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";

interface AnimatedTextProps {
  text: string;
  style?: "large" | "normal" | "emphasis";
  effect?: "word-by-word" | "typewriter" | "fade";
  accentColor?: string;
}

export const AnimatedText: React.FC<AnimatedTextProps> = ({
  text,
  style = "normal",
  effect = "word-by-word",
  accentColor = "#8B5CF6",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fontSize =
    style === "large" ? 72 : style === "emphasis" ? 60 : 48;

  const words = text.split(/\s+/);

  if (effect === "fade") {
    const opacity = interpolate(frame, [0, 15], [0, 1], {
      extrapolateRight: "clamp",
    });
    const y = interpolate(frame, [0, 15], [30, 0], {
      extrapolateRight: "clamp",
    });
    return (
      <div
        style={{
          opacity,
          transform: `translateY(${y}px)`,
          fontSize,
          fontWeight: style === "normal" ? 600 : 800,
          color: "#FFFFFF",
          textAlign: "center",
          lineHeight: 1.3,
          maxWidth: "90%",
          textShadow: "0 4px 20px rgba(0,0,0,0.5)",
        }}
      >
        {text}
      </div>
    );
  }

  if (effect === "typewriter") {
    const charsToShow = Math.floor(
      interpolate(frame, [0, text.length * 1.2], [0, text.length], {
        extrapolateRight: "clamp",
      })
    );
    return (
      <div
        style={{
          fontSize,
          fontWeight: style === "normal" ? 600 : 800,
          color: "#FFFFFF",
          textAlign: "center",
          lineHeight: 1.3,
          maxWidth: "90%",
          textShadow: "0 4px 20px rgba(0,0,0,0.5)",
        }}
      >
        {text.slice(0, charsToShow)}
        <span
          style={{
            opacity: frame % 20 < 10 ? 1 : 0,
            color: accentColor,
          }}
        >
          |
        </span>
      </div>
    );
  }

  // word-by-word (default)
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "8px 12px",
        maxWidth: "90%",
        lineHeight: 1.3,
      }}
    >
      {words.map((word, i) => {
        const delay = i * 3; // 3 frames between each word
        const s = spring({
          frame: frame - delay,
          fps,
          config: { damping: 15, stiffness: 200, mass: 0.5 },
        });
        const opacity = interpolate(s, [0, 1], [0, 1]);
        const y = interpolate(s, [0, 1], [20, 0]);

        // Highlight keywords in brackets or ALL CAPS
        const isHighlight =
          word.startsWith("*") || word === word.toUpperCase() && word.length > 2;

        return (
          <span
            key={i}
            style={{
              opacity,
              transform: `translateY(${y}px)`,
              fontSize,
              fontWeight: isHighlight ? 900 : style === "normal" ? 600 : 800,
              color: isHighlight ? accentColor : "#FFFFFF",
              textShadow: "0 4px 20px rgba(0,0,0,0.5)",
              display: "inline-block",
            }}
          >
            {word.replace(/^\*|\*$/g, "")}
          </span>
        );
      })}
    </div>
  );
};
