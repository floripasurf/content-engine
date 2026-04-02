import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

const CLAUDE_BIN = "claude";
const TIMEOUT_MS = 120_000; // 2 minutes max per generation

interface ClaudeCliOptions {
  prompt: string;
  maxTokens?: number;
}

interface ClaudeCliResult {
  success: boolean;
  output: string;
  error?: string;
}

/**
 * Runs Claude CLI locally using `claude -p "prompt"`
 * Uses the existing Claude Code subscription — zero API cost.
 */
export async function runClaude(options: ClaudeCliOptions): Promise<ClaudeCliResult> {
  try {
    const { stdout, stderr } = await execFileAsync(
      CLAUDE_BIN,
      ["-p", options.prompt],
      {
        timeout: TIMEOUT_MS,
        maxBuffer: 1024 * 1024, // 1MB
        env: { ...process.env, CLAUDE_CODE_MAX_OUTPUT_TOKENS: String(options.maxTokens ?? 4096) },
      }
    );

    if (stderr && !stdout) {
      return { success: false, output: "", error: stderr };
    }

    return { success: true, output: stdout.trim() };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, output: "", error: message };
  }
}

/**
 * Runs Claude CLI and parses JSON from the response.
 * Extracts the first JSON block found (handles markdown code fences).
 */
export async function runClaudeJSON<T>(prompt: string): Promise<{ success: boolean; data?: T; error?: string }> {
  const result = await runClaude({ prompt, maxTokens: 4096 });

  if (!result.success) {
    return { success: false, error: result.error };
  }

  try {
    // Try direct parse first
    const data = JSON.parse(result.output) as T;
    return { success: true, data };
  } catch {
    // Extract JSON from markdown code fence
    const jsonMatch = result.output.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
    if (jsonMatch) {
      try {
        const data = JSON.parse(jsonMatch[1]) as T;
        return { success: true, data };
      } catch {
        // fall through
      }
    }

    // Try to find raw JSON object/array
    const rawMatch = result.output.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (rawMatch) {
      try {
        const data = JSON.parse(rawMatch[1]) as T;
        return { success: true, data };
      } catch {
        // fall through
      }
    }

    return {
      success: false,
      error: `Não foi possível extrair JSON da resposta. Output: ${result.output.slice(0, 200)}...`,
    };
  }
}

/**
 * Build a script generation prompt with full brand context.
 */
export function buildScriptPrompt(params: {
  brandName: string;
  brandTone: string;
  brandPainPoints: string;
  brandCompetitors: string;
  brandTargetAudience: string;
  pillarName: string;
  pillarEmotion: string;
  format: string;
  templateStructure?: string;
  customPrompt?: string;
}): string {
  const formatDuration = {
    reels: "45-60 segundos",
    tiktok: "15-30 segundos",
    story: "10-15 segundos",
    carousel: "5-7 slides",
  }[params.format] ?? "30 segundos";

  return `Voce e um roteirista viral brasileiro. Gere EXATAMENTE 3 roteiros para redes sociais.

MARCA: ${params.brandName}
TOM: ${params.brandTone}
PUBLICO: ${params.brandTargetAudience}
DORES DO CLIENTE: ${params.brandPainPoints}
CONCORRENTES: ${params.brandCompetitors}

PILAR: ${params.pillarName} (emocao principal: ${params.pillarEmotion})
FORMATO: ${params.format} (${formatDuration})
${params.templateStructure ? `TEMPLATE: ${params.templateStructure}` : ""}
${params.customPrompt ? `TOPICO ESPECIFICO: ${params.customPrompt}` : ""}

REGRAS:
- Linguagem brasileira, popular, direta, COM HUMOR
- Hook nos primeiros 3 segundos que PARA o scroll
- Use [TEXTO NA TELA], [CORTE], [TRANSICAO] como direcoes de cena
- Conteudo VIRAL: humor, emocao forte, identificacao
- Cada roteiro deve ter hook DIFERENTE dos outros

Responda SOMENTE com JSON valido, sem texto antes ou depois:
{
  "scripts": [
    {
      "title": "titulo curto e chamativo",
      "hook": "primeiros 3 segundos / primeira frase que para o scroll",
      "body": "roteiro completo com direcoes de cena [CORTE] [TEXTO NA TELA] etc",
      "visualNotes": "notas de producao: cenario, iluminacao, estilo de edicao, musica",
      "duration": ${params.format === "story" ? 15 : params.format === "tiktok" ? 30 : 45}
    }
  ]
}`;
}

/**
 * Build a caption generation prompt.
 */
export function buildCaptionPrompt(params: {
  hook: string;
  bodyText: string;
  brandSlug: string;
  brandTone: string;
  platforms: string[];
}): string {
  const platformGuidelines = params.platforms
    .map((p) => {
      switch (p) {
        case "instagram":
          return "- Instagram: legenda de 150-300 chars, emojis moderados, 15-20 hashtags relevantes, CTA claro";
        case "tiktok":
          return "- TikTok: legenda curta 80-150 chars, 3-5 hashtags com #fyp, CTA direto";
        case "youtube":
          return "- YouTube: descricao de 200-400 chars, 5-8 hashtags, CTA para inscrever";
        case "linkedin":
          return "- LinkedIn: tom profissional mas humano, 200-400 chars, 3-5 hashtags, CTA para comentar";
        default:
          return `- ${p}: legenda adequada a plataforma`;
      }
    })
    .join("\n");

  return `Voce e um social media manager brasileiro expert em legendas virais.

ROTEIRO:
Hook: ${params.hook}
Corpo: ${params.bodyText}

MARCA: ${params.brandSlug}
TOM: ${params.brandTone}

REGRAS POR PLATAFORMA:
${platformGuidelines}

- Cada legenda deve funcionar INDEPENDENTE do video (pra quem le sem audio)
- CTA forte e especifico, nao generico
- Hashtags misturando populares + nicho

Responda SOMENTE com JSON valido:
{
  "captions": [
    {
      "platform": "nome_da_plataforma",
      "caption": "legenda completa com emojis",
      "hashtags": ["#hashtag1", "#hashtag2"],
      "cta": "call to action especifico"
    }
  ]
}`;
}
