import { publisherOrchestrator } from "@/lib/publisher";
import { AppSettings, PostStatus } from "@/lib/types";

export async function POST(request: Request) {
  const body = await request.json() as {
    posts: Array<{ externalId: string; platform: string }>;
    settings: AppSettings;
  };

  const { posts, settings } = body;

  if (!posts?.length || !settings) {
    return Response.json({ error: "posts array and settings are required" }, { status: 400 });
  }

  const statuses: Array<{ externalId: string; platform: string; status: PostStatus }> = [];

  for (const post of posts) {
    try {
      const status = await publisherOrchestrator.checkStatus(post.externalId, post.platform, settings);
      statuses.push({ externalId: post.externalId, platform: post.platform, status });
    } catch {
      statuses.push({
        externalId: post.externalId,
        platform: post.platform,
        status: { id: post.externalId, status: "failed" },
      });
    }
  }

  return Response.json({ statuses });
}
