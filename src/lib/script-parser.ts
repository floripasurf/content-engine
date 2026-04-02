export interface VideoScene {
  type: "hook" | "text_on_screen" | "narration" | "cut" | "transition" | "cta";
  text: string;
  duration: number; // frames at 30fps
  style?: "large" | "normal" | "emphasis";
}

const FPS = 30;
const MIN_SCENE_FRAMES = Math.round(1.5 * FPS); // 1.5 seconds
const WORDS_PER_SECOND = 3;
const CUT_FRAMES = 3;
const TRANSITION_FRAMES = 15;

// Markers in our script format
const TEXTO_RE = /\[TEXTO\s*NA\s*TELA:\s*"([^"]+)"\]/gi;
const CORTE_RE = /\[CORTE\]/gi;
const TRANSICAO_RE = /\[TRANSI[ÇC][AÃ]O\]/gi;
const CTA_MARKERS = ["link na bio", "comenta aqui", "salva esse", "segue a gente", "arrasta pra cima"];

function estimateFrames(text: string): number {
  const words = text.trim().split(/\s+/).length;
  const seconds = Math.max(words / WORDS_PER_SECOND, 1.5);
  return Math.round(seconds * FPS);
}

export function parseScript(script: {
  hook: string;
  body: string;
  duration: number; // total seconds
}): VideoScene[] {
  const scenes: VideoScene[] = [];
  const totalFrames = script.duration * FPS;

  // 1. Hook scene (first thing shown)
  scenes.push({
    type: "hook",
    text: script.hook.trim(),
    duration: Math.max(estimateFrames(script.hook), 3 * FPS), // at least 3 seconds
    style: "large",
  });

  // 2. Parse body into segments
  const body = script.body.trim();
  // Split body by markers while keeping them
  const segments = body.split(/(\[TEXTO\s*NA\s*TELA:\s*"[^"]+"\]|\[CORTE\]|\[TRANSI[ÇC][AÃ]O\])/gi).filter(Boolean);

  for (const segment of segments) {
    const trimmed = segment.trim();
    if (!trimmed) continue;

    // Check for [TEXTO NA TELA: "..."]
    const textoMatch = trimmed.match(/\[TEXTO\s*NA\s*TELA:\s*"([^"]+)"\]/i);
    if (textoMatch) {
      scenes.push({
        type: "text_on_screen",
        text: textoMatch[1],
        duration: Math.max(estimateFrames(textoMatch[1]), 2 * FPS),
        style: "large",
      });
      continue;
    }

    // Check for [CORTE]
    if (CORTE_RE.test(trimmed)) {
      CORTE_RE.lastIndex = 0;
      scenes.push({ type: "cut", text: "", duration: CUT_FRAMES });
      continue;
    }

    // Check for [TRANSICAO]
    if (TRANSICAO_RE.test(trimmed)) {
      TRANSICAO_RE.lastIndex = 0;
      scenes.push({ type: "transition", text: "", duration: TRANSITION_FRAMES });
      continue;
    }

    // Check if this is a CTA segment
    const isCta = CTA_MARKERS.some((m) => trimmed.toLowerCase().includes(m));
    if (isCta) {
      scenes.push({
        type: "cta",
        text: trimmed,
        duration: Math.max(estimateFrames(trimmed), 3 * FPS),
        style: "emphasis",
      });
      continue;
    }

    // Regular narration
    scenes.push({
      type: "narration",
      text: trimmed,
      duration: estimateFrames(trimmed),
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

/** Build a flat voiceover text from the script (strips markers). */
export function buildVoiceoverText(script: { hook: string; body: string }): string {
  const body = script.body
    .replace(TEXTO_RE, "")
    .replace(CORTE_RE, "")
    .replace(TRANSICAO_RE, "")
    .replace(/\s{2,}/g, " ")
    .trim();
  return `${script.hook.trim()} ${body}`;
}
