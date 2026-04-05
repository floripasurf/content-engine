export interface VideoScene {
  type: "hook" | "text_on_screen" | "narration" | "cut" | "transition" | "cta";
  text: string;
  duration: number; // frames at 30fps
  style?: "large" | "normal" | "emphasis";
}

const FPS = 30;
const MIN_SCENE_FRAMES = Math.round(0.8 * FPS); // 0.8 seconds min
const MAX_SCENE_FRAMES = Math.round(2.0 * FPS); // 2 seconds MAX — viral pace
const WORDS_PER_SECOND = 5; // Fast read for viral content
const CUT_FRAMES = 2; // Instant cuts
const TRANSITION_FRAMES = 8; // Quick transitions

// Markers in our script format
const TEXTO_RE = /\[TEXTO\s*NA\s*TELA:\s*"([^"]+)"\]/gi;
const CORTE_RE = /\[CORTE\]/gi;
const TRANSICAO_RE = /\[TRANSI[ÇC][AÃ]O\]/gi;
const CTA_MARKERS = ["link na bio", "comenta aqui", "salva esse", "segue a gente", "arrasta pra cima"];

function estimateFrames(text: string): number {
  const words = text.trim().split(/\s+/).length;
  const seconds = Math.max(words / WORDS_PER_SECOND, 0.8);
  // Cap at 2 seconds for viral pacing
  return Math.min(Math.round(seconds * FPS), MAX_SCENE_FRAMES);
}

export function parseScript(script: {
  hook: string;
  body: string;
  duration: number; // total seconds
}): VideoScene[] {
  const scenes: VideoScene[] = [];
  const totalFrames = script.duration * FPS;

  // 1. Hook scene (first thing shown — punchy, max 2s)
  scenes.push({
    type: "hook",
    text: script.hook.trim(),
    duration: Math.min(estimateFrames(script.hook), MAX_SCENE_FRAMES),
    style: "large",
  });

  // 2. Parse body line by line
  const lines = script.body.trim().split("\n");

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // --- SKIP visual-only directions (no caption/subtitle) ---

    // [CENA X - description] → visual cut, no text shown
    if (/^\[CENA\s/i.test(trimmed)) {
      scenes.push({ type: "cut", text: "", duration: CUT_FRAMES });
      continue;
    }

    // *action description* → silent visual, no text
    if (/^\*.*\*$/.test(trimmed)) {
      continue;
    }

    // Any other [BRACKET ONLY] direction → skip
    if (/^\[(?!TEXTO).+\]$/i.test(trimmed)) {
      continue;
    }

    // --- KEEP these as visual elements ---

    // [TEXTO NA TELA: "..."] → on-screen text overlay
    const textoMatch = trimmed.match(/\[TEXTO\s*NA\s*TELA:\s*"([^"]+)"\]/i);
    if (textoMatch) {
      scenes.push({
        type: "text_on_screen",
        text: textoMatch[1],
        duration: Math.min(estimateFrames(textoMatch[1]), MAX_SCENE_FRAMES),
        style: "large",
      });
      continue;
    }

    // [CORTE]
    if (CORTE_RE.test(trimmed)) {
      CORTE_RE.lastIndex = 0;
      scenes.push({ type: "cut", text: "", duration: CUT_FRAMES });
      continue;
    }

    // [TRANSICAO]
    if (TRANSICAO_RE.test(trimmed)) {
      TRANSICAO_RE.lastIndex = 0;
      scenes.push({ type: "transition", text: "", duration: TRANSITION_FRAMES });
      continue;
    }

    // --- DIALOGUE: Clean and show as caption ---

    // Strip inline actions and brackets, keep only spoken text
    let spoken = trimmed
      .replace(/^\*.*?\*\s*/, "")    // Remove leading *action*
      .replace(/\*.*?\*/g, "")       // Remove inline *actions*
      .replace(/\[.*?\]/g, "")       // Remove inline [directions]
      .replace(/^[""]|[""]$/g, "")   // Remove surrounding quotes
      .trim();

    if (!spoken || spoken.length < 2) continue;

    // Check if CTA
    const isCta = CTA_MARKERS.some((m) => spoken.toLowerCase().includes(m));
    if (isCta) {
      scenes.push({
        type: "cta",
        text: spoken,
        duration: Math.min(estimateFrames(spoken), MAX_SCENE_FRAMES),
        style: "emphasis",
      });
      continue;
    }

    // Regular spoken dialogue → caption
    scenes.push({
      type: "narration",
      text: spoken,
      duration: estimateFrames(spoken),
      style: "normal",
    });
  }

  // If no CTA was found, add one from the last narration or hook
  const hasCta = scenes.some((s) => s.type === "cta");
  if (!hasCta && scenes.length > 0) {
    const lastNarration = [...scenes].reverse().find((s) => s.type === "narration");
    if (lastNarration) {
      lastNarration.type = "cta";
      lastNarration.style = "emphasis";
    }
  }

  // 3. Scale durations to fit total duration
  const rawTotal = scenes.reduce((sum, s) => sum + s.duration, 0);
  if (rawTotal > 0 && Math.abs(rawTotal - totalFrames) > FPS) {
    const scale = totalFrames / rawTotal;
    for (const scene of scenes) {
      if (scene.type === "cut") continue; // Keep cuts short
      scene.duration = Math.max(Math.round(scene.duration * scale), MIN_SCENE_FRAMES);
    }
  }

  return scenes;
}

/**
 * Detect if a line is a visual/camera direction vs spoken dialogue.
 * Visual directions describe what the CAMERA sees, not what someone SAYS.
 */
function isVisualDirection(text: string): boolean {
  const lower = text.toLowerCase();

  // Explicit markers
  if (/^\[/.test(text)) return true;           // [anything]
  if (/^\*.*\*$/.test(text)) return true;      // *action*

  // Camera/scene language patterns
  const directionPatterns = [
    /^close\s/i,                                // "Close na torneira", "Close do rosto", "Close numa rachadura"
    /^(plano|zoom|pan|tilt|corta?)\s/i,        // Camera movements
    /^(cena|take|shot)\s/i,                     // Scene markers
    /^(fade|flash|black|tela)\s/i,             // Transitions
    /\b(entra|sai|corre|pega|abre|liga|olha|senta)\s+(n[ao]|em|no|na|pelo|pra|pro|o |a )/i, // Action descriptions: "entra no banheiro", "liga a água"
    /^(pessoa|mulher|homem|criança|senhora|carla|roberto|márcia|dona)\s+(sentad|olhand|corren|entran|no |na |em |de |entra|liga|pega|abre)/i, // "Carla entra no chuveiro"
    /^(torneira|parede|chuveiro|luz|porta|tela)\s/i, // Objects as subjects
    /(ao fundo|em primeiro plano|na tela)/i,    // Composition directions
    /^montagem\s/i,                             // "montagem rápida"
  ];

  return directionPatterns.some((p) => p.test(lower));
}

/**
 * Extract ONLY spoken dialogue from a line.
 * Returns null if the line has no spoken content.
 */
function extractDialogue(text: string): string | null {
  let cleaned = text
    .replace(/^\*.*?\*\s*/, "")    // Remove leading *action*
    .replace(/\*.*?\*/g, "")       // Remove inline *actions*
    .replace(/\[.*?\]/g, "")       // Remove [directions]
    .replace(/^[""]|[""]$/g, "")   // Remove surrounding quotes
    .trim();

  if (!cleaned || cleaned.length < 2) return null;
  if (isVisualDirection(cleaned)) return null;

  return cleaned;
}

/**
 * Build voiceover text — STRICTLY only spoken dialogue.
 * No scene descriptions, no camera directions, no action lines.
 */
export function buildVoiceoverText(script: { hook: string; body: string }): string {
  const spokenLines: string[] = [];

  // Process hook — split into sentences, keep only dialogue parts
  const hookSentences = script.hook.split(/(?<=[.!?])\s+/);
  for (const sentence of hookSentences) {
    const dialogue = extractDialogue(sentence.trim());
    if (dialogue) {
      spokenLines.push(dialogue);
    }
  }

  // Process body line by line
  for (const line of script.body.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const dialogue = extractDialogue(trimmed);
    if (dialogue) {
      spokenLines.push(dialogue);
    }
  }

  return spokenLines.join(". ");
}
