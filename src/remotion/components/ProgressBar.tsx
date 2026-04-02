import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";

interface ProgressBarProps {
  accentColor: string;
}

/**
 * Instagram stories-style progress bar at the top of the video.
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({ accentColor }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const progress = interpolate(frame, [0, durationInFrames], [0, 100], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 4,
        backgroundColor: "rgba(255,255,255,0.15)",
        zIndex: 60,
      }}
    >
      <div
        style={{
          width: `${progress}%`,
          height: "100%",
          backgroundColor: accentColor,
          borderRadius: "0 2px 2px 0",
          boxShadow: `0 0 8px ${accentColor}80`,
        }}
      />
    </div>
  );
};
