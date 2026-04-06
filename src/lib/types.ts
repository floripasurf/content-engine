export interface Brand {
  id: string;
  name: string;
  slug: string;
  description: string;
  tone: string;
  targetAudience: string;
  competitors: string;
  painPoints: string;
  colors: { primary: string; secondary: string };
  logoEmoji: string;
  platforms: string[];
  createdAt: string;
}

export interface ContentPillar {
  id: string;
  name: string;
  slug: string;
  description: string;
  emotion: string;
}

export interface ScriptTemplate {
  id: string;
  name: string;
  slug: string;
  pillarId: string;
  structure: string;
  hookPattern: string;
  ctaPattern: string;
  format: string;
  duration: number;
  examples: string;
}

export interface Script {
  id: string;
  brandId: string;
  pillarId: string;
  templateId: string | null;
  title: string;
  hook: string;
  body: string;
  visualNotes: string;
  voiceoverText: string | null;
  duration: number;
  status: "draft" | "review" | "approved" | "rejected" | "produced";
  feedback: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  id: string;
  scriptId: string;
  brandId: string;
  platform: string;
  caption: string;
  hashtags: string[];
  cta: string;
  scheduledAt: string | null;
  publishedAt: string | null;
  status: "draft" | "scheduled" | "published" | "failed";
  mediaUrl: string | null;
  metrics: { views: number; likes: number; shares: number; comments: number } | null;
  createdAt: string;
  externalId?: string;
  externalUrl?: string;
  publishError?: string;
  publishAttempts?: number;
  publishMethod?: "direct" | "buffer";
}

export interface PlatformCredentials {
  accessToken: string;
  refreshToken?: string;
  pageId?: string;
  accountId?: string;
}

export interface PublishResult {
  success: boolean;
  externalId?: string;
  url?: string;
  error?: string;
  scheduledAt?: string;
  platform?: string;
}

export interface PostStatus {
  id: string;
  status: "scheduled" | "published" | "failed" | "processing";
  metrics?: { views: number; likes: number; shares: number; comments: number };
  url?: string;
}

export interface PublishLog {
  id: string;
  postId: string;
  platform: string;
  action: "schedule" | "publish" | "check_status" | "error";
  method: "direct" | "buffer" | "dry_run";
  request?: object;
  response?: object;
  timestamp: string;
  success: boolean;
  error?: string;
}

export interface CanvaBrandTemplates {
  coverTemplateId: string;
  contentTemplateId: string;
  comparisonTemplateId: string;
  checklistTemplateId: string;
  ctaTemplateId: string;
}

export interface CanvaSettings {
  canvaAccessToken?: string;
  brandTemplates: Record<string, CanvaBrandTemplates>;
}

export interface AppSettings {
  claudeApiKey: string;
  metaApiKey: string;
  tiktokApiKey: string;
  postingSchedule: Record<string, { times: string[]; platforms: string[] }>;
  bufferApiKey?: string;
  bufferProfileIds?: Record<string, string>;
  metaPageId?: string;
  metaIgUserId?: string;
  tiktokOpenId?: string;
  linkedinApiKey?: string;
  youtubeApiKey?: string;
  youtubeChannelId?: string;
  publishMode: "direct" | "buffer" | "manual";
  dryRun: boolean;
  autoSchedule?: boolean;
  optimizedTimes?: Record<string, string[]>;
  canva?: CanvaSettings;
  minimaxApiKey?: string;
  videoSource?: "pexels" | "minimax" | "none";
}
