import { publisherOrchestrator } from "@/lib/publisher";
import { AppSettings, Post } from "@/lib/types";

export async function POST(request: Request) {
  const body = await request.json() as {
    post: Post;
    settings: AppSettings;
    action: "publish_now" | "schedule";
    scheduledAt?: string;
  };

  const { post, settings, action, scheduledAt } = body;

  if (!post || !settings) {
    return Response.json({ error: "post and settings are required" }, { status: 400 });
  }

  try {
    let result;

    if (action === "schedule" && scheduledAt) {
      result = await publisherOrchestrator.schedulePost(post, settings, new Date(scheduledAt));
    } else {
      result = await publisherOrchestrator.publishPost(post, settings);
    }

    const method = publisherOrchestrator.getMethod(settings);

    return Response.json({
      result,
      method,
      log: {
        postId: post.id,
        platform: post.platform,
        action: action === "schedule" ? "schedule" : "publish",
        method,
        timestamp: new Date().toISOString(),
        success: result.success,
        error: result.error,
      },
    });
  } catch (err) {
    return Response.json({
      result: { success: false, error: (err as Error).message, platform: post.platform },
      method: "direct",
      log: {
        postId: post.id,
        platform: post.platform,
        action: "error",
        method: publisherOrchestrator.getMethod(settings),
        timestamp: new Date().toISOString(),
        success: false,
        error: (err as Error).message,
      },
    }, { status: 500 });
  }
}
