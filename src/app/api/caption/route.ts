import { runClaudeJSON, buildCaptionPrompt } from "@/lib/claude-cli";

// Caption generation — uses local Claude CLI (zero API cost)
// Falls back to template-based generation if CLI unavailable

export async function POST(request: Request) {
  const body = await request.json();
  const { hook, bodyText, platforms, brandSlug, brandTone } = body as {
    hook: string;
    bodyText: string;
    platforms: string[];
    brandSlug: string;
    brandTone?: string;
  };

  // Try Claude CLI first (local, zero cost)
  if (hook && bodyText) {
    const prompt = buildCaptionPrompt({
      hook,
      bodyText,
      brandSlug,
      brandTone: brandTone ?? "",
      platforms,
    });

    const result = await runClaudeJSON<{
      captions: Array<{
        platform: string;
        caption: string;
        hashtags: string[];
        cta: string;
      }>;
    }>(prompt);

    if (result.success && result.data?.captions?.length) {
      return Response.json({
        captions: result.data.captions,
        source: "claude-cli",
      });
    }

    console.warn("[caption] Claude CLI failed, falling back to templates:", result.error);
  }

  // FALLBACK: Template-based caption generation
  await new Promise((resolve) => setTimeout(resolve, 300));

  const captions = platforms.map((platform) => {
    const isShort = platform === "tiktok" || platform === "story";
    const caption = isShort
      ? `${hook}\n\n${bodyText.split("\n")[0]}`
      : `${hook}\n\n${bodyText.split("\n").slice(0, 4).join("\n")}\n\nSalva esse post pra não esquecer. 🔖`;

    const hashtags = [
      `#${brandSlug}`,
      "#viral",
      platform === "tiktok" ? "#fyp" : "#reels",
      "#brasil",
      "#conteudo",
      "#marketing",
    ];

    const cta =
      platform === "linkedin"
        ? "Comenta o que você acha. 👇"
        : platform === "youtube"
          ? "Se inscreve e ativa o sininho! 🔔"
          : "Link na bio. 🔗";

    return { platform, caption, hashtags, cta };
  });

  return Response.json({ captions, source: "template" });
}
