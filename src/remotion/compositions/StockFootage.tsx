import React from "react";
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  interpolate,
  Audio,
} from "remotion";
import { AnimatedText } from "../components/AnimatedText";
import { SceneTransition } from "../components/SceneTransition";
import { BrandWatermark } from "../components/BrandWatermark";
import { CaptionBar } from "../components/CaptionBar";
import { CTASlide } from "../components/CTASlide";
import type { VideoScene } from "../../lib/script-parser";

export interface StockFootageProps {
  scenes: VideoScene[];
  brandEmoji: string;
  brandName: string;
  accentColor: string;
  secondaryColor?: string;
  audioSrc?: string;
}

export const StockFootage: React.FC<StockFootageProps> = ({
  scenes,
  brandEmoji,
  brandName,
  accentColor,
  secondaryColor = "#EC4899",
  audioSrc,
}) => {
  const frame = useCurrentFrame();

  // Animated gradient as placeholder for stock footage
  const hue1 = interpolate(frame, [0, 600], [220, 280], {
    extrapolateRight: "extend",
  });
  const hue2 = interpolate(frame, [0, 600], [260, 320], {
    extrapolateRight: "extend",
  });

  let currentFrame = 0;

  return (
    <AbsoluteFill>
      {/* Background gradient placeholder (replace with <Video> for real stock) */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(135deg, hsl(${hue1}, 60%, 15%) 0%, hsl(${hue2}, 50%, 20%) 50%, hsl(${hue1 + 40}, 40%, 10%) 100%)`,
        }}
      />

      {/* Dark overlay for text readability */}
      <AbsoluteFill
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.55)",
        }}
      />

      {/* Gradient accent line at top */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(90deg, ${accentColor}, ${secondaryColor})`,
          zIndex: 10,
        }}
      />

      <BrandWatermark emoji={brandEmoji} name={brandName} position="bottom-right" />

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
              <SceneTransition type="swipe" />
            </Sequence>
          );
        }

        if (scene.type === "cta") {
          return (
            <Sequence key={i} from={startFrame} durationInFrames={scene.duration}>
              <CTASlide
                text={scene.text}
                brandEmoji={brandEmoji}
                accentColor={accentColor}
              />
            </Sequence>
          );
        }

        return (
          <Sequence key={i} from={startFrame} durationInFrames={scene.duration}>
            {/* Lower third style: text in bottom half */}
            <AbsoluteFill
              style={{
                display: "flex",
                alignItems: scene.type === "hook" ? "center" : "flex-end",
                justifyContent: "center",
                padding: scene.type === "hook" ? "0 60px" : "0 60px 250px",
              }}
            >
              <div
                style={{
                  background: "rgba(0,0,0,0.6)",
                  backdropFilter: "blur(8px)",
                  borderRadius: 20,
                  padding: "24px 36px",
                  borderLeft: `4px solid ${accentColor}`,
                  maxWidth: "90%",
                }}
              >
                <AnimatedText
                  text={scene.text}
                  style={scene.style}
                  effect={scene.type === "hook" ? "word-by-word" : "fade"}
                  accentColor={accentColor}
                />
              </div>
            </AbsoluteFill>
          </Sequence>
        );
      })}

      {audioSrc && <Audio src={audioSrc} />}
    </AbsoluteFill>
  );
};
