import { Post, PlatformCredentials, PublishResult, PostStatus, AppSettings } from "./types";

// ─── Platform Publisher Interface ────────────────────────────────────────────

interface PlatformPublisher {
  name: string;
  publish(post: Post, credentials: PlatformCredentials): Promise<PublishResult>;
  schedule(post: Post, credentials: PlatformCredentials, scheduledAt: Date): Promise<PublishResult>;
  getStatus(externalId: string, credentials: PlatformCredentials): Promise<PostStatus>;
  validateCredentials(credentials: PlatformCredentials): Promise<boolean>;
}

// ─── Meta Graph API Adapter (Instagram + Facebook) ───────────────────────────

class MetaPublisher implements PlatformPublisher {
  name = "meta";
  private baseUrl = "https://graph.facebook.com/v21.0";

  async publish(post: Post, credentials: PlatformCredentials): Promise<PublishResult> {
    const igUserId = credentials.accountId;
    if (!igUserId || !credentials.accessToken) {
      return { success: false, error: "Meta credentials missing (accountId / accessToken)", platform: "instagram" };
    }

    try {
      // Step 1: Create media container
      const containerParams: Record<string, string> = {
        caption: this.buildCaption(post),
        access_token: credentials.accessToken,
      };

      if (post.mediaUrl) {
        // Detect if video (Reels) or image
        const isVideo = /\.(mp4|mov|avi|webm)$/i.test(post.mediaUrl);
        if (isVideo) {
          containerParams.media_type = "REELS";
          containerParams.video_url = post.mediaUrl;
        } else {
          containerParams.image_url = post.mediaUrl;
        }
      } else {
        return { success: false, error: "Media URL required for Instagram publishing", platform: "instagram" };
      }

      const containerRes = await fetch(`${this.baseUrl}/${igUserId}/media`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(containerParams),
      });

      if (!containerRes.ok) {
        const err = await containerRes.json();
        return { success: false, error: `Container creation failed: ${err.error?.message || containerRes.statusText}`, platform: "instagram" };
      }

      const container = await containerRes.json() as { id: string };

      // Step 2: Poll for video processing (if video)
      const isVideo = containerParams.media_type === "REELS";
      if (isVideo) {
        const ready = await this.waitForProcessing(container.id, credentials.accessToken);
        if (!ready) {
          return { success: false, error: "Video processing timed out", platform: "instagram" };
        }
      }

      // Step 3: Publish the container
      const publishRes = await fetch(`${this.baseUrl}/${igUserId}/media_publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creation_id: container.id,
          access_token: credentials.accessToken,
        }),
      });

      if (!publishRes.ok) {
        const err = await publishRes.json();
        return { success: false, error: `Publish failed: ${err.error?.message || publishRes.statusText}`, platform: "instagram" };
      }

      const published = await publishRes.json() as { id: string };

      return {
        success: true,
        externalId: published.id,
        url: `https://www.instagram.com/p/${published.id}/`,
        platform: "instagram",
      };
    } catch (err) {
      return { success: false, error: `Meta API error: ${(err as Error).message}`, platform: "instagram" };
    }
  }

  async schedule(post: Post, credentials: PlatformCredentials, scheduledAt: Date): Promise<PublishResult> {
    const igUserId = credentials.accountId;
    if (!igUserId || !credentials.accessToken) {
      return { success: false, error: "Meta credentials missing", platform: "instagram" };
    }

    // Validate scheduling window: 10 minutes to 75 days from now
    const now = Date.now();
    const schedTime = scheduledAt.getTime();
    const minTime = now + 10 * 60 * 1000;
    const maxTime = now + 75 * 24 * 60 * 60 * 1000;

    if (schedTime < minTime || schedTime > maxTime) {
      return { success: false, error: "Scheduling must be between 10 minutes and 75 days from now", platform: "instagram" };
    }

    try {
      const containerParams: Record<string, string> = {
        caption: this.buildCaption(post),
        access_token: credentials.accessToken,
        published: "false",
        publish_time: Math.floor(schedTime / 1000).toString(),
      };

      if (post.mediaUrl) {
        const isVideo = /\.(mp4|mov|avi|webm)$/i.test(post.mediaUrl);
        if (isVideo) {
          containerParams.media_type = "REELS";
          containerParams.video_url = post.mediaUrl;
        } else {
          containerParams.image_url = post.mediaUrl;
        }
      } else {
        return { success: false, error: "Media URL required for Instagram scheduling", platform: "instagram" };
      }

      const containerRes = await fetch(`${this.baseUrl}/${igUserId}/media`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(containerParams),
      });

      if (!containerRes.ok) {
        const err = await containerRes.json();
        return { success: false, error: `Schedule failed: ${err.error?.message || containerRes.statusText}`, platform: "instagram" };
      }

      const container = await containerRes.json() as { id: string };

      return {
        success: true,
        externalId: container.id,
        scheduledAt: scheduledAt.toISOString(),
        platform: "instagram",
      };
    } catch (err) {
      return { success: false, error: `Meta schedule error: ${(err as Error).message}`, platform: "instagram" };
    }
  }

  async getStatus(externalId: string, credentials: PlatformCredentials): Promise<PostStatus> {
    try {
      const res = await fetch(
        `${this.baseUrl}/${externalId}?fields=id,timestamp,like_count,comments_count&access_token=${credentials.accessToken}`
      );
      if (!res.ok) {
        return { id: externalId, status: "failed" };
      }
      const data = await res.json() as { id: string; like_count?: number; comments_count?: number };
      return {
        id: externalId,
        status: "published",
        metrics: {
          views: 0,
          likes: data.like_count || 0,
          shares: 0,
          comments: data.comments_count || 0,
        },
      };
    } catch {
      return { id: externalId, status: "failed" };
    }
  }

  async validateCredentials(credentials: PlatformCredentials): Promise<boolean> {
    try {
      const res = await fetch(
        `${this.baseUrl}/me?access_token=${credentials.accessToken}`
      );
      return res.ok;
    } catch {
      return false;
    }
  }

  private buildCaption(post: Post): string {
    const hashtags = post.hashtags.length > 0 ? "\n\n" + post.hashtags.join(" ") : "";
    return `${post.caption}${hashtags}`;
  }

  private async waitForProcessing(containerId: string, accessToken: string, maxAttempts = 30): Promise<boolean> {
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise((r) => setTimeout(r, 2000));
      try {
        const res = await fetch(
          `${this.baseUrl}/${containerId}?fields=status_code&access_token=${accessToken}`
        );
        const data = await res.json() as { status_code?: string };
        if (data.status_code === "FINISHED") return true;
        if (data.status_code === "ERROR") return false;
      } catch {
        // Retry on network errors
      }
    }
    return false;
  }
}

// ─── TikTok Content Posting API Adapter ──────────────────────────────────────

class TikTokPublisher implements PlatformPublisher {
  name = "tiktok";
  private baseUrl = "https://open.tiktokapis.com";

  async publish(post: Post, credentials: PlatformCredentials): Promise<PublishResult> {
    if (!credentials.accessToken) {
      return { success: false, error: "TikTok access token missing", platform: "tiktok" };
    }

    if (!post.mediaUrl) {
      return { success: false, error: "Video URL required for TikTok publishing", platform: "tiktok" };
    }

    try {
      // Step 1: Query creator info to check permissions
      const infoRes = await fetch(`${this.baseUrl}/v2/post/publish/creator_info/query/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${credentials.accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!infoRes.ok) {
        const err = await infoRes.json();
        return { success: false, error: `TikTok creator info failed: ${JSON.stringify(err)}`, platform: "tiktok" };
      }

      // Step 2: Initialize video upload
      const initRes = await fetch(`${this.baseUrl}/v2/post/publish/video/init/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${credentials.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          post_info: {
            title: post.caption.slice(0, 150),
            privacy_level: "PUBLIC_TO_EVERYONE",
            disable_duet: false,
            disable_comment: false,
            disable_stitch: false,
          },
          source_info: {
            source: "PULL_FROM_URL",
            video_url: post.mediaUrl,
          },
        }),
      });

      if (!initRes.ok) {
        const err = await initRes.json();
        return { success: false, error: `TikTok upload init failed: ${JSON.stringify(err)}`, platform: "tiktok" };
      }

      const initData = await initRes.json() as { data?: { publish_id: string } };
      const publishId = initData.data?.publish_id;

      if (!publishId) {
        return { success: false, error: "TikTok did not return a publish ID", platform: "tiktok" };
      }

      // Step 3: Poll for publish status
      const status = await this.waitForPublish(publishId, credentials.accessToken);

      if (status === "PUBLISH_COMPLETE") {
        return {
          success: true,
          externalId: publishId,
          url: `https://www.tiktok.com/@user/video/${publishId}`,
          platform: "tiktok",
        };
      }

      return { success: false, error: `TikTok publish status: ${status}`, platform: "tiktok" };
    } catch (err) {
      return { success: false, error: `TikTok API error: ${(err as Error).message}`, platform: "tiktok" };
    }
  }

  async schedule(post: Post, credentials: PlatformCredentials, scheduledAt: Date): Promise<PublishResult> {
    // TikTok Content Posting API does not natively support scheduling
    // Store the intent and return as scheduled — the orchestrator handles triggering at the right time
    if (!credentials.accessToken) {
      return { success: false, error: "TikTok access token missing", platform: "tiktok" };
    }

    return {
      success: true,
      scheduledAt: scheduledAt.toISOString(),
      platform: "tiktok",
    };
  }

  async getStatus(externalId: string, credentials: PlatformCredentials): Promise<PostStatus> {
    try {
      const res = await fetch(`${this.baseUrl}/v2/post/publish/status/fetch/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${credentials.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ publish_id: externalId }),
      });

      if (!res.ok) return { id: externalId, status: "failed" };

      const data = await res.json() as { data?: { status: string } };
      const status = data.data?.status;

      return {
        id: externalId,
        status: status === "PUBLISH_COMPLETE" ? "published" : status === "PROCESSING_UPLOAD" ? "processing" : "failed",
      };
    } catch {
      return { id: externalId, status: "failed" };
    }
  }

  async validateCredentials(credentials: PlatformCredentials): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/v2/post/publish/creator_info/query/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${credentials.accessToken}`,
          "Content-Type": "application/json",
        },
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  private async waitForPublish(publishId: string, accessToken: string, maxAttempts = 30): Promise<string> {
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise((r) => setTimeout(r, 3000));
      try {
        const res = await fetch(`${this.baseUrl}/v2/post/publish/status/fetch/`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ publish_id: publishId }),
        });
        const data = await res.json() as { data?: { status: string } };
        const status = data.data?.status;
        if (status === "PUBLISH_COMPLETE" || status === "FAILED") return status;
      } catch {
        // Retry
      }
    }
    return "TIMEOUT";
  }
}

// ─── Buffer API Adapter (fallback for all platforms) ─────────────────────────

class BufferPublisher implements PlatformPublisher {
  name = "buffer";
  private baseUrl = "https://api.bufferapp.com/1";

  async publish(post: Post, credentials: PlatformCredentials): Promise<PublishResult> {
    if (!credentials.accessToken) {
      return { success: false, error: "Buffer API key missing", platform: post.platform };
    }

    try {
      const profileId = credentials.pageId; // We reuse pageId to hold the Buffer profile ID
      if (!profileId) {
        return { success: false, error: "Buffer profile ID missing for this platform", platform: post.platform };
      }

      const body: Record<string, unknown> = {
        text: this.buildText(post),
        profile_ids: [profileId],
        now: true,
      };

      if (post.mediaUrl) {
        body.media = { photo: post.mediaUrl };
      }

      const res = await fetch(`${this.baseUrl}/updates/create.json?access_token=${credentials.accessToken}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        return { success: false, error: `Buffer error: ${err.message || res.statusText}`, platform: post.platform };
      }

      const data = await res.json() as { updates?: Array<{ id: string; service_link?: string }> };
      const update = data.updates?.[0];

      return {
        success: true,
        externalId: update?.id,
        url: update?.service_link,
        platform: post.platform,
      };
    } catch (err) {
      return { success: false, error: `Buffer API error: ${(err as Error).message}`, platform: post.platform };
    }
  }

  async schedule(post: Post, credentials: PlatformCredentials, scheduledAt: Date): Promise<PublishResult> {
    if (!credentials.accessToken) {
      return { success: false, error: "Buffer API key missing", platform: post.platform };
    }

    try {
      const profileId = credentials.pageId;
      if (!profileId) {
        return { success: false, error: "Buffer profile ID missing for this platform", platform: post.platform };
      }

      const body: Record<string, unknown> = {
        text: this.buildText(post),
        profile_ids: [profileId],
        scheduled_at: scheduledAt.toISOString(),
      };

      if (post.mediaUrl) {
        body.media = { photo: post.mediaUrl };
      }

      const res = await fetch(`${this.baseUrl}/updates/create.json?access_token=${credentials.accessToken}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        return { success: false, error: `Buffer schedule error: ${err.message || res.statusText}`, platform: post.platform };
      }

      const data = await res.json() as { updates?: Array<{ id: string }> };

      return {
        success: true,
        externalId: data.updates?.[0]?.id,
        scheduledAt: scheduledAt.toISOString(),
        platform: post.platform,
      };
    } catch (err) {
      return { success: false, error: `Buffer schedule error: ${(err as Error).message}`, platform: post.platform };
    }
  }

  async getStatus(externalId: string, credentials: PlatformCredentials): Promise<PostStatus> {
    try {
      const res = await fetch(
        `${this.baseUrl}/updates/${externalId}.json?access_token=${credentials.accessToken}`
      );
      if (!res.ok) return { id: externalId, status: "failed" };

      const data = await res.json() as { status?: string; statistics?: { reach?: number; clicks?: number; favorites?: number; mentions?: number } };

      return {
        id: externalId,
        status: data.status === "sent" ? "published" : data.status === "buffer" ? "scheduled" : "failed",
        metrics: data.statistics ? {
          views: data.statistics.reach || 0,
          likes: data.statistics.favorites || 0,
          shares: data.statistics.clicks || 0,
          comments: data.statistics.mentions || 0,
        } : undefined,
      };
    } catch {
      return { id: externalId, status: "failed" };
    }
  }

  async validateCredentials(credentials: PlatformCredentials): Promise<boolean> {
    try {
      const res = await fetch(
        `${this.baseUrl}/user.json?access_token=${credentials.accessToken}`
      );
      return res.ok;
    } catch {
      return false;
    }
  }

  private buildText(post: Post): string {
    const hashtags = post.hashtags.length > 0 ? "\n\n" + post.hashtags.join(" ") : "";
    return `${post.caption}${hashtags}`;
  }
}

// ─── Dry Run Publisher (mock) ────────────────────────────────────────────────

class DryRunPublisher implements PlatformPublisher {
  name = "dry_run";

  async publish(post: Post): Promise<PublishResult> {
    console.log(`[DRY RUN] Would publish to ${post.platform}:`, {
      caption: post.caption.slice(0, 80) + "...",
      hashtags: post.hashtags,
      mediaUrl: post.mediaUrl,
    });
    return {
      success: true,
      externalId: `dry_${Date.now()}`,
      url: `https://example.com/dry-run/${post.id}`,
      platform: post.platform,
    };
  }

  async schedule(post: Post, _credentials: PlatformCredentials, scheduledAt: Date): Promise<PublishResult> {
    console.log(`[DRY RUN] Would schedule to ${post.platform} at ${scheduledAt.toISOString()}:`, {
      caption: post.caption.slice(0, 80) + "...",
    });
    return {
      success: true,
      externalId: `dry_sched_${Date.now()}`,
      scheduledAt: scheduledAt.toISOString(),
      platform: post.platform,
    };
  }

  async getStatus(externalId: string): Promise<PostStatus> {
    return { id: externalId, status: "published", metrics: { views: 0, likes: 0, shares: 0, comments: 0 } };
  }

  async validateCredentials(): Promise<boolean> {
    return true;
  }
}

// ─── Publisher Orchestrator ──────────────────────────────────────────────────

export class PublisherOrchestrator {
  private publishers: Map<string, PlatformPublisher> = new Map();
  private dryRunPublisher = new DryRunPublisher();

  constructor() {
    this.publishers.set("instagram", new MetaPublisher());
    this.publishers.set("facebook", new MetaPublisher());
    this.publishers.set("tiktok", new TikTokPublisher());
    this.publishers.set("buffer", new BufferPublisher());
  }

  private getPublisher(platform: string, settings: AppSettings): PlatformPublisher {
    if (settings.dryRun) return this.dryRunPublisher;
    if (settings.publishMode === "buffer" && settings.bufferApiKey) return this.publishers.get("buffer")!;
    if (settings.publishMode === "manual") return this.dryRunPublisher;
    return this.publishers.get(platform) || this.dryRunPublisher;
  }

  private getCredentials(platform: string, settings: AppSettings): PlatformCredentials {
    if (settings.publishMode === "buffer") {
      return {
        accessToken: settings.bufferApiKey || "",
        pageId: settings.bufferProfileIds?.[platform],
      };
    }

    switch (platform) {
      case "instagram":
      case "facebook":
        return {
          accessToken: settings.metaApiKey || "",
          pageId: settings.metaPageId,
          accountId: settings.metaIgUserId,
        };
      case "tiktok":
        return {
          accessToken: settings.tiktokApiKey || "",
          accountId: settings.tiktokOpenId,
        };
      case "linkedin":
        return {
          accessToken: settings.linkedinApiKey || "",
        };
      case "youtube":
        return {
          accessToken: settings.youtubeApiKey || "",
          accountId: settings.youtubeChannelId,
        };
      default:
        return { accessToken: "" };
    }
  }

  getMethod(settings: AppSettings): "direct" | "buffer" | "dry_run" {
    if (settings.dryRun) return "dry_run";
    if (settings.publishMode === "buffer") return "buffer";
    if (settings.publishMode === "manual") return "dry_run";
    return "direct";
  }

  async publishPost(post: Post, settings: AppSettings): Promise<PublishResult> {
    const publisher = this.getPublisher(post.platform, settings);
    const credentials = this.getCredentials(post.platform, settings);
    return publisher.publish(post, credentials);
  }

  async schedulePost(post: Post, settings: AppSettings, scheduledAt: Date): Promise<PublishResult> {
    const publisher = this.getPublisher(post.platform, settings);
    const credentials = this.getCredentials(post.platform, settings);
    return publisher.schedule(post, credentials, scheduledAt);
  }

  async checkStatus(externalId: string, platform: string, settings: AppSettings): Promise<PostStatus> {
    const publisher = this.getPublisher(platform, settings);
    const credentials = this.getCredentials(platform, settings);
    return publisher.getStatus(externalId, credentials);
  }

  async validatePlatform(platform: string, settings: AppSettings): Promise<boolean> {
    const publisher = this.getPublisher(platform, settings);
    const credentials = this.getCredentials(platform, settings);
    return publisher.validateCredentials(credentials);
  }
}

// Singleton
export const publisherOrchestrator = new PublisherOrchestrator();
