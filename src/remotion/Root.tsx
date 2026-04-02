import React from "react";
import { Composition } from "remotion";
import { ViralReels } from "./compositions/ViralReels";
import { StoryMode } from "./compositions/StoryMode";
import { SplitComparison } from "./compositions/SplitComparison";
// Keep old compositions for backwards compat
import { TextOnScreen } from "./compositions/TextOnScreen";
import { StockFootage } from "./compositions/StockFootage";
import { SplitScreen } from "./compositions/SplitScreen";
import { Carousel } from "./compositions/Carousel";
import type { VideoScene } from "../lib/script-parser";

const FPS = 30;
const WIDTH = 1080;
const HEIGHT = 1920;

const defaultScenes: VideoScene[] = [
  { type: "hook", text: "Voce esta perdendo dinheiro todo dia", duration: 90, style: "large" },
  { type: "narration", text: "A maioria dos empreendedores ignora isso", duration: 75, style: "normal" },
  { type: "cut", text: "", duration: 3 },
  { type: "text_on_screen", text: "3 erros que custam caro", duration: 90, style: "large" },
  { type: "narration", text: "Primeiro: nao ter processo. Segundo: nao medir. Terceiro: nao ajustar.", duration: 120, style: "normal" },
  { type: "cta", text: "Salva esse video e comeca hoje!", duration: 90, style: "emphasis" },
];

const defaultProps = {
  scenes: defaultScenes,
  brandEmoji: "🚀",
  brandName: "Content Engine",
  accentColor: "#8B5CF6",
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* ---- NEW TEMPLATES ---- */}
      <Composition
        id="ViralReels"
        component={ViralReels as React.FC}
        durationInFrames={30 * FPS}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{
          ...defaultProps,
          audioSrc: undefined,
          stockVideoPaths: [],
        }}
      />

      <Composition
        id="StoryMode"
        component={StoryMode as React.FC}
        durationInFrames={30 * FPS}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{
          ...defaultProps,
          audioSrc: undefined,
          stockVideoPaths: [],
        }}
      />

      <Composition
        id="SplitComparison"
        component={SplitComparison as React.FC}
        durationInFrames={30 * FPS}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{
          ...defaultProps,
          audioSrc: undefined,
          stockVideoPaths: [],
        }}
      />

      {/* ---- LEGACY TEMPLATES (backwards compat) ---- */}
      <Composition
        id="TextOnScreen"
        component={TextOnScreen as React.FC}
        durationInFrames={30 * FPS}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{
          ...defaultProps,
          audioSrc: undefined,
        }}
      />

      <Composition
        id="StockFootage"
        component={StockFootage as React.FC}
        durationInFrames={30 * FPS}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{
          ...defaultProps,
          secondaryColor: "#EC4899",
          audioSrc: undefined,
        }}
      />

      <Composition
        id="SplitScreen"
        component={SplitScreen as React.FC}
        durationInFrames={30 * FPS}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{
          ...defaultProps,
          audioSrc: undefined,
        }}
      />

      <Composition
        id="Carousel"
        component={Carousel as React.FC}
        durationInFrames={30 * FPS}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={defaultProps}
      />
    </>
  );
};
