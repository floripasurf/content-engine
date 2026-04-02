import React from "react";
import { useCurrentFrame, interpolate } from "remotion";

interface SceneTransitionProps {
  type: "cut" | "fade" | "swipe";
}

export const SceneTransition: React.FC<SceneTransitionProps> = ({ type }) => {
  const frame = useCurrentFrame();

  if (type === "cut") {
    // Quick black frame
    const opacity = frame < 2 ? 1 : 0;
    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "#000",
          opacity,
          zIndex: 100,
        }}
      />
    );
  }

  if (type === "fade") {
    const opacity = interpolate(frame, [0, 7, 8, 15], [0, 1, 1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "#000",
          opacity,
          zIndex: 100,
        }}
      />
    );
  }

  // swipe
  const progress = interpolate(frame, [0, 15], [0, 100], {
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `linear-gradient(to right, #000 ${progress}%, transparent ${progress}%)`,
        zIndex: 100,
      }}
    />
  );
};
