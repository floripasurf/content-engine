import { getSampleScripts } from "@/lib/sample-scripts";

// Full Claude API integration — ready for when API key is available
// For prototype: returns pre-written sample scripts

export async function POST(request: Request) {
  const body = await request.json();
  const { brandId, pillarId, templateId, format, customPrompt } = body as {
    brandId: string;
    pillarId: string;
    templateId?: string;
    format: string;
    customPrompt?: string;
  };

  // Check for Claude API key in environment
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (apiKey) {
    // FULL CLAUDE API INTEGRATION
    // Uncomment when @anthropic-ai/sdk is installed and API key is set
    /*
    const { Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic({ apiKey });

    // Would need to load brand/pillar/template from DB in production
    const systemPrompt = `Voce e um roteirista viral brasileiro especialista em conteudo para redes sociais.
Voce cria roteiros para a marca "${brandId}" com foco no pilar "${pillarId}".
O formato e ${format}.
${templateId ? `Use o template: ${templateId}` : "Crie livremente."}
${customPrompt ? `Topico especifico: ${customPrompt}` : ""}

REGRAS:
- Linguagem brasileira, popular, direta
- Hook nos primeiros 3 segundos que PARA o scroll
- Use [TEXTO NA TELA], [CORTE], [TRANSICAO] como direcoes
- Inclua notas visuais detalhadas
- O conteudo deve ser VIRAL — humor, emocao, identificacao
- Gere 3 variantes diferentes com hooks distintos

Responda em JSON com esta estrutura:
{
  "scripts": [
    {
      "title": "titulo curto",
      "hook": "hook dos primeiros 3 segundos",
      "body": "roteiro completo com direcoes",
      "visualNotes": "notas de producao visual",
      "duration": 30
    }
  ]
}`;

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: `Gere 3 variantes de roteiro viral para a marca, no pilar ${pillarId}, formato ${format}.${customPrompt ? ` Topico: ${customPrompt}` : ""}`,
        },
      ],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const parsed = JSON.parse(text);

    return Response.json({
      scripts: parsed.scripts.map((s: Record<string, unknown>) => ({
        brandId,
        pillarId,
        templateId: templateId || null,
        title: s.title,
        hook: s.hook,
        body: s.body,
        visualNotes: s.visualNotes,
        voiceoverText: null,
        duration: s.duration || 30,
        status: "draft",
        feedback: null,
      })),
    });
    */
  }

  // PROTOTYPE MODE: Return sample scripts
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const scripts = getSampleScripts(brandId, pillarId);

  return Response.json({
    scripts: scripts.map((s) => ({
      ...s,
      // Override format-specific duration
      duration:
        format === "story"
          ? 15
          : format === "tiktok"
            ? 30
            : format === "reels"
              ? Math.min(s.duration, 60)
              : s.duration,
    })),
  });
}
