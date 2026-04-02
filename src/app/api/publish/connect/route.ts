import { publisherOrchestrator } from "@/lib/publisher";
import { AppSettings } from "@/lib/types";

export async function POST(request: Request) {
  const body = await request.json() as {
    platform: string;
    settings: AppSettings;
  };

  const { platform, settings } = body;

  if (!platform || !settings) {
    return Response.json({ error: "platform and settings are required" }, { status: 400 });
  }

  try {
    const valid = await publisherOrchestrator.validatePlatform(platform, settings);
    return Response.json({
      platform,
      connected: valid,
      method: publisherOrchestrator.getMethod(settings),
    });
  } catch (err) {
    return Response.json({
      platform,
      connected: false,
      error: (err as Error).message,
    });
  }
}
