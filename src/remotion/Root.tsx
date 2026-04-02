import React from "react";
import { Composition } from "remotion";
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
      <Composition
        id="TextOnScreen"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        component={TextOnScreen as React.FC<any>}
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        component={StockFootage as React.FC<any>}
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        component={SplitScreen as React.FC<any>}
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        component={Carousel as React.FC<any>}
        durationInFrames={30 * FPS}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={defaultProps}
      />
    </>
  );
};
