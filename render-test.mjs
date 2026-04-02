import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { parseScript } from "./src/lib/script-parser.ts";
import path from "path";
import fs from "fs";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

const OUTPUT_DIR = path.resolve(
  process.env.HOME,
  "Desktop/CLAUDE/ContentEngine/videos"
);
const PUBLIC_AUDIO_DIR = path.resolve("public/audio");
const FPS = 30;
const WIDTH = 1080;
const HEIGHT = 1920;

// 3 Chamei scripts — one per NEW template
const scripts = [
  {
    name: "chamei-dor-orcamento-fantasma",
    template: "ViralReels",
    hook: "Faz 3 dias que eu pedi um orçamento pra consertar minha torneira. TRÊS DIAS.",
    body: `[TEXTO NA TELA: "Dia 1"]
"Ah, vou mandar o orçamento hoje à noite!"

[CORTE]
[TEXTO NA TELA: "Dia 2"]
"Opa, desculpa, esqueci. Mando amanhã sem falta."

[CORTE]
[TEXTO NA TELA: "Dia 3"]
Sem falta ele disse.

[CORTE]
[TEXTO NA TELA: "Enquanto isso no Chamei..."]
Baixei o Chamei. Em 10 MINUTOS recebi 3 orçamentos.

[TEXTO NA TELA: "Chamei — Orçamento de verdade, de profissional de verdade"]
Enquanto o outro tá mandando sem falta, eu já agendei o serviço. Link na bio.`,
    duration: 35,
  },
  {
    name: "chamei-solucao-saga-indicacao",
    template: "StoryMode",
    hook: "Pergunta pra minha vizinha que ela conhece um eletricista — a MENTIRA.",
    body: `[TEXTO NA TELA: "A saga da indicação boca a boca"]

"Oi Dona Maria, a senhora tem contato de eletricista?"
"Ai querida, tinha um... deixa eu procurar..."

[CORTE]
[TEXTO NA TELA: "2 horas depois"]
"Achei! Mas acho que ele se aposentou."

[CORTE]
São 4 dias. A luz ainda tá piscando. Eu já perguntei pra 11 pessoas.

[TEXTO NA TELA: "Chamei. 2 minutos. Sem novela."]
Abri o app. Coloquei eletricista. Meu bairro.
Três opções com avaliação, preço e disponibilidade.

[TEXTO NA TELA: "Luz acesa. Sanidade mental restaurada."]
Dona Maria, obrigada, mas agora eu tenho o Chamei. Link na bio.`,
    duration: 40,
  },
  {
    name: "chamei-social-proof-grupo-familia",
    template: "ViralReels",
    hook: "Pedi indicação de encanador no grupo da família. Olha no que deu.",
    body: `[TEXTO NA TELA: "Eu só queria um encanador..."]
Mandei no grupo da família: gente, alguém conhece um encanador bom?

[CORTE]
Tia Márcia mandou o número de um cara que fez o serviço em 2014.
[TEXTO NA TELA: "2014, gente."]

[CORTE]
Primo mandou áudio de 4 minutos contando uma história que nada a ver.
[TEXTO NA TELA: "4 minutos de áudio"]

[CORTE]
Minha mãe mandou: reza pra Santo Expedito filho.

[TEXTO NA TELA: "Aí eu abri o Chamei"]
Profissional com 127 avaliações. Veio no mesmo dia. Resolveu em 2 horas.

[TEXTO NA TELA: "127 avaliações reais"]
Agora quando alguém pede indicação no grupo, EU mando: baixa o Chamei. Link na bio.`,
    duration: 40,
  },
];

const brand = {
  name: "Chamei",
  logoEmoji: "📞",
  colors: { primary: "#2563EB", secondary: "#1E40AF" },
};

async function generateTTS(text, outputPath) {
  try {
    const cleanText = text
      .replace(/\[TEXTO\s*NA\s*TELA:\s*"[^"]+"\]/gi, "")
      .replace(/\[CORTE\]/gi, "")
      .replace(/\[TRANSI[ÇC][AÃ]O\]/gi, "")
      .replace(/\s{2,}/g, " ")
      .trim();

    await execFileAsync(
      "python3",
      [
        "-m",
        "edge_tts",
        "--voice",
        "pt-BR-AntonioNeural",
        "--text",
        cleanText,
        "--write-media",
        outputPath,
      ],
      { timeout: 60000 }
    );

    console.log(`  TTS generated: ${outputPath}`);
    return outputPath;
  } catch (err) {
    console.warn("  TTS failed:", err.message);
    return null;
  }
}

async function main() {
  // Ensure output directories
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  if (!fs.existsSync(PUBLIC_AUDIO_DIR)) {
    fs.mkdirSync(PUBLIC_AUDIO_DIR, { recursive: true });
  }

  // ============================================================
  // STEP 1: Generate ALL TTS audio BEFORE bundling
  //         (Remotion snapshots public/ at bundle time)
  // ============================================================
  console.log("Generating TTS audio for all scripts...\n");
  const audioMap = new Map(); // script name -> audioSrc path (relative to public/)

  for (const script of scripts) {
    const audioFilename = `${script.name}.mp3`;
    const publicAudioPath = path.join(PUBLIC_AUDIO_DIR, audioFilename);
    console.log(`  [${script.name}] Generating voiceover...`);

    const result = await generateTTS(
      `${script.hook} ${script.body}`,
      publicAudioPath
    );

    if (result && fs.existsSync(result)) {
      // Also copy to output dir
      const outputCopy = path.join(OUTPUT_DIR, audioFilename);
      fs.copyFileSync(result, outputCopy);
      audioMap.set(script.name, `/audio/${audioFilename}`);
      console.log(`  [${script.name}] Audio ready`);
    } else {
      audioMap.set(script.name, undefined);
      console.log(`  [${script.name}] No audio (TTS failed)`);
    }
  }

  // ============================================================
  // STEP 2: Bundle, then copy audio files into bundle dir
  // ============================================================
  console.log("\nBundling Remotion project...");
  const entryPoint = path.resolve("src/remotion/index.ts");
  const bundleLocation = await bundle({
    entryPoint,
    webpackOverride: (c) => c,
  });

  // Copy audio files into the bundle directory so Remotion can serve them
  const bundleAudioDir = path.join(bundleLocation, "audio");
  if (!fs.existsSync(bundleAudioDir)) {
    fs.mkdirSync(bundleAudioDir, { recursive: true });
  }
  for (const file of fs.readdirSync(PUBLIC_AUDIO_DIR)) {
    fs.copyFileSync(
      path.join(PUBLIC_AUDIO_DIR, file),
      path.join(bundleAudioDir, file)
    );
    console.log(`  Copied audio to bundle: ${file}`);
  }
  console.log("Bundle ready.\n");

  // ============================================================
  // STEP 3: Render each video
  // ============================================================
  for (const script of scripts) {
    console.log(
      `\n=== Rendering: ${script.name} (${script.template}) ===`
    );

    // 1. Parse script
    const scenes = parseScript({
      hook: script.hook,
      body: script.body,
      duration: script.duration,
    });
    console.log(`  Parsed ${scenes.length} scenes`);

    const audioSrc = audioMap.get(script.name);

    // 2. Calculate frames
    const totalFrames = scenes.reduce((sum, s) => sum + s.duration, 0);
    console.log(
      `  Total frames: ${totalFrames} (${(totalFrames / FPS).toFixed(1)}s)`
    );
    console.log(`  Audio: ${audioSrc || "none"}`);

    // 3. Build input props
    const inputProps = {
      scenes,
      brandEmoji: brand.logoEmoji,
      brandName: brand.name,
      accentColor: brand.colors.primary,
      secondaryColor: brand.colors.secondary,
      stockVideoPaths: [], // Animated gradient fallback (no Pexels API key)
      audioSrc,
    };

    // 4. Select composition and render
    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: script.template,
      inputProps,
    });

    const outputPath = path.join(OUTPUT_DIR, `${script.name}.mp4`);
    console.log("  Rendering video...");

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
        const pct = Math.round(progress * 100);
        if (pct % 10 === 0) {
          process.stdout.write(`  Progress: ${pct}%\r`);
        }
      },
    });

    const stats = fs.statSync(outputPath);
    console.log(
      `\n  Done: ${outputPath} (${(stats.size / 1024 / 1024).toFixed(1)}MB)`
    );

    // 5. Verify audio is baked into the MP4
    if (audioSrc) {
      try {
        const { stdout } = await execFileAsync("ffprobe", [
          "-v",
          "error",
          "-select_streams",
          "a",
          "-show_entries",
          "stream=codec_name",
          "-of",
          "csv=p=0",
          outputPath,
        ]);
        if (stdout.trim()) {
          console.log(`  Audio verified in MP4: ${stdout.trim()}`);
        } else {
          console.warn("  WARNING: No audio stream found in MP4!");
        }
      } catch {
        console.log("  (ffprobe not available, cannot verify audio stream)");
      }
    }
  }

  console.log("\n=== All videos rendered! ===");
  console.log(`Output: ${OUTPUT_DIR}`);
}

main().catch(console.error);
