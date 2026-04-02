import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs";

const execFileAsync = promisify(execFile);

// edge-tts might be installed in user-local Python bin
const EDGE_TTS_PATHS = [
  "edge-tts",
  "/Users/raphaellages/Library/Python/3.9/bin/edge-tts",
  "/usr/local/bin/edge-tts",
  "/opt/homebrew/bin/edge-tts",
];

export type VoiceOption = "pt-BR-AntonioNeural" | "pt-BR-FranciscaNeural" | "pt-BR-ThalitaNeural";

export const VOICE_OPTIONS: { id: VoiceOption; label: string; description: string }[] = [
  { id: "pt-BR-AntonioNeural", label: "Antonio", description: "Masculino, profissional" },
  { id: "pt-BR-FranciscaNeural", label: "Francisca", description: "Feminino, acolhedor" },
  { id: "pt-BR-ThalitaNeural", label: "Thalita", description: "Feminino, jovem" },
];

async function findEdgeTts(): Promise<string> {
  for (const p of EDGE_TTS_PATHS) {
    try {
      await execFileAsync(p, ["--version"]);
      return p;
    } catch {
      // try next
    }
  }
  // Last resort: try which
  try {
    const { stdout } = await execFileAsync("which", ["edge-tts"]);
    return stdout.trim();
  } catch {
    throw new Error(
      "edge-tts not found. Install it with: pip3 install edge-tts"
    );
  }
}

export async function generateVoiceover(
  text: string,
  outputPath: string,
  voice: VoiceOption = "pt-BR-AntonioNeural"
): Promise<{ audioPath: string; subtitlePath: string }> {
  const edgeTts = await findEdgeTts();
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const subtitlePath = outputPath.replace(/\.mp3$/, ".vtt");

  await execFileAsync(edgeTts, [
    "--voice",
    voice,
    "--text",
    text,
    "--write-media",
    outputPath,
    "--write-subtitles",
    subtitlePath,
  ]);

  return { audioPath: outputPath, subtitlePath };
}
