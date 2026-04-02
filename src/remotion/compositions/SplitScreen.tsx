import React from "react";
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Audio,
} from "remotion";
import { AnimatedText } from "../components/AnimatedText";
import { BrandWatermark } from "../components/BrandWatermark";
import { CTASlide } from "../components/CTASlide";
import type { VideoScene } from "../../lib/script-parser";

export interface SplitScreenProps {
  scenes: VideoScene[];
  brandEmoji: string;
  brandName: string;
  accentColor: string;
  audioSrc?: string;
}

/**
 * Split-screen template for before/after, problem/solution content.
 * Divides scenes into two halves: "problema" (top, red) and "solucao" (bottom, green).
 */
export const SplitScreen: React.FC<SplitScreenProps> = ({
  scenes,
  brandEmoji,
  brandName,
  accentColor,
  audioSrc,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Split scenes: first half = problem, second half = solution
  const midpoint = Math.floor(scenes.length / 2);
  const problemScenes = scenes.slice(0, midpoint);
  const solutionScenes = scenes.slice(midpoint);

  const problemFrames = problemScenes.reduce((s, sc) => s + sc.duration, 0);
  const totalFrames = durationInFrames;

  // Transition from split to full at midpoint
  const splitProgress = interpolate(
    frame,
    [problemFrames - 15, problemFrames, problemFrames + 15],
    [0, 0.5, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  let problemFrame = 0;
  let solutionFrame = 0;

  return (
    <AbsoluteFill>
      {/* Problem side (top half / full when active) */}
      <AbsoluteFill
        style={{
          height: interpolate(splitProgress, [0, 0.5, 1], [100, 50, 0]).toString() + "%",
          overflow: "hidden",
          background: "linear-gradient(180deg, #1a0a0a 0%, #2a1515 100%)",
        }}
      >
        {/* Red tint */}
        <AbsoluteFill style={{ backgroundColor: "rgba(220, 38, 38, 0.08)" }} />

        {/* Label */}
        <div
          style={{
            position: "absolute",
            top: 100,
            left: 0,
            right: 0,
            textAlign: "center",
            fontSize: 24,
            fontWeight: 700,
            color: "#EF4444",
            letterSpacing: 4,
            textTransform: "uppercase",
            opacity: splitProgress < 0.5 ? 1 : 0,
          }}
        >
          PROBLEMA
        </div>

        {problemScenes.map((scene, i) => {
          const startFrame = problemFrame;
          problemFrame += scene.duration;

          if (scene.type === "cta") {
            return (
              <Sequence key={`p-${i}`} from={startFrame} durationInFrames={scene.duration}>
                <CTASlide text={scene.text} brandEmoji={brandEmoji} accentColor="#EF4444" />
              </Sequence>
            );
          }

          return (
            <Sequence key={`p-${i}`} from={startFrame} durationInFrames={scene.duration}>
              <AbsoluteFill
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "140px 60px 60px",
                }}
              >
                <AnimatedText
                  text={scene.text}
                  style={scene.style}
                  effect="word-by-word"
                  accentColor="#EF4444"
                />
              </AbsoluteFill>
            </Sequence>
          );
        })}
      </AbsoluteFill>

      {/* Solution side (bottom half / full when active) */}
      <AbsoluteFill
        style={{
          top: interpolate(splitProgress, [0, 0.5, 1], [100, 50, 0]).toString() + "%",
          height: interpolate(splitProgress, [0, 0.5, 1], [0, 50, 100]).toString() + "%",
          overflow: "hidden",
          background: "linear-gradient(180deg, #0a1a0a 0%, #152a15 100%)",
        }}
      >
        {/* Green tint */}
        <AbsoluteFill style={{ backgroundColor: "rgba(34, 197, 94, 0.08)" }} />

        {/* Label */}
        <div
          style={{
            position: "absolute",
            top: 40,
            left: 0,
            right: 0,
            textAlign: "center",
            fontSize: 24,
            fontWeight: 700,
            color: "#22C55E",
            letterSpacing: 4,
            textTransform: "uppercase",
            opacity: splitProgress > 0.5 ? 1 : 0,
          }}
        >
          SOLUCAO
        </div>

        {solutionScenes.map((scene, i) => {
          const startFrame = problemFrames + solutionFrame;
          solutionFrame += scene.duration;

          if (scene.type === "cta") {
            return (
              <Sequence key={`s-${i}`} from={startFrame} durationInFrames={scene.duration}>
                <CTASlide text={scene.text} brandEmoji={brandEmoji} accentColor="#22C55E" />
              </Sequence>
            );
          }

          return (
            <Sequence key={`s-${i}`} from={startFrame} durationInFrames={scene.duration}>
              <AbsoluteFill
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "100px 60px 60px",
                }}
              >
                <AnimatedText
                  text={scene.text}
                  style={scene.style}
                  effect="word-by-word"
                  accentColor="#22C55E"
                />
              </AbsoluteFill>
            </Sequence>
          );
        })}
      </AbsoluteFill>

      {/* Divider line at split point */}
      {splitProgress > 0 && splitProgress < 1 && (
        <div
          style={{
            position: "absolute",
            top: `${interpolate(splitProgress, [0, 0.5, 1], [100, 50, 0])}%`,
            left: 0,
            right: 0,
            height: 3,
            background: `linear-gradient(90deg, #EF4444, ${accentColor}, #22C55E)`,
            zIndex: 20,
          }}
        />
      )}

      <BrandWatermark emoji={brandEmoji} name={brandName} position="top-right" />

      {audioSrc && <Audio src={audioSrc} />}
    </AbsoluteFill>
  );
};
