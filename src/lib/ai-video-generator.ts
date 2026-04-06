import path from "path";
import fs from "fs";
import { MinimaxClient } from "./minimax-api";
import { extractSceneDescriptions, convertAllScenes } from "./scene-to-prompt";
import type { ScenePrompt } from "./scene-to-prompt";

interface AIVideoGeneratorOptions {
  script: {
    hook: string;
    body: string;
    duration: number;
  };
  brand: {
    name: string;
    slug: string;
    tone: string;
  };
  outputDir: string;
  resolution?: "720P" | "1080P";
  sceneDuration?: 6 | 10;
  useClaude?: boolean;
  onProgress?: (sceneIndex: number, totalScenes: number, status: string) => void;
}

interface AIVideoResult {
  scenePaths: string[];
  prompts: ScenePrompt[];
  failedScenes: number[];
}

/**
 * Generate AI video clips for each [CENA] in a script using Minimax Hailuo.
 *
 * Processes scenes in parallel batches of 3 to respect rate limits.
 * Each scene generates a 6-second 1080P video clip.
 */
async function generateAIVideoScenes(
  options: AIVideoGeneratorOptions
): Promise<AIVideoResult> {
  const {
    script,
    brand,
    outputDir,
    resolution = "1080P",
    sceneDuration = 6,
    useClaude = true,
    onProgress,
  } = options;

  const apiKey = process.env.MINIMAX_API_KEY;
  if (!apiKey) {
    throw new Error(
      "MINIMAX_API_KEY not set. Get your key at platform.minimax.io"
    );
  }

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 1. Extract scene descriptions from script
  const scenes = extractSceneDescriptions(script.body);
  if (scenes.length === 0) {
    console.warn("[ai-video] No [CENA] markers found in script body");
    return { scenePaths: [], prompts: [], failedScenes: [] };
  }

  console.log(`[ai-video] Found ${scenes.length} scenes to generate`);

  // 2. Convert each scene to Minimax prompt
  console.log("[ai-video] Converting scenes to Minimax prompts...");
  const prompts = await convertAllScenes(
    script.body,
    { name: brand.name, tone: brand.tone },
    useClaude
  );

  // 3. Generate videos in parallel batches of 3
  const client = new MinimaxClient({ apiKey });
  const scenePaths: string[] = [];
  const failedScenes: number[] = [];
  const BATCH_SIZE = 3;

  for (let i = 0; i < prompts.length; i += BATCH_SIZE) {
    const batch = prompts.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(prompts.length / BATCH_SIZE);

    console.log(
      `\n[ai-video] Batch ${batchNum}/${totalBatches} (scenes ${i + 1}-${Math.min(i + BATCH_SIZE, prompts.length)})`
    );

    const results = await Promise.allSettled(
      batch.map(async (p) => {
        const sceneFile = `scene_${p.sceneIndex}.mp4`;
        const outputPath = path.join(outputDir, sceneFile);

        onProgress?.(p.sceneIndex, prompts.length, "generating");

        const result = await client.generateVideo(p.minimaxPrompt, outputPath, {
          duration: sceneDuration,
          resolution,
        });

        onProgress?.(p.sceneIndex, prompts.length, "complete");
        return result;
      })
    );

    for (let j = 0; j < results.length; j++) {
      const r = results[j];
      const sceneIdx = batch[j].sceneIndex;

      if (r.status === "fulfilled") {
        scenePaths.push(r.value);
      } else {
        console.warn(
          `[ai-video] Scene ${sceneIdx} failed:`,
          r.reason
        );
        failedScenes.push(sceneIdx);
        onProgress?.(sceneIdx, prompts.length, "failed");
      }
    }
  }

  console.log(
    `\n[ai-video] Complete: ${scenePaths.length}/${prompts.length} scenes generated`
  );
  if (failedScenes.length > 0) {
    console.warn(
      `[ai-video] Failed scenes: ${failedScenes.join(", ")}`
    );
  }

  return { scenePaths, prompts, failedScenes };
}

/**
 * Estimate cost for AI video generation.
 * Minimax pricing: ~$0.33 per scene at 1080P, ~$0.17 at 720P.
 */
function estimateCost(
  sceneCount: number,
  resolution: "720P" | "1080P" = "1080P"
): { total: number; perScene: number; currency: string } {
  const perScene = resolution === "1080P" ? 0.33 : 0.17;
  return {
    total: sceneCount * perScene,
    perScene,
    currency: "USD",
  };
}

/**
 * Estimate generation time.
 * ~4-5 minutes per clip, batches of 3 run in parallel.
 */
function estimateTime(sceneCount: number): {
  minMinutes: number;
  maxMinutes: number;
} {
  const batches = Math.ceil(sceneCount / 3);
  return {
    minMinutes: batches * 4,
    maxMinutes: batches * 6,
  };
}

export {
  generateAIVideoScenes,
  estimateCost,
  estimateTime,
  type AIVideoGeneratorOptions,
  type AIVideoResult,
};
