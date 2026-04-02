import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";

interface TikTokCaptionsProps {
  text: string;
  accentColor: string;
  wordsPerChunk?: number;
}

/**
 * TikTok-style animated captions.
 * Shows 5-7 words at a time with word-by-word highlight in brand color.
 * Current word scales up slightly for emphasis.
 */
export const TikTokCaptions: React.FC<TikTokCaptionsProps> = ({
  text,
  accentColor,
  wordsPerChunk = 6,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return null;

  // Calculate timing: each word gets ~6 frames (~0.2s)
  const framesPerWord = 6;
  const currentWordIndex = Math.min(
    Math.floor(frame / framesPerWord),
    words.length - 1
  );

  // Which chunk of words to show
  const chunkIndex = Math.floor(currentWordIndex / wordsPerChunk);
  const chunkStart = chunkIndex * wordsPerChunk;
  const chunkEnd = Math.min(chunkStart + wordsPerChunk, words.length);
  const visibleWords = words.slice(chunkStart, chunkEnd);

  // Spring animation for chunk appearance
  const chunkAppear = spring({
    frame: frame - chunkStart * framesPerWord,
    fps,
    config: { damping: 20, stiffness: 200, mass: 0.4 },
  });

  const containerY = interpolate(chunkAppear, [0, 1], [30, 0]);
  const containerOpacity = interpolate(chunkAppear, [0, 1], [0, 1]);

  return (
    <div
      style={{
        position: "absolute",
        bottom: 200,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        zIndex: 40,
        transform: `translateY(${containerY}px)`,
        opacity: containerOpacity,
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "6px 10px",
          maxWidth: "85%",
          padding: "12px 20px",
        }}
      >
        {visibleWords.map((word, i) => {
          const globalIndex = chunkStart + i;
          const isCurrentWord = globalIndex === currentWordIndex;
          const isPastWord = globalIndex < currentWordIndex;

          const wordScale = isCurrentWord
            ? interpolate(
                (frame - globalIndex * framesPerWord) % framesPerWord,
                [0, 3, 6],
                [1.0, 1.15, 1.05],
                { extrapolateRight: "clamp" }
              )
            : 1;

          const wordColor = isCurrentWord || isPastWord ? accentColor : "#FFFFFF";

          return (
            <span
              key={`${chunkIndex}-${i}`}
              style={{
                fontSize: 64,
                fontWeight: 800,
                fontFamily: "system-ui, -apple-system, sans-serif",
                color: wordColor,
                transform: `scale(${wordScale})`,
                display: "inline-block",
                textShadow: `
                  -2px -2px 0 #000,
                  2px -2px 0 #000,
                  -2px 2px 0 #000,
                  2px 2px 0 #000,
                  0 4px 12px rgba(0,0,0,0.8)
                `,
                transition: "color 0.05s",
              }}
            >
              {word}
            </span>
          );
        })}
      </div>
    </div>
  );
};
