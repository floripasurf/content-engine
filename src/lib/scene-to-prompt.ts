import { runClaude } from "./claude-cli";

interface ScenePrompt {
  sceneIndex: number;
  originalDescription: string;
  minimaxPrompt: string;
}

/**
 * Extract [CENA X - description] markers from script body.
 */
function extractSceneDescriptions(
  body: string
): Array<{ index: number; description: string }> {
  const scenes: Array<{ index: number; description: string }> = [];
  const regex = /\[CENA\s*(\d+)\s*-\s*([^\]]+)\]/gi;
  let match;
  while ((match = regex.exec(body)) !== null) {
    scenes.push({
      index: parseInt(match[1]),
      description: match[2].trim(),
    });
  }
  return scenes;
}

/**
 * Pick a camera command based on scene position and content.
 */
function pickCameraCommand(
  description: string,
  sceneIndex: number,
  totalScenes: number
): string {
  const lower = description.toLowerCase();

  // Close-ups for detail scenes
  if (
    lower.includes("close") ||
    lower.includes("detalhe") ||
    lower.includes("tela do") ||
    lower.includes("celular") ||
    lower.includes("app") ||
    lower.includes("fio") ||
    lower.includes("rachad") ||
    lower.includes("whatsapp")
  ) {
    return "[Close up]";
  }

  // Tracking for movement scenes
  if (
    lower.includes("entrando") ||
    lower.includes("correndo") ||
    lower.includes("chegando") ||
    lower.includes("aparece") ||
    lower.includes("entra")
  ) {
    return "[Tracking shot]";
  }

  // Zoom in for dramatic reveals
  if (
    lower.includes("faísca") ||
    lower.includes("queimad") ||
    lower.includes("jorrando") ||
    lower.includes("choque") ||
    lower.includes("pânico")
  ) {
    return "[Zoom in]";
  }

  // Pan for group/environment scenes
  if (
    lower.includes("família") ||
    lower.includes("crianças") ||
    lower.includes("vizin") ||
    lower.includes("cozinha") ||
    lower.includes("banheiro")
  ) {
    return "[Pan right]";
  }

  // Pedestal up for resolution/victory scenes
  if (sceneIndex === totalScenes) {
    return "[Pedestal up]";
  }

  // First scene gets tracking for energy
  if (sceneIndex === 1) {
    return "[Tracking shot]";
  }

  return "[Pan right]";
}

/**
 * Build a basic cinematic prompt from a Portuguese scene description.
 * Used as fallback if Claude CLI is unavailable.
 */
function buildFallbackPrompt(
  description: string,
  brandContext: { name: string; tone: string },
  sceneIndex: number,
  totalScenes: number
): string {
  const camera = pickCameraCommand(description, sceneIndex, totalScenes);

  const parts: string[] = [];

  // Translate common Portuguese keywords to English visual descriptions
  const translations: [RegExp, string][] = [
    [/mulher entrando no banheiro confiante/i, "Young Brazilian woman walking confidently into a modern bathroom, warm lighting, slight smile, reaching for shower handle"],
    [/mulher tomando banho frio.*choque/i, "Woman in shower suddenly hit by freezing cold water, shocked expression, mouth open screaming, water splashing, dark bathroom"],
    [/chuveiro.*fio queimado.*fa[ií]sca/i, "Close up of broken electric shower head with exposed burnt wire, electrical sparks flying, dangerous, dramatic lighting"],
    [/mulher.*escuro.*toalha.*celular/i, "Woman wrapped in towel in dark bathroom, frustrated expression, scrolling phone, cold blue lighting"],
    [/mulher.*irritada.*telefone/i, "Frustrated woman making phone calls, angry expression, calls being rejected, phone screen showing missed calls"],
    [/mulher.*esquentando.*[aá]gua.*panela/i, "Woman heating water in large pot on kitchen stove, resigned expression, steam rising, absurd medieval situation"],
    [/tela.*app.*notifica[çc][aã]o/i, "Smartphone screen showing instant service notification, green checkmark, clean modern UI, warm glow"],
    [/torneira.*cozinha.*jorrando/i, "Kitchen faucet spraying water uncontrollably, water bursting everywhere, chaos, dramatic slow motion"],
    [/homem.*correndo.*pia.*apavorado/i, "Panicked man running to kitchen sink, water splashing in his face, desperate attempt to stop leak"],
    [/crian[çc]as.*rindo.*brincando.*[aá]gua/i, "Children laughing and playing in water on kitchen floor, joyful chaos, parents nightmare"],
    [/homem.*molhado.*telefone.*[aá]udio/i, "Wet man desperately recording voice message on phone, dripping water, bathroom chaos background"],
    [/tela.*whatsapp.*resposta.*m[aã]e/i, "Phone screen showing WhatsApp conversation, mother's reply message, blue chat bubble"],
    [/homem.*abrindo.*app.*celular/i, "Man opening mobile app on phone, typing search query, hopeful expression, technology saves the day"],
    [/encanador.*chegando.*porta.*ferramentas/i, "Professional plumber arriving at front door with toolbox, confident smile, hero entrance"],
    [/torneira.*novinha.*fam[ií]lia.*feliz/i, "Brand new kitchen faucet working perfectly, happy family gathered around, warm golden lighting, relief"],
    [/parede.*rachada.*tinta.*descascando/i, "Large crack running down interior wall, peeling paint, water damage, concerning structural issue"],
    [/senhora.*olhando.*parede.*preocupada/i, "Worried elderly Brazilian woman looking at cracked wall, arms crossed, concerned expression"],
    [/senhora.*telefone.*padaria.*vizinho/i, "Senior woman asking for help at bakery, talking to neighbors, phone calls, asking everyone"],
    [/senhora.*sentada.*sof[aá].*derrotada/i, "Defeated elderly woman sitting on sofa, tired and hopeless, staring at damaged wall"],
    [/vizinha.*jovem.*porta.*sorrindo.*celular/i, "Young cheerful neighbor woman at doorstep, smiling, holding up smartphone, excited to help"],
    [/vizinha.*mostrando.*celular.*dona/i, "Two women looking at smartphone screen together, younger showing older woman the app, hope"],
    [/pedreiro.*trabalhando.*parede.*massa/i, "Mason worker skillfully repairing wall, applying plaster, professional tools, construction progress"],
    [/parede.*lisa.*pintada.*sorrindo/i, "Beautifully smooth white painted wall, happy woman touching it with satisfaction, warm lighting"],
  ];

  let translated = "";
  for (const [pattern, english] of translations) {
    if (pattern.test(description)) {
      translated = english;
      break;
    }
  }

  if (!translated) {
    // Generic translation — describe the scene visually
    translated = `Scene from a ${brandContext.name} advertisement: ${description}`;
  }

  parts.push(translated);
  parts.push(camera);

  // Add position-based modifiers
  if (sceneIndex === 1) {
    parts.push("attention-grabbing, dramatic opening");
  }
  if (sceneIndex === totalScenes) {
    parts.push("satisfying resolution, warm lighting");
  }

  // Always add quality/format tags
  parts.push("vertical 9:16 format, photorealistic, cinematic lighting");

  return parts.join(", ");
}

/**
 * Use Claude CLI to convert a Portuguese scene description into an optimal
 * Minimax Hailuo video generation prompt.
 */
async function convertWithClaude(
  sceneDescription: string,
  context: string,
  sceneIndex: number,
  totalScenes: number
): Promise<string> {
  const positionHint =
    sceneIndex === 1
      ? "This is the FIRST scene -- make it attention-grabbing and dramatic to stop the scroll."
      : sceneIndex === totalScenes
        ? "This is the LAST scene -- make it feel like a satisfying resolution with warm lighting."
        : "";

  const result = await runClaude({
    prompt: `Convert this Portuguese video scene description into an optimal prompt for Minimax Hailuo AI video generation. The prompt must be:
- In English (Minimax works best with English prompts)
- Cinematic and highly specific with visual details
- Specify "vertical 9:16 format"
- Include exactly ONE camera command in [brackets]: [Close up], [Pan right], [Zoom in], [Tracking shot], or [Pedestal up]
- Include emotional and dramatic descriptors
- End with "photorealistic, cinematic lighting"
- Maximum 200 words

Scene: "${sceneDescription}"
Context: ${context}
Scene position: ${sceneIndex} of ${totalScenes}
${positionHint}

Return ONLY the prompt text, nothing else. No quotes, no explanation.`,
    maxTokens: 512,
  });

  if (result.success && result.output.trim().length > 20) {
    return result.output.trim();
  }

  // Fallback to rule-based conversion
  return buildFallbackPrompt(
    sceneDescription,
    { name: context.split(",")[0]?.replace("Brand: ", "").trim() || "brand", tone: "" },
    sceneIndex,
    totalScenes
  );
}

/**
 * Convert all scenes from a script body into Minimax-optimized prompts.
 */
async function convertAllScenes(
  body: string,
  brand: { name: string; tone: string },
  useClaude: boolean = true
): Promise<ScenePrompt[]> {
  const scenes = extractSceneDescriptions(body);
  const totalScenes = scenes.length;
  const prompts: ScenePrompt[] = [];

  for (const scene of scenes) {
    let minimaxPrompt: string;

    if (useClaude) {
      minimaxPrompt = await convertWithClaude(
        scene.description,
        `Brand: ${brand.name}, Tone: ${brand.tone}`,
        scene.index,
        totalScenes
      );
    } else {
      minimaxPrompt = buildFallbackPrompt(
        scene.description,
        brand,
        scene.index,
        totalScenes
      );
    }

    prompts.push({
      sceneIndex: scene.index,
      originalDescription: scene.description,
      minimaxPrompt,
    });

    console.log(
      `  [scene-to-prompt] Scene ${scene.index}: "${scene.description}" -> "${minimaxPrompt.slice(0, 80)}..."`
    );
  }

  return prompts;
}

export {
  extractSceneDescriptions,
  convertWithClaude,
  convertAllScenes,
  buildFallbackPrompt,
  pickCameraCommand,
  type ScenePrompt,
};
