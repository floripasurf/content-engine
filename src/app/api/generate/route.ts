import { getSampleScripts } from "@/lib/sample-scripts";
import { runClaudeJSON, buildScriptPrompt } from "@/lib/claude-cli";

// Script generation — uses local Claude CLI (zero API cost)
// Falls back to sample scripts if CLI is unavailable

export async function POST(request: Request) {
  const body = await request.json();
  const {
    brandId,
    pillarId,
    templateId,
    format,
    customPrompt,
    // Brand context passed from client for richer prompts
    brandName,
    brandTone,
    brandPainPoints,
    brandCompetitors,
    brandTargetAudience,
    pillarName,
    pillarEmotion,
    templateStructure,
  } = body as {
    brandId: string;
    pillarId: string;
    templateId?: string;
    format: string;
    customPrompt?: string;
    brandName?: string;
    brandTone?: string;
    brandPainPoints?: string;
    brandCompetitors?: string;
    brandTargetAudience?: string;
    pillarName?: string;
    pillarEmotion?: string;
    templateStructure?: string;
  };

  // Try Claude CLI first (local, zero cost)
  if (brandName && pillarName) {
    const prompt = buildScriptPrompt({
      brandName,
      brandTone: brandTone ?? "",
      brandPainPoints: brandPainPoints ?? "",
      brandCompetitors: brandCompetitors ?? "",
      brandTargetAudience: brandTargetAudience ?? "",
      pillarName,
      pillarEmotion: pillarEmotion ?? "",
      format,
      templateStructure,
      customPrompt,
    });

    const result = await runClaudeJSON<{
      scripts: Array<{
        title: string;
        hook: string;
        body: string;
        visualNotes: string;
        duration: number;
      }>;
    }>(prompt);

    if (result.success && result.data?.scripts?.length) {
      return Response.json({
        scripts: result.data.scripts.map((s) => ({
          brandId,
          pillarId,
          templateId: templateId ?? null,
          title: s.title,
          hook: s.hook,
          body: s.body,
          visualNotes: s.visualNotes,
          voiceoverText: null,
          duration: s.duration || 30,
          status: "draft" as const,
          feedback: null,
        })),
        source: "claude-cli",
      });
    }

    // Log CLI error but continue to fallback
    console.warn("[generate] Claude CLI failed, falling back to samples:", result.error);
  }

  // FALLBACK: Sample scripts (when CLI unavailable or brand context missing)
  await new Promise((resolve) => setTimeout(resolve, 500));

  const scripts = getSampleScripts(brandId, pillarId);

  return Response.json({
    scripts: scripts.map((s) => ({
      ...s,
      duration:
        format === "story"
          ? 15
          : format === "tiktok"
            ? 30
            : format === "reels"
              ? Math.min(s.duration, 60)
              : s.duration,
    })),
    source: "sample",
  });
}
