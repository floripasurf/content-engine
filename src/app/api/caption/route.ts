// Caption generation API route
// Full Claude integration ready — prototype uses template-based generation

export async function POST(request: Request) {
  const body = await request.json();
  const { hook, bodyText, platforms, brandSlug } = body as {
    hook: string;
    bodyText: string;
    platforms: string[];
    brandSlug: string;
  };

  // Check for Claude API key
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (apiKey) {
    // FULL CLAUDE API INTEGRATION
    /*
    const { Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic({ apiKey });

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      system: `Voce e um social media manager brasileiro expert em legendas virais.
Gere legendas otimizadas para cada plataforma. Cada legenda deve ter tamanho adequado a plataforma, hashtags relevantes e CTA claro.
Responda em JSON: { "captions": [{ "platform": "...", "caption": "...", "hashtags": [...], "cta": "..." }] }`,
      messages: [
        {
          role: "user",
          content: `Roteiro:\nHook: ${hook}\nCorpo: ${bodyText}\n\nMarca: ${brandSlug}\nPlataformas: ${platforms.join(", ")}\n\nGere legendas otimizadas para cada plataforma.`,
        },
      ],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    return Response.json(JSON.parse(text));
    */
  }

  // PROTOTYPE: Template-based caption generation
  await new Promise((resolve) => setTimeout(resolve, 800));

  const captions = platforms.map((platform) => {
    const isShort = platform === "tiktok" || platform === "story";
    const caption = isShort
      ? `${hook}\n\n${bodyText.split("\n")[0]}`
      : `${hook}\n\n${bodyText.split("\n").slice(0, 4).join("\n")}\n\nSalva esse post pra nao esquecer.`;

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
        ? "Comenta o que voce acha."
        : platform === "youtube"
          ? "Se inscreve e ativa o sino!"
          : "Link na bio.";

    return { platform, caption, hashtags, cta };
  });

  return Response.json({ captions });
}
