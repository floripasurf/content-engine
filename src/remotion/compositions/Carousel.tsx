import React from "react";
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { AnimatedText } from "../components/AnimatedText";
import { BrandWatermark } from "../components/BrandWatermark";
import type { VideoScene } from "../../lib/script-parser";

export interface CarouselProps {
  scenes: VideoScene[];
  brandEmoji: string;
  brandName: string;
  accentColor: string;
}

const SLIDE_COLORS = [
  "linear-gradient(135deg, #1a1a2e, #16213e)",
  "linear-gradient(135deg, #0f3460, #1a1a2e)",
  "linear-gradient(135deg, #1a1a2e, #2d1b3d)",
  "linear-gradient(135deg, #1b2a1b, #1a1a2e)",
  "linear-gradient(135deg, #2a1b1b, #1a1a2e)",
  "linear-gradient(135deg, #1a1a2e, #1b2a3d)",
  "linear-gradient(135deg, #1a1a2e, #3d2a1b)",
];

export const Carousel: React.FC<CarouselProps> = ({
  scenes,
  brandEmoji,
  brandName,
  accentColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Filter out cuts/transitions, keep only content scenes
  const slides = scenes.filter(
    (s) => s.type !== "cut" && s.type !== "transition"
  );

  let currentFrame = 0;

  return (
    <AbsoluteFill>
      {slides.map((slide, i) => {
        const startFrame = currentFrame;
        currentFrame += slide.duration;
        const transitionDuration = 12; // frames for swipe

        return (
          <Sequence key={i} from={startFrame} durationInFrames={slide.duration}>
            <CarouselSlide
              text={slide.text}
              style={slide.style}
              slideIndex={i}
              totalSlides={slides.length}
              accentColor={accentColor}
              brandEmoji={brandEmoji}
              brandName={brandName}
              background={SLIDE_COLORS[i % SLIDE_COLORS.length]}
              isFirst={i === 0}
              isLast={i === slides.length - 1}
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

interface CarouselSlideProps {
  text: string;
  style?: "large" | "normal" | "emphasis";
  slideIndex: number;
  totalSlides: number;
  accentColor: string;
  brandEmoji: string;
  brandName: string;
  background: string;
  isFirst: boolean;
  isLast: boolean;
}

const CarouselSlide: React.FC<CarouselSlideProps> = ({
  text,
  style,
  slideIndex,
  totalSlides,
  accentColor,
  brandEmoji,
  brandName,
  background,
  isFirst,
  isLast,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Swipe-in animation
  const slideIn = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 120, mass: 0.8 },
  });
  const translateX = interpolate(slideIn, [0, 1], [1080, 0]);

  return (
    <AbsoluteFill
      style={{
        transform: `translateX(${translateX}px)`,
      }}
    >
      {/* Background */}
      <AbsoluteFill style={{ background }} />

      {/* Slide number indicator */}
      <div
        style={{
          position: "absolute",
          top: 60,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          gap: 8,
          zIndex: 10,
        }}
      >
        {Array.from({ length: totalSlides }).map((_, j) => (
          <div
            key={j}
            style={{
              width: j === slideIndex ? 32 : 8,
              height: 8,
              borderRadius: 4,
              backgroundColor:
                j === slideIndex ? accentColor : "rgba(255,255,255,0.2)",
              transition: "all 0.3s",
            }}
          />
        ))}
      </div>

      {/* Content */}
      <AbsoluteFill
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "120px 60px",
        }}
      >
        <AnimatedText
          text={text}
          style={style}
          effect={isFirst ? "word-by-word" : "fade"}
          accentColor={accentColor}
        />
      </AbsoluteFill>

      {/* Swipe hint on non-last slides */}
      {!isLast && (
        <div
          style={{
            position: "absolute",
            bottom: 80,
            left: 0,
            right: 0,
            textAlign: "center",
            fontSize: 18,
            color: "rgba(255,255,255,0.4)",
            fontWeight: 500,
          }}
        >
          Deslize para o lado &rarr;
        </div>
      )}

      <BrandWatermark emoji={brandEmoji} name={brandName} position="bottom-right" />
    </AbsoluteFill>
  );
};
