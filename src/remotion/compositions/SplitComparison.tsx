import React from "react";
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Audio,
  OffthreadVideo,
} from "remotion";
import { AnimatedGradientBG } from "../components/AnimatedGradientBG";
import { BrandWatermark } from "../components/BrandWatermark";
import { ProgressBar } from "../components/ProgressBar";
import { TikTokCaptions } from "../components/TikTokCaptions";
import type { VideoScene } from "../../lib/script-parser";

export interface SplitComparisonProps {
  scenes: VideoScene[];
  brandEmoji: string;
  brandName: string;
  accentColor: string;
  audioSrc?: string;
  stockVideoPaths?: string[];
}

/**
 * SplitComparison — Before/After template.
 *
 * First half (problem): Top section with red tint
 * Second half (solution): Bottom section with green/brand tint
 * Animated divider swipes to reveal full solution
 */
export const SplitComparison: React.FC<SplitComparisonProps> = ({
  scenes,
  brandEmoji,
  brandName,
  accentColor,
  audioSrc,
  stockVideoPaths = [],
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Split scenes: first half = problem, second half = solution
  const midpoint = Math.floor(scenes.length / 2);
  const problemScenes = scenes.slice(0, midpoint);
  const solutionScenes = scenes.slice(midpoint);

  const problemFrames = problemScenes.reduce((s, sc) => s + sc.duration, 0);

  // Transition progress: split view -> full solution
  const transitionStart = problemFrames - 10;
  const transitionEnd = problemFrames + 20;
  const splitProgress = interpolate(
    frame,
    [transitionStart, problemFrames, transitionEnd],
    [0, 0.5, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const isInProblemPhase = frame < problemFrames;
  const hasStock = stockVideoPaths.length > 0;

  // Build timelines
  let pFrame = 0;
  const problemTimeline = problemScenes.map((scene) => {
    const start = pFrame;
    pFrame += scene.duration;
    return { ...scene, startFrame: start, endFrame: pFrame };
  });

  let sFrame = problemFrames;
  const solutionTimeline = solutionScenes.map((scene) => {
    const start = sFrame;
    sFrame += scene.duration;
    return { ...scene, startFrame: start, endFrame: sFrame };
  });

  // Top half height
  const topHeight = interpolate(splitProgress, [0, 0.5, 1], [100, 50, 0]);
  const bottomTop = interpolate(splitProgress, [0, 0.5, 1], [100, 50, 0]);
  const bottomHeight = interpolate(splitProgress, [0, 0.5, 1], [0, 50, 100]);

  return (
    <AbsoluteFill>
      {/* ---- PROBLEM SIDE (TOP) ---- */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: `${topHeight}%`,
          overflow: "hidden",
        }}
      >
        {/* Background */}
        {hasStock && stockVideoPaths[0] ? (
          <AbsoluteFill>
            <OffthreadVideo
              src={stockVideoPaths[0]}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              muted
            />
          </AbsoluteFill>
        ) : (
          <AnimatedGradientBG accentColor="#EF4444" variant={1} />
        )}

        {/* Red tint overlay */}
        <AbsoluteFill style={{ backgroundColor: "rgba(220, 38, 38, 0.15)" }} />
        <AbsoluteFill style={{ backgroundColor: "rgba(0, 0, 0, 0.45)" }} />

        {/* "PROBLEMA" label */}
        <div
          style={{
            position: "absolute",
            top: 60,
            left: 0,
            right: 0,
            textAlign: "center",
            zIndex: 20,
            opacity: splitProgress < 0.5 ? 1 : 0,
          }}
        >
          <span
            style={{
              fontSize: 28,
              fontWeight: 800,
              fontFamily: "system-ui, -apple-system, sans-serif",
              color: "#EF4444",
              letterSpacing: 6,
              textTransform: "uppercase",
              textShadow: "0 2px 8px rgba(0,0,0,0.5)",
              backgroundColor: "rgba(0,0,0,0.4)",
              padding: "8px 24px",
              borderRadius: 8,
            }}
          >
            PROBLEMA
          </span>
        </div>

        {/* Problem scenes */}
        {problemTimeline.map((scene, i) => (
          <Sequence key={`p-${i}`} from={scene.startFrame} durationInFrames={scene.duration}>
            <SceneContent scene={scene} accentColor="#EF4444" isTop />
          </Sequence>
        ))}
      </div>

      {/* ---- DIVIDER LINE ---- */}
      {splitProgress > 0 && splitProgress < 1 && (
        <div
          style={{
            position: "absolute",
            top: `${bottomTop}%`,
            left: 0,
            right: 0,
            height: 4,
            background: `linear-gradient(90deg, #EF4444, ${accentColor}, #22C55E)`,
            zIndex: 50,
            boxShadow: "0 0 20px rgba(255,255,255,0.3)",
          }}
        />
      )}

      {/* ---- SOLUTION SIDE (BOTTOM) ---- */}
      <div
        style={{
          position: "absolute",
          top: `${bottomTop}%`,
          left: 0,
          right: 0,
          height: `${bottomHeight}%`,
          overflow: "hidden",
        }}
      >
        {/* Background */}
        {hasStock && stockVideoPaths[1] ? (
          <AbsoluteFill>
            <OffthreadVideo
              src={stockVideoPaths[1]}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              muted
            />
          </AbsoluteFill>
        ) : (
          <AnimatedGradientBG accentColor="#22C55E" variant={2} />
        )}

        {/* Green tint overlay */}
        <AbsoluteFill style={{ backgroundColor: "rgba(34, 197, 94, 0.12)" }} />
        <AbsoluteFill style={{ backgroundColor: "rgba(0, 0, 0, 0.40)" }} />

        {/* "SOLUCAO" label */}
        <div
          style={{
            position: "absolute",
            top: 40,
            left: 0,
            right: 0,
            textAlign: "center",
            zIndex: 20,
            opacity: splitProgress > 0.3 ? 1 : 0,
          }}
        >
          <span
            style={{
              fontSize: 28,
              fontWeight: 800,
              fontFamily: "system-ui, -apple-system, sans-serif",
              color: "#22C55E",
              letterSpacing: 6,
              textTransform: "uppercase",
              textShadow: "0 2px 8px rgba(0,0,0,0.5)",
              backgroundColor: "rgba(0,0,0,0.4)",
              padding: "8px 24px",
              borderRadius: 8,
            }}
          >
            SOLUCAO
          </span>
        </div>

        {/* Solution scenes */}
        {solutionTimeline.map((scene, i) => (
          <Sequence key={`s-${i}`} from={scene.startFrame} durationInFrames={scene.duration}>
            <SceneContent scene={scene} accentColor="#22C55E" isTop={false} />
          </Sequence>
        ))}
      </div>

      {/* ---- OVERLAYS ---- */}
      <ProgressBar accentColor={accentColor} />
      <BrandWatermark emoji={brandEmoji} name={brandName} position="top-right" />

      {audioSrc && <Audio src={audioSrc} volume={1} />}
    </AbsoluteFill>
  );
};

// --- Scene content renderer ---

const SceneContent: React.FC<{
  scene: VideoScene & { startFrame: number; endFrame: number };
  accentColor: string;
  isTop: boolean;
}> = ({ scene, accentColor, isTop }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (scene.type === "cut") {
    const flash = interpolate(frame, [0, 1, 3], [0, 0.8, 0], {
      extrapolateRight: "clamp",
    });
    return (
      <AbsoluteFill style={{ backgroundColor: "#000", opacity: flash, zIndex: 100 }} />
    );
  }

  if (scene.type === "text_on_screen") {
    const appear = spring({
      frame,
      fps,
      config: { damping: 15, stiffness: 200, mass: 0.5 },
    });
    return (
      <AbsoluteFill
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px",
          zIndex: 10,
        }}
      >
        <div
          style={{
            fontSize: 56,
            fontWeight: 900,
            fontFamily: "system-ui, -apple-system, sans-serif",
            color: "#FFFFFF",
            textAlign: "center",
            lineHeight: 1.2,
            opacity: interpolate(appear, [0, 1], [0, 1]),
            transform: `scale(${interpolate(appear, [0, 1], [0.85, 1])})`,
            textShadow: `
              -2px -2px 0 #000, 2px -2px 0 #000,
              -2px 2px 0 #000, 2px 2px 0 #000,
              0 0 20px ${accentColor}40
            `,
          }}
        >
          {scene.text}
        </div>
      </AbsoluteFill>
    );
  }

  if (scene.type === "cta") {
    const appear = spring({
      frame,
      fps,
      config: { damping: 14, stiffness: 160, mass: 0.6 },
    });
    return (
      <AbsoluteFill
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px",
          zIndex: 10,
        }}
      >
        <div
          style={{
            fontSize: 48,
            fontWeight: 800,
            fontFamily: "system-ui, -apple-system, sans-serif",
            color: accentColor,
            textAlign: "center",
            lineHeight: 1.3,
            opacity: interpolate(appear, [0, 1], [0, 1]),
            textShadow: "0 4px 16px rgba(0,0,0,0.6)",
          }}
        >
          {scene.text}
        </div>
      </AbsoluteFill>
    );
  }

  // narration / hook
  return (
    <AbsoluteFill
      style={{
        display: "flex",
        alignItems: isTop ? "center" : "center",
        justifyContent: "center",
        padding: `${isTop ? 100 : 60}px 50px 50px`,
        zIndex: 10,
      }}
    >
      <TikTokCaptions
        text={scene.text}
        accentColor={accentColor}
        wordsPerChunk={5}
      />
    </AbsoluteFill>
  );
};
