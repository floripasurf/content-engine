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
}
