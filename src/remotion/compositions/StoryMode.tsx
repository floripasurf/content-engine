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
import type { VideoScene } from "../../lib/script-parser";

export interface StoryModeProps {
  scenes: VideoScene[];
  brandEmoji: string;
  brandName: string;
  accentColor: string;
  audioSrc?: string;
  stockVideoPaths?: string[];
}

/**
 * StoryMode — Storytelling template.
 *
 * Full-screen stock footage background with:
 * - Subtitle-style captions at bottom (line by line)
 * - Emoji reactions at emotional moments
 * - WhatsApp message simulation for conversational parts
 * - Narrator style text reveal
 */
export const StoryMode: React.FC<StoryModeProps> = ({
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

  // Build timeline
  let currentFrame = 0;
  const timeline = scenes.map((scene) => {
    const start = currentFrame;
    currentFrame += scene.duration;
    return { ...scene, startFrame: start, endFrame: currentFrame };
  });

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

  // Detect if text looks like quoted speech (has quotes)
  const isConversational = (text: string) =>
    text.includes('"') || text.includes('"') || text.includes("'") || text.startsWith("Oi ") || text.startsWith("Ai ");

  return (
    <AbsoluteFill>
      {/* ---- BACKGROUND ---- */}
      {hasStock ? (
        stockVideoPaths.map((videoPath, i) => (
          <AbsoluteFill
            key={`stock-${i}`}
            style={{ opacity: i === stockIndex ? 1 : 0 }}
          >
            <OffthreadVideo
              src={videoPath}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              muted
            />
          </AbsoluteFill>
        ))
      ) : (
        <AnimatedGradientBG
          accentColor={accentColor}
          variant={2} // Cool teal for story mode
        />
      )}

      {/* Dark gradient overlay (stronger at bottom for subtitles) */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg,
            rgba(0,0,0,${hasStock ? 0.3 : 0.1}) 0%,
            rgba(0,0,0,${hasStock ? 0.4 : 0.15}) 50%,
            rgba(0,0,0,${hasStock ? 0.75 : 0.4}) 100%
          )`,
        }}
      />

      <ProgressBar accentColor={accentColor} />
      <BrandWatermark emoji={brandEmoji} name={brandName} position="top-right" />

      {/* ---- SCENE CONTENT ---- */}
      {timeline.map((scene, i) => {
        if (scene.type === "cut") {
          return (
            <Sequence key={i} from={scene.startFrame} durationInFrames={scene.duration}>
              <CutFlash />
            </Sequence>
          );
        }

        if (scene.type === "transition") {
          return (
            <Sequence key={i} from={scene.startFrame} durationInFrames={scene.duration}>
              <AbsoluteFill style={{ backgroundColor: "#000", opacity: 0.5, zIndex: 100 }} />
            </Sequence>
          );
        }

        if (scene.type === "text_on_screen") {
          return (
            <Sequence key={i} from={scene.startFrame} durationInFrames={scene.duration}>
              <StoryTextOverlay text={scene.text} accentColor={accentColor} />
            </Sequence>
          );
        }

        if (scene.type === "cta") {
          return (
            <Sequence key={i} from={scene.startFrame} durationInFrames={scene.duration}>
              <StoryCTA
                text={scene.text}
                brandEmoji={brandEmoji}
                brandName={brandName}
                accentColor={accentColor}
              />
            </Sequence>
          );
        }

        // Narration / hook
        const conversational = isConversational(scene.text);

        return (
          <Sequence key={i} from={scene.startFrame} durationInFrames={scene.duration}>
            {conversational ? (
              <WhatsAppBubble text={scene.text} isHook={scene.type === "hook"} />
            ) : (
              <SubtitleCaption
                text={scene.text}
                accentColor={scene.type === "hook" ? accentColor : "#FFFFFF"}
                isHook={scene.type === "hook"}
              />
            )}
          </Sequence>
        );
      })}

      {audioSrc && <Audio src={audioSrc} volume={1} />}
    </AbsoluteFill>
  );
};

// --- Sub-components ---

const CutFlash: React.FC = () => {
  const frame = useCurrentFrame();
  const flash = interpolate(frame, [0, 1, 3], [0, 1, 0], {
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill
      style={{ backgroundColor: "#FFFFFF", opacity: flash * 0.7, zIndex: 100 }}
    />
  );
};

const SubtitleCaption: React.FC<{
  text: string;
  accentColor: string;
  isHook: boolean;
}> = ({ text, accentColor, isHook }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Split into lines of ~8 words
  const words = text.split(/\s+/);
  const lines: string[] = [];
  for (let i = 0; i < words.length; i += 8) {
    lines.push(words.slice(i, i + 8).join(" "));
  }

  const lineDelay = isHook ? 8 : 12; // frames between lines

  return (
    <div
      style={{
        position: "absolute",
        bottom: isHook ? 400 : 180,
        left: 0,
        right: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        zIndex: 30,
        padding: "0 40px",
      }}
    >
      {lines.map((line, i) => {
        const lineFrame = frame - i * lineDelay;
        const appear = spring({
          frame: Math.max(0, lineFrame),
          fps,
          config: { damping: 18, stiffness: 200, mass: 0.4 },
        });

        const opacity = lineFrame < 0 ? 0 : interpolate(appear, [0, 1], [0, 1]);
        const y = interpolate(appear, [0, 1], [20, 0]);

        return (
          <div
            key={i}
            style={{
              opacity,
              transform: `translateY(${y}px)`,
              fontSize: isHook ? 64 : 52,
              fontWeight: 800,
              fontFamily: "system-ui, -apple-system, sans-serif",
              color: isHook ? accentColor : "#FFFFFF",
              textAlign: "center",
              textShadow: `
                -2px -2px 0 #000,
                2px -2px 0 #000,
                -2px 2px 0 #000,
                2px 2px 0 #000,
                0 4px 16px rgba(0,0,0,0.8)
              `,
              lineHeight: 1.3,
            }}
          >
            {line}
          </div>
        );
      })}
    </div>
  );
};

const WhatsAppBubble: React.FC<{
  text: string;
  isHook: boolean;
}> = ({ text, isHook }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const appear = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 180, mass: 0.5 },
  });

  const scale = interpolate(appear, [0, 1], [0.8, 1]);
  const opacity = interpolate(appear, [0, 1], [0, 1]);

  // Clean up quotes for display
  const displayText = text.replace(/[""]/g, "").trim();

  return (
    <div
      style={{
        position: "absolute",
        bottom: 200,
        left: 40,
        right: 40,
        display: "flex",
        justifyContent: "flex-start",
        zIndex: 30,
        transform: `scale(${scale})`,
        opacity,
      }}
    >
      <div
        style={{
          backgroundColor: "#DCF8C6",
          borderRadius: "20px 20px 20px 4px",
          padding: "20px 28px",
          maxWidth: "85%",
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        }}
      >
        <p
          style={{
            fontSize: isHook ? 44 : 38,
            fontWeight: 600,
            color: "#1a1a1a",
            lineHeight: 1.4,
            margin: 0,
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          {displayText}
        </p>
        <div
          style={{
            textAlign: "right",
            fontSize: 20,
            color: "#8a8a8a",
            marginTop: 8,
          }}
        >
          {isHook ? "agora" : "12:34"} ✓✓
        </div>
      </div>
    </div>
  );
};

const StoryTextOverlay: React.FC<{
  text: string;
  accentColor: string;
}> = ({ text, accentColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const appear = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 200, mass: 0.5 },
  });

  const scale = interpolate(appear, [0, 1], [0.85, 1]);
  const opacity = interpolate(appear, [0, 1], [0, 1]);

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 30,
      }}
    >
      <AbsoluteFill
        style={{
          backgroundColor: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(6px)",
        }}
      />
      <div
        style={{
          transform: `scale(${scale})`,
          opacity,
          backgroundColor: `${accentColor}20`,
          border: `3px solid ${accentColor}60`,
          borderRadius: 24,
          padding: "40px 50px",
          maxWidth: "85%",
        }}
      >
        <div
          style={{
            fontSize: 64,
            fontWeight: 900,
            fontFamily: "system-ui, -apple-system, sans-serif",
            color: "#FFFFFF",
            textAlign: "center",
            lineHeight: 1.2,
            textShadow: "0 4px 16px rgba(0,0,0,0.5)",
          }}
        >
          {text}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const StoryCTA: React.FC<{
  text: string;
  brandEmoji: string;
  brandName: string;
  accentColor: string;
}> = ({ text, brandEmoji, brandName, accentColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const appear = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 160, mass: 0.7 },
  });

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 30,
      }}
    >
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, rgba(0,0,0,0.6) 0%, ${accentColor}25 50%, rgba(0,0,0,0.7) 100%)`,
        }}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 36,
          opacity: interpolate(appear, [0, 1], [0, 1]),
          transform: `scale(${interpolate(appear, [0, 1], [0.85, 1])})`,
        }}
      >
        <div style={{ fontSize: 100 }}>{brandEmoji}</div>
        <div
          style={{
            fontSize: 52,
            fontWeight: 800,
            fontFamily: "system-ui, -apple-system, sans-serif",
            color: "#FFFFFF",
            textAlign: "center",
            maxWidth: "80%",
            lineHeight: 1.3,
            textShadow: "0 4px 20px rgba(0,0,0,0.5)",
          }}
        >
          {text}
        </div>
        <div style={{ width: 160, height: 3, backgroundColor: accentColor, borderRadius: 2 }} />
        <div style={{ fontSize: 28, color: "rgba(255,255,255,0.7)", letterSpacing: 2 }}>
          Link na bio
        </div>
      </div>
    </AbsoluteFill>
  );
};
