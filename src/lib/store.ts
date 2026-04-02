import { Brand, ContentPillar, ScriptTemplate, Script, Post, PublishLog, AppSettings } from "./types";
import { seedBrands, seedPillars, seedTemplates } from "./seed-data";
import { sampleScripts } from "./sample-scripts";

const STORAGE_KEYS = {
  brands: "ce_brands",
  pillars: "ce_pillars",
  templates: "ce_templates",
  scripts: "ce_scripts",
  posts: "ce_posts",
  settings: "ce_settings",
  initialized: "ce_initialized",
  publishLogs: "ce_publish_logs",
} as const;

function getItem<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

// Initialize seed data on first load
export function initializeStore(): void {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(STORAGE_KEYS.initialized)) return;

  setItem(STORAGE_KEYS.brands, seedBrands);
  setItem(STORAGE_KEYS.pillars, seedPillars);
  setItem(STORAGE_KEYS.templates, seedTemplates);

  // Seed sample scripts
  const scripts: Script[] = sampleScripts.map((s, i) => ({
    ...s,
    id: `script_seed_${i}`,
    createdAt: new Date(Date.now() - Math.random() * 7 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  }));
  setItem(STORAGE_KEYS.scripts, scripts);

  // Seed some posts
  const posts: Post[] = scripts.slice(0, 8).map((script, i) => {
    const brand = seedBrands.find((b) => b.id === script.brandId)!;
    const platform = brand.platforms[i % brand.platforms.length];
    const daysOffset = Math.floor(i / 2);
    const scheduledAt = new Date();
    scheduledAt.setDate(scheduledAt.getDate() + daysOffset);
    scheduledAt.setHours(9 + (i % 3) * 4, 0, 0, 0);

    return {
      id: `post_seed_${i}`,
      scriptId: script.id,
      brandId: script.brandId,
      platform,
      caption: `${script.hook}\n\n${script.body.split("\n").slice(0, 2).join(" ").slice(0, 120)}...\n\n#${brand.slug} #marketing #viral`,
      hashtags: [`#${brand.slug}`, "#marketing", "#viral", "#conteudo", "#brasil"],
      cta: "Link na bio",
      scheduledAt: scheduledAt.toISOString(),
      publishedAt: i < 3 ? new Date(Date.now() - (3 - i) * 86400000).toISOString() : null,
      status: i < 3 ? "published" : i < 6 ? "scheduled" : "draft",
      mediaUrl: null,
      metrics: i < 3
        ? {
            views: Math.floor(Math.random() * 50000) + 5000,
            likes: Math.floor(Math.random() * 3000) + 500,
            shares: Math.floor(Math.random() * 500) + 50,
            comments: Math.floor(Math.random() * 200) + 20,
          }
        : null,
      createdAt: new Date(Date.now() - 7 * 86400000 + i * 86400000).toISOString(),
    };
  });
  setItem(STORAGE_KEYS.posts, posts);
  localStorage.setItem(STORAGE_KEYS.initialized, "true");
}

// Brand operations
export const brandStore = {
  getAll: (): Brand[] => getItem(STORAGE_KEYS.brands, seedBrands),
  getById: (id: string): Brand | undefined =>
    brandStore.getAll().find((b) => b.id === id),
  getBySlug: (slug: string): Brand | undefined =>
    brandStore.getAll().find((b) => b.slug === slug),
  create: (data: Omit<Brand, "id" | "createdAt">): Brand => {
    const brand: Brand = { ...data, id: `brand_${generateId()}`, createdAt: new Date().toISOString() };
    const all = brandStore.getAll();
    setItem(STORAGE_KEYS.brands, [...all, brand]);
    return brand;
  },
  update: (id: string, data: Partial<Brand>): Brand | undefined => {
    const all = brandStore.getAll();
    const idx = all.findIndex((b) => b.id === id);
    if (idx === -1) return undefined;
    all[idx] = { ...all[idx], ...data };
    setItem(STORAGE_KEYS.brands, all);
    return all[idx];
  },
  delete: (id: string): void => {
    setItem(STORAGE_KEYS.brands, brandStore.getAll().filter((b) => b.id !== id));
  },
};

// Pillar operations
export const pillarStore = {
  getAll: (): ContentPillar[] => getItem(STORAGE_KEYS.pillars, seedPillars),
  getById: (id: string): ContentPillar | undefined =>
    pillarStore.getAll().find((p) => p.id === id),
};

// Template operations
export const templateStore = {
  getAll: (): ScriptTemplate[] => getItem(STORAGE_KEYS.templates, seedTemplates),
  getById: (id: string): ScriptTemplate | undefined =>
    templateStore.getAll().find((t) => t.id === id),
  getByPillar: (pillarId: string): ScriptTemplate[] =>
    templateStore.getAll().filter((t) => t.pillarId === pillarId),
};

// Script operations
export const scriptStore = {
  getAll: (): Script[] => getItem(STORAGE_KEYS.scripts, []),
  getById: (id: string): Script | undefined =>
    scriptStore.getAll().find((s) => s.id === id),
  getByBrand: (brandId: string): Script[] =>
    scriptStore.getAll().filter((s) => s.brandId === brandId),
  getByStatus: (status: Script["status"]): Script[] =>
    scriptStore.getAll().filter((s) => s.status === status),
  create: (data: Omit<Script, "id" | "createdAt" | "updatedAt">): Script => {
    const now = new Date().toISOString();
    const script: Script = { ...data, id: `script_${generateId()}`, createdAt: now, updatedAt: now };
    setItem(STORAGE_KEYS.scripts, [...scriptStore.getAll(), script]);
    return script;
  },
  update: (id: string, data: Partial<Script>): Script | undefined => {
    const all = scriptStore.getAll();
    const idx = all.findIndex((s) => s.id === id);
    if (idx === -1) return undefined;
    all[idx] = { ...all[idx], ...data, updatedAt: new Date().toISOString() };
    setItem(STORAGE_KEYS.scripts, all);
    return all[idx];
  },
  delete: (id: string): void => {
    setItem(STORAGE_KEYS.scripts, scriptStore.getAll().filter((s) => s.id !== id));
  },
};

// Post operations
export const postStore = {
  getAll: (): Post[] => getItem(STORAGE_KEYS.posts, []),
  getById: (id: string): Post | undefined =>
    postStore.getAll().find((p) => p.id === id),
  getByBrand: (brandId: string): Post[] =>
    postStore.getAll().filter((p) => p.brandId === brandId),
  getByStatus: (status: Post["status"]): Post[] =>
    postStore.getAll().filter((p) => p.status === status),
  getByDateRange: (start: string, end: string): Post[] =>
    postStore.getAll().filter((p) => {
      if (!p.scheduledAt) return false;
      return p.scheduledAt >= start && p.scheduledAt <= end;
    }),
  create: (data: Omit<Post, "id" | "createdAt">): Post => {
    const post: Post = { ...data, id: `post_${generateId()}`, createdAt: new Date().toISOString() };
    setItem(STORAGE_KEYS.posts, [...postStore.getAll(), post]);
    return post;
  },
  update: (id: string, data: Partial<Post>): Post | undefined => {
    const all = postStore.getAll();
    const idx = all.findIndex((p) => p.id === id);
    if (idx === -1) return undefined;
    all[idx] = { ...all[idx], ...data };
    setItem(STORAGE_KEYS.posts, all);
    return all[idx];
  },
  delete: (id: string): void => {
    setItem(STORAGE_KEYS.posts, postStore.getAll().filter((p) => p.id !== id));
  },
};

// Settings — uses AppSettings from types.ts
export type { AppSettings } from "./types";

const defaultSettings: AppSettings = {
  claudeApiKey: "",
  metaApiKey: "",
  tiktokApiKey: "",
  postingSchedule: {
    monday: { times: ["09:00", "13:00", "19:00"], platforms: ["instagram", "tiktok"] },
    tuesday: { times: ["09:00", "13:00", "19:00"], platforms: ["instagram", "tiktok"] },
    wednesday: { times: ["09:00", "13:00", "19:00"], platforms: ["instagram", "tiktok"] },
    thursday: { times: ["09:00", "13:00", "19:00"], platforms: ["instagram", "tiktok"] },
    friday: { times: ["09:00", "13:00", "19:00"], platforms: ["instagram", "tiktok"] },
    saturday: { times: ["10:00", "15:00"], platforms: ["instagram"] },
    sunday: { times: ["10:00", "15:00"], platforms: ["instagram"] },
  },
  publishMode: "manual",
  dryRun: true,
  autoSchedule: false,
  optimizedTimes: {
    instagram: ["09:00", "12:00", "18:00", "21:00"],
    tiktok: ["07:00", "12:00", "17:00", "21:00", "23:00"],
    youtube: ["14:00", "17:00"],
    linkedin: ["08:00", "12:00", "17:00"],
  },
};

export const settingsStore = {
  get: (): AppSettings => getItem(STORAGE_KEYS.settings, defaultSettings),
  update: (data: Partial<AppSettings>): AppSettings => {
    const current = settingsStore.get();
    const updated = { ...current, ...data };
    setItem(STORAGE_KEYS.settings, updated);
    return updated;
  },
};

// Publish Log operations
export const publishLogStore = {
  getAll: (): PublishLog[] => getItem(STORAGE_KEYS.publishLogs, []),
  getByPost: (postId: string): PublishLog[] =>
    publishLogStore.getAll().filter((l) => l.postId === postId),
  getRecent: (limit: number): PublishLog[] =>
    publishLogStore.getAll()
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit),
  add: (log: Omit<PublishLog, "id">): PublishLog => {
    const entry: PublishLog = { ...log, id: `log_${generateId()}` };
    const all = publishLogStore.getAll();
    setItem(STORAGE_KEYS.publishLogs, [...all, entry]);
    return entry;
  },
  clear: (): void => {
    setItem(STORAGE_KEYS.publishLogs, []);
  },
};
