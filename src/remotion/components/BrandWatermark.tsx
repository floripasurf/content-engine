import React from "react";

interface BrandWatermarkProps {
  emoji: string;
  name: string;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

export const BrandWatermark: React.FC<BrandWatermarkProps> = ({
  emoji,
  name,
  position = "top-right",
}) => {
  const posStyle: React.CSSProperties = {};
  if (position.includes("top")) posStyle.top = 40;
  if (position.includes("bottom")) posStyle.bottom = 40;
  if (position.includes("left")) posStyle.left = 40;
  if (position.includes("right")) posStyle.right = 40;

  return (
    <div
      style={{
        position: "absolute",
        ...posStyle,
        display: "flex",
        alignItems: "center",
        gap: 8,
        opacity: 0.5,
        zIndex: 50,
      }}
    >
      <span style={{ fontSize: 28 }}>{emoji}</span>
      <span
        style={{
          fontSize: 16,
          color: "#FFFFFF",
          fontWeight: 600,
          letterSpacing: 1,
          textTransform: "uppercase",
        }}
      >
        {name}
      </span>
    </div>
  );
};
