import path from "path";
import type { VoiceOption } from "@/lib/tts";

type TemplateId = "TextOnScreen" | "StockFootage" | "SplitScreen" | "Carousel";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      script,
      brand,
      template = "TextOnScreen",
      voice = "pt-BR-AntonioNeural",
    } = body as {
      script: { hook: string; body: string; duration: number; title: string };
      brand: { name: string; logoEmoji: string; colors: { primary: string; secondary: string } };
      template?: TemplateId;
      voice?: VoiceOption;
    };

    if (!script?.hook || !script?.body) {
      return Response.json(
        { error: "Script hook and body are required" },
        { status: 400 }
      );
    }

    if (!brand?.name) {
      return Response.json(
        { error: "Brand name is required" },
        { status: 400 }
      );
    }

    const outputDir = path.join(process.cwd(), "output", "renders");

    // Dynamic import to keep heavy deps out of the static build
    const { startRenderJob } = await import("@/lib/video-renderer");

    const jobId = await startRenderJob({
      script,
      brand,
      template,
      voice,
      outputDir,
    });

    return Response.json({ jobId, status: "queued" });
  } catch (err) {
    console.error("[render] Error starting render job:", err);
    return Response.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
