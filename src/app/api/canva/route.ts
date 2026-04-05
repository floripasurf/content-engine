import { createCanvaClient } from "@/lib/canva-api";
import { generateCanvaCarousel, type CarouselTemplate } from "@/lib/canva-carousel";
import { allCarousels } from "@/lib/carousel-content";

// POST /api/canva — Generate carousel in Canva
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body as { action: string };

    if (action === "generate") {
      return handleGenerate(body);
    }
    if (action === "export") {
      return handleExport(body);
    }
    if (action === "templates") {
      return handleListTemplates(body);
    }
    if (action === "test") {
      return handleTestConnection(body);
    }

    return Response.json(
      { error: "Acao invalida. Use: generate, export, templates, test" },
      { status: 400 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro interno";
    return Response.json({ error: message }, { status: 500 });
  }
}

// GET /api/canva — List brand templates from Canva
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get("token") || undefined;
    const client = createCanvaClient(token);
    const templates = await client.listBrandTemplates();
    return Response.json({ templates });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro interno";
    return Response.json({ error: message }, { status: 500 });
  }
}

// --- Handlers ---

async function handleGenerate(body: Record<string, unknown>) {
  const { carouselId, brandSlug, token, brandTemplates } = body as {
    carouselId: string;
    brandSlug: string;
    token?: string;
    brandTemplates: CarouselTemplate;
  };

  if (!carouselId || !brandSlug) {
    return Response.json(
      { error: "carouselId e brandSlug sao obrigatorios" },
      { status: 400 },
    );
  }

  const carousel = allCarousels.find((c) => c.id === carouselId);
  if (!carousel) {
    return Response.json(
      { error: `Carousel "${carouselId}" nao encontrado` },
      { status: 404 },
    );
  }

  if (!brandTemplates) {
    return Response.json(
      { error: "brandTemplates nao configurados para esta marca" },
      { status: 400 },
    );
  }

  const client = createCanvaClient(token);
  const result = await generateCanvaCarousel(carousel, brandTemplates, client);

  return Response.json({
    success: result.errors.length === 0,
    designs: result.designs.map((d) => ({
      id: d.id,
      title: d.title,
      editUrl: d.urls.edit_url,
      viewUrl: d.urls.view_url,
    })),
    exportUrls: result.exportUrls,
    errors: result.errors,
  });
}

async function handleExport(body: Record<string, unknown>) {
  const { designIds, token } = body as {
    designIds: string[];
    token?: string;
  };

  if (!designIds || designIds.length === 0) {
    return Response.json(
      { error: "designIds e obrigatorio" },
      { status: 400 },
    );
  }

  const client = createCanvaClient(token);
  const results: Array<{ designId: string; url?: string; error?: string }> = [];

  for (const designId of designIds) {
    try {
      const result = await client.exportDesign(designId);
      if (result.urls && result.urls.length > 0) {
        results.push({ designId, url: result.urls[0].url });
      } else {
        results.push({
          designId,
          error: result.error || "Export falhou",
        });
      }
    } catch (err) {
      results.push({
        designId,
        error: err instanceof Error ? err.message : "Erro desconhecido",
      });
    }
  }

  return Response.json({ results });
}

async function handleListTemplates(body: Record<string, unknown>) {
  const { token } = body as { token?: string };
  const client = createCanvaClient(token);
  const templates = await client.listBrandTemplates();
  return Response.json({ templates });
}

async function handleTestConnection(body: Record<string, unknown>) {
  const { token } = body as { token?: string };
  const client = createCanvaClient(token);
  const connected = await client.testConnection();
  return Response.json({ connected });
}
