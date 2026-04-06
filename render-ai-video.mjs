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
  "Desktop/CLAUDE/ContentEngine/videos-ai"
);
const PUBLIC_AUDIO_DIR = path.resolve("public/audio");
const TEMP_AI_DIR = path.resolve("/tmp/content-engine-ai-video");
const FPS = 30;
const WIDTH = 1080;
const HEIGHT = 1920;

// Same 3 Chamei scripts as render-test.mjs
const scripts = [
  {
    name: "chamei-chuveiro-frio",
    template: "ViralReels",
    hook: "Carla entra no chuveiro confiante, liga a agua e GRITA — saiu gelada.",
    body: `[CENA 1 - mulher entrando no banheiro confiante]
[TEXTO NA TELA: "Segunda-feira. 6h da manha."]

[CORTE]
[CENA 2 - mulher tomando banho frio, expressao de choque]
"AAAAH!"

[CORTE]
[CENA 3 - chuveiro eletrico com fio queimado, faisca]
[TEXTO NA TELA: "O chuveiro decidiu se aposentar"]

[CORTE]
[CENA 4 - mulher no escuro enrolada na toalha, digitando no celular]
[TEXTO NA TELA: "Google: 47 resultados. Nenhum atende."]

[CORTE]
[CENA 5 - mulher irritada no telefone, chamada caindo]
[TEXTO NA TELA: "Tentativa 1... 2... 5... 8..."]

[CORTE]
[CENA 6 - mulher esquentando agua na panela no fogao]
[TEXTO NA TELA: "Banho medieval em pleno 2026"]

[CORTE]
[CENA 7 - tela do app Chamei com notificacao]
[TEXTO NA TELA: "Nao seja a Carla."]

[CORTE]
[TEXTO NA TELA: "Chamei. Eletricista no WhatsApp em 2 minutos. Link na bio."]`,
    duration: 32,
  },
  {
    name: "chamei-torneira-possuida",
    template: "ViralReels",
    hook: "Close na torneira da cozinha JORRANDO agua sem controle. Roberto entra em panico.",
    body: `[CENA 1 - torneira de cozinha jorrando agua forte]
[TEXTO NA TELA: "Domingo. Almoco em familia."]

[CORTE]
[CENA 2 - homem correndo ate a pia apavorado, agua espirra no rosto]
"NAO NAO NAO!"

[CORTE]
[CENA 3 - criancas rindo e brincando na agua no chao da cozinha]
[TEXTO NA TELA: "Pra eles e parque aquatico"]

[CORTE]
[CENA 4 - homem molhado no telefone, mandando audio desesperado]
"Mae, a senhora conhece algum encanador??"

[CORTE]
[CENA 5 - tela de WhatsApp com resposta da mae]
[TEXTO NA TELA: "'Pergunta pro seu tio que conhece um primo...'"]

[CORTE]
[CENA 6 - homem abrindo app no celular, digitando "encanador"]
[TEXTO NA TELA: "Ai ele lembrou que existe tecnologia."]

[CORTE]
[CENA 7 - encanador chegando na porta com caixa de ferramentas]
[TEXTO NA TELA: "37 minutos depois."]
"Voce e um ANJO."

[CORTE]
[CENA 8 - torneira novinha funcionando, familia feliz]
[TEXTO NA TELA: "Chamei. Profissional no WhatsApp em minutos. Gratis."]`,
    duration: 37,
  },
  {
    name: "chamei-vizinha-salvadora",
    template: "StoryMode",
    hook: "Close numa rachadura enorme na parede. Dona Marcia ja tentou de tudo.",
    body: `[CENA 1 - parede rachada de cima a baixo, tinta descascando]
[TEXTO NA TELA: "2 semanas com isso."]

[CORTE]
[CENA 2 - senhora olhando a parede preocupada]
"Ja pedi indicacao pra todo mundo..."

[CORTE]
[CENA 3 - senhora no telefone, na padaria perguntando, no portao com vizinho]
[TEXTO NA TELA: "Padeiro: 'nao conheco'. Porteiro: 'vou ver'. Cunhada: 'deixa eu perguntar'..."]

[CORTE]
[CENA 4 - senhora sentada no sofa derrotada]
[TEXTO NA TELA: "Dia 14. Zero pedreiros. Rachadura crescendo."]

[CORTE]
[CENA 5 - vizinha jovem aparece na porta sorrindo com celular]
"Dona Marcia! Ainda ta procurando pedreiro?"

[CORTE]
[CENA 6 - vizinha mostrando celular pra Dona Marcia]
[TEXTO NA TELA: "'Usa o Chamei. Achei o meu em 5 minutos.'"]
"Mas e de graca mesmo, filha?"

[CORTE]
[CENA 7 - pedreiro trabalhando na parede, passando massa]
[TEXTO NA TELA: "No dia seguinte."]

[CORTE]
[CENA 8 - parede lisa e pintada, Dona Marcia sorrindo]
[TEXTO NA TELA: "Chamei. Indicacao boa e a que funciona. Link na bio."]`,
    duration: 38,
  },
];

const brand = {
  name: "Chamei",
  slug: "chamei",
  tone: "Informal, humor brasileiro, dramatico e identificavel",
  logoEmoji: "📞",
  colors: { primary: "#2563EB", secondary: "#1E40AF" },
};

// Import libs
const { buildVoiceoverText } = await import("./src/lib/script-parser.ts");
const { generateVoiceover } = await import("./src/lib/tts.ts");
const { extractSceneDescriptions, convertAllScenes } = await import(
  "./src/lib/scene-to-prompt.ts"
);

async function main() {
  console.log("=== AI Video Render Pipeline ===\n");

  // Check for Minimax API key
  if (!process.env.MINIMAX_API_KEY) {
    console.log("MINIMAX_API_KEY not set.");
    console.log("This script will generate prompts and show what WOULD be generated.\n");
    console.log("To actually generate AI video, set: export MINIMAX_API_KEY=your_key\n");
  }

  // Ensure output directories
  for (const dir of [OUTPUT_DIR, PUBLIC_AUDIO_DIR, TEMP_AI_DIR]) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  // ============================================================
  // STEP 1: Convert all scene descriptions to Minimax prompts
  // ============================================================
  console.log("STEP 1: Converting scene descriptions to Minimax prompts...\n");
  const promptsMap = new Map();

  for (const script of scripts) {
    console.log(`  [${script.name}]`);
    const prompts = await convertAllScenes(
      script.body,
      { name: brand.name, tone: brand.tone },
      true // use Claude CLI for higher quality prompts
    );
    promptsMap.set(script.name, prompts);
    console.log(`  -> ${prompts.length} prompts generated\n`);

    // Save prompts to file for inspection
    const promptsFile = path.join(OUTPUT_DIR, `${script.name}-prompts.json`);
    fs.writeFileSync(promptsFile, JSON.stringify(prompts, null, 2));
    console.log(`  -> Prompts saved: ${promptsFile}\n`);
  }

  // ============================================================
  // STEP 2: Generate AI video clips (if API key present)
  // ============================================================
  const aiVideoMap = new Map(); // script name -> array of local video paths

  if (process.env.MINIMAX_API_KEY) {
    console.log("\nSTEP 2: Generating AI video clips with Minimax...\n");
    const { MinimaxClient } = await import("./src/lib/minimax-api.ts");
    const client = new MinimaxClient({ apiKey: process.env.MINIMAX_API_KEY });

    for (const script of scripts) {
      const prompts = promptsMap.get(script.name);
      const scriptDir = path.join(TEMP_AI_DIR, script.name);
      if (!fs.existsSync(scriptDir)) {
        fs.mkdirSync(scriptDir, { recursive: true });
      }

      console.log(`  [${script.name}] Generating ${prompts.length} scenes...`);
      const videoPaths = [];

      // Process in batches of 3
      for (let i = 0; i < prompts.length; i += 3) {
        const batch = prompts.slice(i, i + 3);
        const batchNum = Math.floor(i / 3) + 1;
        console.log(`    Batch ${batchNum}/${Math.ceil(prompts.length / 3)}`);

        const results = await Promise.allSettled(
          batch.map(async (p) => {
            const outputPath = path.join(scriptDir, `scene_${p.sceneIndex}.mp4`);
            return client.generateVideo(p.minimaxPrompt, outputPath, {
              duration: 6,
              resolution: "1080P",
            });
          })
        );

        for (const r of results) {
          if (r.status === "fulfilled") {
            videoPaths.push(r.value);
          } else {
            console.warn(`    Scene failed:`, r.reason?.message || r.reason);
          }
        }
      }

      aiVideoMap.set(script.name, videoPaths);
      console.log(`  [${script.name}] Got ${videoPaths.length}/${prompts.length} clips\n`);
    }
  } else {
    console.log("\nSTEP 2: SKIPPED (no MINIMAX_API_KEY)\n");
    for (const script of scripts) {
      aiVideoMap.set(script.name, []);
    }
  }

  // ============================================================
  // STEP 3: Generate TTS audio
  // ============================================================
  console.log("STEP 3: Generating TTS audio...\n");
  const audioMap = new Map();

  for (const script of scripts) {
    const audioFilename = `${script.name}-ai.mp3`;
    const publicAudioPath = path.join(PUBLIC_AUDIO_DIR, audioFilename);
    console.log(`  [${script.name}] Generating voiceover...`);

    const dialogueText = buildVoiceoverText({ hook: script.hook, body: script.body });
    console.log(`  [${script.name}] Dialogue: "${dialogueText.slice(0, 80)}..."`);

    const ttsResult = await generateVoiceover(dialogueText, publicAudioPath);
    const result = ttsResult?.audioPath;

    if (result && fs.existsSync(result)) {
      const outputCopy = path.join(OUTPUT_DIR, audioFilename);
      fs.copyFileSync(result, outputCopy);
      audioMap.set(script.name, `/audio/${audioFilename}`);
      console.log(`  [${script.name}] Audio ready\n`);
    } else {
      audioMap.set(script.name, undefined);
      console.log(`  [${script.name}] No audio (TTS failed)\n`);
    }
  }

  // ============================================================
  // STEP 4: Bundle Remotion + copy assets
  // ============================================================
  console.log("STEP 4: Bundling Remotion project...\n");
  const entryPoint = path.resolve("src/remotion/index.ts");
  const bundleLocation = await bundle({
    entryPoint,
    webpackOverride: (c) => c,
  });

  // Copy audio files into bundle
  const bundleAudioDir = path.join(bundleLocation, "audio");
  if (!fs.existsSync(bundleAudioDir)) {
    fs.mkdirSync(bundleAudioDir, { recursive: true });
  }
  for (const file of fs.readdirSync(PUBLIC_AUDIO_DIR)) {
    fs.copyFileSync(
      path.join(PUBLIC_AUDIO_DIR, file),
      path.join(bundleAudioDir, file)
    );
  }

  // Copy AI video clips into bundle
  const bundleStockDir = path.join(bundleLocation, "stock");
  if (!fs.existsSync(bundleStockDir)) {
    fs.mkdirSync(bundleStockDir, { recursive: true });
  }
  const stockPathMap = new Map();
  for (const [scriptName, paths] of aiVideoMap.entries()) {
    for (let i = 0; i < paths.length; i++) {
      const filename = `${scriptName}_ai_${i}.mp4`;
      const bundlePath = path.join(bundleStockDir, filename);
      fs.copyFileSync(paths[i], bundlePath);
      stockPathMap.set(paths[i], `/stock/${filename}`);
    }
  }
  console.log("  Bundle ready.\n");

  // ============================================================
  // STEP 5: Render each video
  // ============================================================
  for (const script of scripts) {
    console.log(`\n=== Rendering: ${script.name} (${script.template}) ===`);

    const scenes = parseScript({
      hook: script.hook,
      body: script.body,
      duration: script.duration,
    });
    console.log(`  Parsed ${scenes.length} scenes`);

    const audioSrc = audioMap.get(script.name);
    const rawAiPaths = aiVideoMap.get(script.name) || [];
    const stockVideoPaths = rawAiPaths
      .map((p) => stockPathMap.get(p))
      .filter(Boolean);

    const totalFrames = scenes.reduce((sum, s) => sum + s.duration, 0);
    console.log(`  Total frames: ${totalFrames} (${(totalFrames / FPS).toFixed(1)}s)`);
    console.log(`  Audio: ${audioSrc || "none"}`);
    console.log(`  AI video clips: ${stockVideoPaths.length}`);

    const inputProps = {
      scenes,
      brandEmoji: brand.logoEmoji,
      brandName: brand.name,
      accentColor: brand.colors.primary,
      secondaryColor: brand.colors.secondary,
      stockVideoPaths,
      audioSrc,
    };

    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: script.template,
      inputProps,
    });

    const outputPath = path.join(OUTPUT_DIR, `${script.name}-ai.mp4`);
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
    console.log(`\n  Done: ${outputPath} (${(stats.size / 1024 / 1024).toFixed(1)}MB)`);

    // Verify audio
    if (audioSrc) {
      try {
        const { stdout } = await execFileAsync("ffprobe", [
          "-v", "error", "-select_streams", "a",
          "-show_entries", "stream=codec_name",
          "-of", "csv=p=0",
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

  console.log("\n=== All AI videos rendered! ===");
  console.log(`Output: ${OUTPUT_DIR}`);

  // Print prompt summary
  console.log("\n--- Prompt Summary ---");
  for (const script of scripts) {
    const prompts = promptsMap.get(script.name);
    console.log(`\n${script.name}:`);
    for (const p of prompts) {
      console.log(`  Scene ${p.sceneIndex}: ${p.minimaxPrompt.slice(0, 100)}...`);
    }
  }
}

main().catch(console.error);
