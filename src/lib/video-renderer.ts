import path from "path";
import fs from "fs";
import { parseScript, buildVoiceoverText } from "./script-parser";
import { generateVoiceover, VoiceOption, VoiceProvider } from "./tts";
import { getJob, setJob, type RenderJob } from "./render-jobs";
import type { Script, Brand } from "./types";
import type { VideoScene } from "./script-parser";

export type TemplateId =
  | "ViralReels"
  | "StoryMode"
  | "SplitComparison"
  // Legacy
  | "TextOnScreen"
  | "StockFootage"
  | "SplitScreen"
  | "Carousel";

export interface RenderJobInput {
  script: Pick<Script, "hook" | "body" | "duration" | "title">;
  brand: Pick<Brand, "name" | "logoEmoji" | "colors" | "slug">;
  template: TemplateId;
  voice: VoiceOption;
  voiceProvider?: VoiceProvider;
  outputDir: string;
}

export interface RenderJobResult {
  videoPath: string;
  audioPath: string | null;
  durationSeconds: number;
}

const FPS = 30;
const WIDTH = 1080;
const HEIGHT = 1920;

export async function startRenderJob(input: RenderJobInput): Promise<string> {
  const jobId = `render_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const job: RenderJob = {
    id: jobId,
    status: "queued",
    progress: 0,
    createdAt: new Date().toISOString(),
  };
  setJob(jobId, job);

  renderInBackground(jobId, input).catch((err) => {
    const j = getJob(jobId);
    if (j) {
      j.status = "error";
      j.error = err instanceof Error ? err.message : String(err);
    }
  });

  return jobId;
}

async function renderInBackground(
  jobId: string,
  input: RenderJobInput
): Promise<void> {
  const job = getJob(jobId)!;
  job.status = "rendering";
  job.progress = 0;

  const { script, brand, template, voice, voiceProvider, outputDir } = input;

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 1. Parse script into scenes
  job.progress = 5;
  const scenes: VideoScene[] = parseScript({
    hook: script.hook,
    body: script.body,
    duration: script.duration,
  });

  // 2. Generate TTS audio FIRST (before bundling)
  job.progress = 10;
  const publicAudioDir = path.resolve(process.cwd(), "public/audio");
  if (!fs.existsSync(publicAudioDir)) {
    fs.mkdirSync(publicAudioDir, { recursive: true });
  }

  let audioFilename: string | null = null;
  let audioOutputPath: string | null = null;
  try {
    const voText = buildVoiceoverText({ hook: script.hook, body: script.body });
    audioFilename = `${jobId}.mp3`;
    const publicAudioPath = path.join(publicAudioDir, audioFilename);
    await generateVoiceover(voText, publicAudioPath, voice, voiceProvider);
    audioOutputPath = path.join(outputDir, audioFilename);
    fs.copyFileSync(publicAudioPath, audioOutputPath);
  } catch (err) {
    console.warn("[render] TTS failed, continuing without audio:", err);
    audioFilename = null;
  }
  job.progress = 25;

  // 3. Dynamic import to avoid Turbopack bundling these heavy Node.js packages
  const { bundle } = await import("@remotion/bundler");
  const { renderMedia, selectComposition } = await import("@remotion/renderer");

  // 4. Bundle Remotion project
  const entryPoint = path.resolve(process.cwd(), "src/remotion/index.ts");
  const bundleLocation = await bundle({
    entryPoint,
    webpackOverride: (config) => config,
  });

  // 5. Copy audio files into bundle directory so Remotion can serve them
  if (audioFilename) {
    const bundleAudioDir = path.join(bundleLocation, "audio");
    if (!fs.existsSync(bundleAudioDir)) {
      fs.mkdirSync(bundleAudioDir, { recursive: true });
    }
    const srcAudio = path.join(publicAudioDir, audioFilename);
    if (fs.existsSync(srcAudio)) {
      fs.copyFileSync(srcAudio, path.join(bundleAudioDir, audioFilename));
    }
  }
  job.progress = 50;

  // 6. Calculate total duration
  const totalFrames = scenes.reduce((sum, s) => sum + s.duration, 0);

  // 7. Build input props — audioSrc baked into the composition
  const inputProps: Record<string, unknown> = {
    scenes,
    brandEmoji: brand.logoEmoji,
    brandName: brand.name,
    accentColor: brand.colors.primary,
    stockVideoPaths: [],
    audioSrc: audioFilename ? `/audio/${audioFilename}` : undefined,
  };

  if (template === "StockFootage") {
    inputProps.secondaryColor = brand.colors.secondary;
  }

  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: template,
    inputProps,
  });

  const outputPath = path.join(outputDir, `${jobId}.mp4`);

  await renderMedia({
    composition: {
      ...composition,
      durationInFrames: totalFrames,
      fps: FPS,
      width: WIDTH,
      height: HEIGHT,
    },
    serveUrl: bundleLocation,
    codec: "h264",
    outputLocation: outputPath,
    inputProps,
    onProgress: ({ progress }) => {
      job.progress = 50 + Math.round(progress * 50);
    },
  });

  job.progress = 100;
  job.status = "complete";
  job.result = {
    videoPath: outputPath,
    audioPath: audioOutputPath,
    durationSeconds: totalFrames / FPS,
  };
}
