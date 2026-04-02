import { publisherOrchestrator } from "@/lib/publisher";
import { AppSettings, Post, PublishResult } from "@/lib/types";

export async function POST(request: Request) {
  const body = await request.json() as {
    posts: Post[];
    settings: AppSettings;
  };

  const { posts, settings } = body;

  if (!posts?.length || !settings) {
    return Response.json({ error: "posts array and settings are required" }, { status: 400 });
  }

  const results: Array<{ postId: string; platform: string; result: PublishResult }> = [];
  const method = publisherOrchestrator.getMethod(settings);

  for (const post of posts) {
    try {
      const result = await publisherOrchestrator.publishPost(post, settings);
      results.push({ postId: post.id, platform: post.platform, result });
    } catch (err) {
      results.push({
        postId: post.id,
        platform: post.platform,
        result: { success: false, error: (err as Error).message, platform: post.platform },
      });
    }
  }

  const logs = results.map((r) => ({
    postId: r.postId,
    platform: r.platform,
    action: "publish" as const,
    method,
    timestamp: new Date().toISOString(),
    success: r.result.success,
    error: r.result.error,
  }));

  return Response.json({ results, logs, method });
}
