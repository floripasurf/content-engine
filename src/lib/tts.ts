import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs";
import https from "https";

const execFileAsync = promisify(execFile);

export type VoiceProvider = "elevenlabs" | "google" | "edge-tts";

export type VoiceOption =
  | "pt-BR-AntonioNeural"
  | "pt-BR-FranciscaNeural"
  | "pt-BR-ThalitaNeural";

export const VOICE_OPTIONS: {
  id: VoiceOption;
  label: string;
  description: string;
}[] = [
  { id: "pt-BR-AntonioNeural", label: "Antonio", description: "Masculino, profissional" },
  { id: "pt-BR-FranciscaNeural", label: "Francisca", description: "Feminino, acolhedor" },
  { id: "pt-BR-ThalitaNeural", label: "Thalita", description: "Feminino, jovem" },
];

export const PROVIDER_OPTIONS: {
  id: VoiceProvider;
  label: string;
  description: string;
}[] = [
  { id: "google", label: "Google Neural (recomendado)", description: "Gratuito 1M chars/mês, qualidade boa" },
  { id: "elevenlabs", label: "ElevenLabs (premium)", description: "Melhor qualidade, requer API key" },
  { id: "edge-tts", label: "Edge TTS (básico)", description: "Gratuito, qualidade aceitável" },
];

// --- Provider: ElevenLabs ---

function httpsPost(
  url: string,
  headers: Record<string, string>,
  body: string
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const req = https.request(
      {
        hostname: parsed.hostname,
        path: parsed.pathname + parsed.search,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body),
          ...headers,
        },
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => {
          const buf = Buffer.concat(chunks);
          if (res.statusCode && res.statusCode >= 400) {
            reject(new Error(`HTTP ${res.statusCode}: ${buf.toString("utf-8").slice(0, 300)}`));
          } else {
            resolve(buf);
          }
        });
      }
    );
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

async function generateElevenLabs(
  text: string,
  outputPath: string
): Promise<{ audioPath: string }> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new Error("ELEVENLABS_API_KEY not set");

  // pNInz6obpgDQGcFmaJgB = Adam (multilingual)
  const voiceId = "pNInz6obpgDQGcFmaJgB";
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

  const body = JSON.stringify({
    text,
    model_id: "eleven_multilingual_v2",
    voice_settings: {
      stability: 0.5,
      similarity_boost: 0.75,
    },
  });

  const audioBuffer = await httpsPost(url, { "xi-api-key": apiKey }, body);
  fs.writeFileSync(outputPath, audioBuffer);
  console.log(`[tts:elevenlabs] Generated ${outputPath} (${audioBuffer.length} bytes)`);
  return { audioPath: outputPath };
}

// --- Provider: Google Cloud TTS ---

async function generateGoogleTTS(
  text: string,
  outputPath: string,
  voice: VoiceOption = "pt-BR-AntonioNeural"
): Promise<{ audioPath: string }> {
  const apiKey = process.env.GOOGLE_TTS_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_TTS_API_KEY not set");

  // Map edge-tts voice names to Google voices
  const googleVoiceMap: Record<string, string> = {
    "pt-BR-AntonioNeural": "pt-BR-Neural2-B",
    "pt-BR-FranciscaNeural": "pt-BR-Neural2-A",
    "pt-BR-ThalitaNeural": "pt-BR-Neural2-C",
  };

  const googleVoice = googleVoiceMap[voice] || "pt-BR-Neural2-B";
  const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;

  const body = JSON.stringify({
    input: { text },
    voice: {
      languageCode: "pt-BR",
      name: googleVoice,
    },
    audioConfig: {
      audioEncoding: "MP3",
      speakingRate: 1.0,
      pitch: 0,
    },
  });

  const responseBuffer = await httpsPost(url, {}, body);
  const response = JSON.parse(responseBuffer.toString("utf-8"));

  if (!response.audioContent) {
    throw new Error(`Google TTS returned no audio: ${JSON.stringify(response).slice(0, 200)}`);
  }

  const audioBuffer = Buffer.from(response.audioContent, "base64");
  fs.writeFileSync(outputPath, audioBuffer);
  console.log(`[tts:google] Generated ${outputPath} (${audioBuffer.length} bytes)`);
  return { audioPath: outputPath };
}

// --- Provider: Edge TTS (fallback) ---

const EDGE_TTS_PATHS = [
  "edge-tts",
  "/Users/raphaellages/Library/Python/3.9/bin/edge-tts",
  "/usr/local/bin/edge-tts",
  "/opt/homebrew/bin/edge-tts",
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
  // Try python -m
  try {
    await execFileAsync("python3", ["-m", "edge_tts", "--version"]);
    return "python3 -m edge_tts";
  } catch {
    // noop
  }
  try {
    const { stdout } = await execFileAsync("which", ["edge-tts"]);
    return stdout.trim();
  } catch {
    throw new Error("edge-tts not found. Install it with: pip3 install edge-tts");
  }
}

async function generateEdgeTTS(
  text: string,
  outputPath: string,
  voice: VoiceOption = "pt-BR-AntonioNeural"
): Promise<{ audioPath: string; subtitlePath: string }> {
  const edgeTtsCmd = await findEdgeTts();
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const subtitlePath = outputPath.replace(/\.mp3$/, ".vtt");

  if (edgeTtsCmd.includes("python3")) {
    await execFileAsync(
      "python3",
      ["-m", "edge_tts", "--voice", voice, "--text", text, "--write-media", outputPath, "--write-subtitles", subtitlePath],
      { timeout: 60000 }
    );
  } else {
    await execFileAsync(
      edgeTtsCmd,
      ["--voice", voice, "--text", text, "--write-media", outputPath, "--write-subtitles", subtitlePath],
      { timeout: 60000 }
    );
  }

  console.log(`[tts:edge] Generated ${outputPath}`);
  return { audioPath: outputPath, subtitlePath };
}

// --- Auto-select provider ---

export function detectProvider(): VoiceProvider {
  if (process.env.ELEVENLABS_API_KEY) return "elevenlabs";
  if (process.env.GOOGLE_TTS_API_KEY) return "google";
  console.warn("[tts] No premium TTS key found, falling back to Edge TTS (basic quality)");
  return "edge-tts";
}

// --- Main entry point ---

export async function generateVoiceover(
  text: string,
  outputPath: string,
  voice: VoiceOption = "pt-BR-AntonioNeural",
  provider?: VoiceProvider
): Promise<{ audioPath: string; subtitlePath?: string }> {
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const selectedProvider = provider || detectProvider();
  console.log(`[tts] Using provider: ${selectedProvider}`);

  switch (selectedProvider) {
    case "elevenlabs":
      return generateElevenLabs(text, outputPath);

    case "google":
      return generateGoogleTTS(text, outputPath, voice);

    case "edge-tts":
    default:
      return generateEdgeTTS(text, outputPath, voice);
  }
}
