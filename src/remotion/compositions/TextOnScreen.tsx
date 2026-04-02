import React from "react";
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  interpolate,
  Audio,
  staticFile,
} from "remotion";
import { AnimatedText } from "../components/AnimatedText";
import { SceneTransition } from "../components/SceneTransition";
import { BrandWatermark } from "../components/BrandWatermark";
import { CaptionBar } from "../components/CaptionBar";
import { CTASlide } from "../components/CTASlide";
import type { VideoScene } from "../../lib/script-parser";

export interface TextOnScreenProps {
  scenes: VideoScene[];
  brandEmoji: string;
  brandName: string;
  accentColor: string;
  audioSrc?: string;
}

export const TextOnScreen: React.FC<TextOnScreenProps> = ({
  scenes,
  brandEmoji,
  brandName,
  accentColor,
  audioSrc,
}) => {
  const frame = useCurrentFrame();

  // Background gradient animation
  const gradientAngle = interpolate(frame, [0, 900], [135, 225], {
    extrapolateRight: "extend",
  });

  let currentFrame = 0;

  return (
    <AbsoluteFill>
      {/* Animated dark gradient background */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(${gradientAngle}deg, #0a0a0a 0%, #1a1a2e 40%, #16213e 70%, #0a0a0a 100%)`,
        }}
      />

      {/* Subtle grid pattern */}
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Brand watermark */}
      <BrandWatermark emoji={brandEmoji} name={brandName} position="top-right" />

      {/* Scenes */}
      {scenes.map((scene, i) => {
        const startFrame = currentFrame;
        currentFrame += scene.duration;

        if (scene.type === "cut") {
          return (
            <Sequence key={i} from={startFrame} durationInFrames={scene.duration}>
              <SceneTransition type="cut" />
            </Sequence>
          );
        }

        if (scene.type === "transition") {
          return (
            <Sequence key={i} from={startFrame} durationInFrames={scene.duration}>
              <SceneTransition type="fade" />
            </Sequence>
          );
        }

        if (scene.type === "cta") {
          return (
            <Sequence key={i} from={startFrame} durationInFrames={scene.duration}>
              <AbsoluteFill
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CTASlide
                  text={scene.text}
                  brandEmoji={brandEmoji}
                  accentColor={accentColor}
                />
              </AbsoluteFill>
            </Sequence>
          );
        }

        // hook, text_on_screen, narration
        return (
          <Sequence key={i} from={startFrame} durationInFrames={scene.duration}>
            <AbsoluteFill
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 60px",
              }}
            >
              <AnimatedText
                text={scene.text}
                style={scene.style}
                effect={scene.type === "hook" ? "word-by-word" : "fade"}
                accentColor={accentColor}
              />
            </AbsoluteFill>
            {/* Caption bar for narration scenes */}
            {scene.type === "narration" && (
              <CaptionBar text={scene.text} accentColor={accentColor} />
            )}
          </Sequence>
        );
      })}

      {/* Audio track */}
      {audioSrc && (
        <Audio src={audioSrc} />
      )}
    </AbsoluteFill>
  );
};
