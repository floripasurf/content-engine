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

// 3 Chamei scripts — CHARACTER-DRIVEN mini-stories
const scripts = [
  {
    name: "chamei-chuveiro-frio",
    template: "ViralReels",
    hook: "Carla entra no chuveiro confiante, liga a água e GRITA — saiu gelada.",
    body: `[CENA 1 - mulher entrando no banheiro confiante]
[TEXTO NA TELA: "Segunda-feira. 6h da manhã."]

[CORTE]
[CENA 2 - mulher tomando banho frio, expressão de choque]
"AAAAH!"

[CORTE]
[CENA 3 - chuveiro elétrico com fio queimado, faísca]
[TEXTO NA TELA: "O chuveiro decidiu se aposentar 💀"]

[CORTE]
[CENA 4 - mulher no escuro enrolada na toalha, digitando no celular]
[TEXTO NA TELA: "Google: 47 resultados. Nenhum atende."]

[CORTE]
[CENA 5 - mulher irritada no telefone, chamada caindo]
[TEXTO NA TELA: "Tentativa 1... 2... 5... 8..."]

[CORTE]
[CENA 6 - mulher esquentando água na panela no fogão]
[TEXTO NA TELA: "Banho medieval em pleno 2026"]

[CORTE]
[CENA 7 - tela do app Chamei com notificação]
[TEXTO NA TELA: "Não seja a Carla."]

[CORTE]
[TEXTO NA TELA: "Chamei. Eletricista no WhatsApp em 2 minutos. Link na bio. 👇"]`,
    duration: 32,
    sceneKeywords: ["woman turning on shower confident bathroom", "woman cold shower shocked screaming", "broken electric shower sparks wire", "woman wrapped towel phone dark bathroom frustrated", "woman angry phone call no answer", "woman heating water pot stove kitchen", "smartphone app notification success", "black screen white text call to action"],
  },
  {
    name: "chamei-torneira-possuida",
    template: "ViralReels",
    hook: "Close na torneira da cozinha JORRANDO água sem controle. Roberto entra em pânico.",
    body: `[CENA 1 - torneira de cozinha jorrando água forte]
[TEXTO NA TELA: "Domingo. Almoço em família."]

[CORTE]
[CENA 2 - homem correndo até a pia apavorado, água espirra no rosto]
"NÃO NÃO NÃO!"

[CORTE]
[CENA 3 - crianças rindo e brincando na água no chão da cozinha]
[TEXTO NA TELA: "Pra eles é parque aquático 🏊"]

[CORTE]
[CENA 4 - homem molhado no telefone, mandando áudio desesperado]
"Mãe, a senhora conhece algum encanador??"

[CORTE]
[CENA 5 - tela de WhatsApp com resposta da mãe]
[TEXTO NA TELA: "'Pergunta pro seu tio que conhece um primo...'"]

[CORTE]
[CENA 6 - homem abrindo app no celular, digitando "encanador"]
[TEXTO NA TELA: "Aí ele lembrou que existe tecnologia."]

[CORTE]
[CENA 7 - encanador chegando na porta com caixa de ferramentas]
[TEXTO NA TELA: "37 minutos depois."]
"Você é um ANJO."

[CORTE]
[CENA 8 - torneira novinha funcionando, família feliz]
[TEXTO NA TELA: "Chamei. Profissional no WhatsApp em minutos. Grátis. 🔧"]`,
    duration: 37,
    sceneKeywords: ["kitchen faucet water burst spraying", "man trying fix kitchen sink water splashing panic", "kids playing water floor kitchen laughing", "man wet phone desperate voice message", "phone whatsapp audio message reply", "man smartphone searching app service", "plumber arriving door toolbox smiling professional", "new kitchen faucet working family happy clean"],
  },
  {
    name: "chamei-vizinha-salvadora",
    template: "StoryMode",
    hook: "Close numa rachadura enorme na parede. Dona Márcia já tentou de tudo.",
    body: `[CENA 1 - parede rachada de cima a baixo, tinta descascando]
[TEXTO NA TELA: "2 semanas com isso."]

[CORTE]
[CENA 2 - senhora olhando a parede preocupada]
"Já pedi indicação pra todo mundo..."

[CORTE]
[CENA 3 - senhora no telefone, na padaria perguntando, no portão com vizinho]
[TEXTO NA TELA: "Padeiro: 'não conheço'. Porteiro: 'vou ver'. Cunhada: 'deixa eu perguntar'..."]

[CORTE]
[CENA 4 - senhora sentada no sofá derrotada]
[TEXTO NA TELA: "Dia 14. Zero pedreiros. Rachadura crescendo."]

[CORTE]
[CENA 5 - vizinha jovem aparece na porta sorrindo com celular]
"Dona Márcia! Ainda tá procurando pedreiro?"

[CORTE]
[CENA 6 - vizinha mostrando celular pra Dona Márcia]
[TEXTO NA TELA: "'Usa o Chamei. Achei o meu em 5 minutos.'"]
"Mas é de graça mesmo, filha?"

[CORTE]
[CENA 7 - pedreiro trabalhando na parede, passando massa]
[TEXTO NA TELA: "No dia seguinte."]

[CORTE]
[CENA 8 - parede lisa e pintada, Dona Márcia sorrindo]
[TEXTO NA TELA: "Chamei. Indicação boa é a que funciona. Link na bio. 👇"]`,
    duration: 38,
    sceneKeywords: ["cracked wall peeling paint house interior", "worried elderly woman looking at wall arms crossed", "senior woman asking neighbors phone bakery", "tired woman sitting sofa defeated looking wall", "young woman neighbor doorbell smiling phone hand", "two women looking at smartphone screen together", "mason worker repairing wall plastering construction", "smooth painted white wall woman smiling touching satisfied"],
  },
];

const brand = {
  name: "Chamei",
  slug: "chamei",
  logoEmoji: "📞",
  colors: { primary: "#2563EB", secondary: "#1E40AF" },
};

// Import the REAL voiceover builder and TTS from lib
const { buildVoiceoverText } = await import("./src/lib/script-parser.ts");
const { generateVoiceover } = await import("./src/lib/tts.ts");

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

    // Extract ONLY dialogue (no scene descriptions)
    const dialogueText = buildVoiceoverText({ hook: script.hook, body: script.body });
    console.log(`  [${script.name}] Dialogue: "${dialogueText}"`);

    const ttsResult = await generateVoiceover(dialogueText, publicAudioPath);
    const result = ttsResult?.audioPath;

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
  // STEP 2: Fetch stock footage for each script
  // ============================================================
  console.log("\nFetching stock footage from Pexels...\n");
  const stockMap = new Map(); // script name -> array of local video paths

  for (const script of scripts) {
    console.log(`  [${script.name}] Searching for relevant footage...`);
    const { fetchStockByKeywords } = await import("./src/lib/stock-footage.ts");
    // Use scene-specific keywords if available, otherwise fallback
    const stockVideos = await fetchStockByKeywords(
      script.sceneKeywords || [],
      `/tmp/content-engine-stock/${script.name}`
    );
    const paths = stockVideos.map(v => v.localPath);
    stockMap.set(script.name, paths);
    console.log(`  [${script.name}] Got ${paths.length} stock clips`);
  }

  // ============================================================
  // STEP 3: Bundle, then copy audio + stock into bundle dir
  // ============================================================
  console.log("\nBundling Remotion project...");
  const entryPoint = path.resolve("src/remotion/index.ts");
  const bundleLocation = await bundle({
    entryPoint,
    webpackOverride: (c) => c,
  });

  // Copy audio files into the bundle directory
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

  // Copy stock videos into bundle directory
  const bundleStockDir = path.join(bundleLocation, "stock");
  if (!fs.existsSync(bundleStockDir)) {
    fs.mkdirSync(bundleStockDir, { recursive: true });
  }
  const stockPathMap = new Map(); // old path -> bundle-relative path
  for (const [scriptName, paths] of stockMap.entries()) {
    for (let i = 0; i < paths.length; i++) {
      const filename = `${scriptName}_${i}.mp4`;
      const bundlePath = path.join(bundleStockDir, filename);
      fs.copyFileSync(paths[i], bundlePath);
      stockPathMap.set(paths[i], `/stock/${filename}`);
      console.log(`  Copied stock to bundle: ${filename}`);
    }
  }
  console.log("Bundle ready.\n");

  // ============================================================
  // STEP 4: Render each video
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
    const rawStockPaths = stockMap.get(script.name) || [];
    const stockVideoPaths = rawStockPaths.map(p => stockPathMap.get(p)).filter(Boolean);

    // 2. Calculate frames
    const totalFrames = scenes.reduce((sum, s) => sum + s.duration, 0);
    console.log(
      `  Total frames: ${totalFrames} (${(totalFrames / FPS).toFixed(1)}s)`
    );
    console.log(`  Audio: ${audioSrc || "none"}`);
    console.log(`  Stock clips: ${stockVideoPaths.length}`);

    // 3. Build input props
    const inputProps = {
      scenes,
      brandEmoji: brand.logoEmoji,
      brandName: brand.name,
      accentColor: brand.colors.primary,
      secondaryColor: brand.colors.secondary,
      stockVideoPaths,
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
