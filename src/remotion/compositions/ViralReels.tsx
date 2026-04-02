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
  staticFile,
} from "remotion";
import { TikTokCaptions } from "../components/TikTokCaptions";
import { AnimatedGradientBG } from "../components/AnimatedGradientBG";
import { BrandWatermark } from "../components/BrandWatermark";
import { ProgressBar } from "../components/ProgressBar";
import type { VideoScene } from "../../lib/script-parser";

export interface ViralReelsProps {
  scenes: VideoScene[];
  brandEmoji: string;
  brandName: string;
  accentColor: string;
  audioSrc?: string;
  stockVideoPaths?: string[]; // absolute paths to downloaded stock videos
}

/**
 * ViralReels — Main TikTok/Reels-style composition.
 *
 * Features:
 * - Stock video backgrounds cycling per scene (or animated gradient fallback)
 * - Dark overlay for text readability
 * - TikTok-style word-by-word captions
 * - [TEXTO NA TELA] as full-screen large text with blur
 * - [CORTE] as quick zoom + flash
 * - Progress bar at top
 * - Brand watermark
 * - CTA end card
 */
export const ViralReels: React.FC<ViralReelsProps> = ({
  scenes,
  brandEmoji,
  brandName,
  accentColor,
  audioSrc,
  stockVideoPaths = [],
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const hasStock = stockVideoPaths.length > 0;

  // Build scene timeline
  let currentFrame = 0;
  const timeline = scenes.map((scene) => {
    const start = currentFrame;
    currentFrame += scene.duration;
    return { ...scene, startFrame: start, endFrame: currentFrame };
  });

  // Figure out which "visual segment" (non-cut scenes) we're on, for cycling stock
  const visualScenes = timeline.filter(
    (s) => s.type !== "cut" && s.type !== "transition"
  );
  const currentVisualIndex = visualScenes.findIndex(
    (s) => frame >= s.startFrame && frame < s.endFrame
  );
  const stockIndex =
    currentVisualIndex >= 0
      ? currentVisualIndex % Math.max(stockVideoPaths.length, 1)
      : 0;

  return (
    <AbsoluteFill>
      {/* ---- BACKGROUND LAYER ---- */}
      {hasStock ? (
        // Stock video background: cycle through available clips
        stockVideoPaths.map((videoPath, i) => {
          const isActive = i === stockIndex;
          return (
            <AbsoluteFill
              key={`stock-${i}`}
              style={{
                opacity: isActive ? 1 : 0,
              }}
            >
              <OffthreadVideo
                src={videoPath}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
                muted
              />
            </AbsoluteFill>
          );
        })
      ) : (
        // Animated gradient fallback (changes variant per scene)
        <AnimatedGradientBG
          accentColor={accentColor}
          variant={currentVisualIndex >= 0 ? currentVisualIndex % 4 : 0}
        />
      )}

      {/* Dark overlay for text readability */}
      <AbsoluteFill
        style={{
          backgroundColor: hasStock
            ? "rgba(0, 0, 0, 0.50)"
            : "rgba(0, 0, 0, 0.20)",
        }}
      />

      {/* ---- PROGRESS BAR ---- */}
      <ProgressBar accentColor={accentColor} />

      {/* ---- BRAND WATERMARK ---- */}
      <BrandWatermark emoji={brandEmoji} name={brandName} position="top-right" />

      {/* ---- SCENE CONTENT ---- */}
      {timeline.map((scene, i) => {
        if (scene.type === "cut") {
          return (
            <Sequence
              key={i}
              from={scene.startFrame}
              durationInFrames={scene.duration}
            >
              <CutTransition accentColor={accentColor} />
            </Sequence>
          );
        }

        if (scene.type === "transition") {
          return (
            <Sequence
              key={i}
              from={scene.startFrame}
              durationInFrames={scene.duration}
            >
              <FadeTransition />
            </Sequence>
          );
        }

        if (scene.type === "text_on_screen") {
          return (
            <Sequence
              key={i}
              from={scene.startFrame}
              durationInFrames={scene.duration}
            >
              <FullScreenText
                text={scene.text}
                accentColor={accentColor}
              />
            </Sequence>
          );
        }

        if (scene.type === "cta") {
          return (
            <Sequence
              key={i}
              from={scene.startFrame}
              durationInFrames={scene.duration}
            >
              <CTAEndCard
                text={scene.text}
                brandEmoji={brandEmoji}
                brandName={brandName}
                accentColor={accentColor}
              />
            </Sequence>
          );
        }

        // hook + narration: TikTok-style captions
        return (
          <Sequence
            key={i}
            from={scene.startFrame}
            durationInFrames={scene.duration}
          >
            <TikTokCaptions
              text={scene.text}
              accentColor={scene.type === "hook" ? accentColor : "#FFFFFF"}
              wordsPerChunk={scene.type === "hook" ? 4 : 6}
            />
          </Sequence>
        );
      })}

      {/* ---- AUDIO TRACK ---- */}
      {audioSrc && <Audio src={audioSrc} volume={1} />}
    </AbsoluteFill>
  );
};

// --- Sub-components ---

const CutTransition: React.FC<{ accentColor: string }> = ({ accentColor }) => {
  const frame = useCurrentFrame();
  // Quick flash + zoom effect
  const flash = interpolate(frame, [0, 1, 3], [0, 0.9, 0], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: accentColor,
        opacity: flash,
        zIndex: 100,
      }}
    />
  );
};

const FadeTransition: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 7, 8, 15], [0, 0.8, 0.8, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#000",
        opacity,
        zIndex: 100,
      }}
    />
  );
};

const FullScreenText: React.FC<{
  text: string;
  accentColor: string;
}> = ({ text, accentColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scaleSpring = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 180, mass: 0.6 },
  });

  const scale = interpolate(scaleSpring, [0, 1], [0.7, 1]);
  const opacity = interpolate(scaleSpring, [0, 1], [0, 1]);

  // Subtle background blur effect
  return (
    <AbsoluteFill
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 30,
      }}
    >
      {/* Blur/darken background extra */}
      <AbsoluteFill
        style={{
          backgroundColor: "rgba(0,0,0,0.4)",
          backdropFilter: "blur(8px)",
        }}
      />

      <div
        style={{
          transform: `scale(${scale})`,
          opacity,
          fontSize: 72,
          fontWeight: 900,
          fontFamily: "system-ui, -apple-system, sans-serif",
          color: "#FFFFFF",
          textAlign: "center",
          lineHeight: 1.2,
          maxWidth: "85%",
          padding: "40px",
          textShadow: `
            -2px -2px 0 #000,
            2px -2px 0 #000,
            -2px 2px 0 #000,
            2px 2px 0 #000,
            0 0 40px ${accentColor}60
          `,
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};

const CTAEndCard: React.FC<{
  text: string;
  brandEmoji: string;
  brandName: string;
  accentColor: string;
}> = ({ text, brandEmoji, brandName, accentColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cardSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 160, mass: 0.7 },
  });

  const scale = interpolate(cardSpring, [0, 1], [0.8, 1]);
  const opacity = interpolate(cardSpring, [0, 1], [0, 1]);

  // Pulsing glow on the accent bar
  const glowPulse = interpolate(
    Math.sin(frame * 0.1),
    [-1, 1],
    [0.4, 1]
  );

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 30,
      }}
    >
      {/* Branded background */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, rgba(0,0,0,0.7) 0%, ${accentColor}30 50%, rgba(0,0,0,0.8) 100%)`,
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 40,
          transform: `scale(${scale})`,
          opacity,
          padding: "60px",
        }}
      >
        {/* Brand emoji large */}
        <div style={{ fontSize: 120 }}>{brandEmoji}</div>

        {/* CTA text */}
        <div
          style={{
            fontSize: 56,
            fontWeight: 800,
            fontFamily: "system-ui, -apple-system, sans-serif",
            color: "#FFFFFF",
            textAlign: "center",
            lineHeight: 1.3,
            maxWidth: "85%",
            textShadow: "0 4px 20px rgba(0,0,0,0.6)",
          }}
        >
          {text}
        </div>

        {/* Accent divider */}
        <div
          style={{
            width: 200,
            height: 4,
            backgroundColor: accentColor,
            borderRadius: 2,
            boxShadow: `0 0 ${20 * glowPulse}px ${accentColor}`,
          }}
        />

        {/* Link na bio text */}
        <div
          style={{
            fontSize: 32,
            fontWeight: 600,
            color: "rgba(255,255,255,0.8)",
            letterSpacing: 2,
          }}
        >
          Link na bio
        </div>

        {/* Brand name */}
        <div
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: accentColor,
            letterSpacing: 3,
            textTransform: "uppercase",
          }}
        >
          {brandName}
        </div>
      </div>
    </AbsoluteFill>
  );
};
