import { createClient, type VideoWithVideoFiles } from "pexels";
import fs from "fs";
import path from "path";
import https from "https";
import http from "http";

const PEXELS_API_KEY = process.env.PEXELS_API_KEY || "";

interface StockVideo {
  localPath: string;
  width: number;
  height: number;
  duration: number;
}

function getSearchQueries(hook: string, body: string, brandSlug: string): string[] {
  const brandQueries: Record<string, string[]> = {
    chamei: ["home repair tools", "plumber working", "smartphone app use", "happy customer service"],
    delas: ["beauty salon", "nail art close up", "hair styling", "spa treatment"],
    soninho: ["child sleeping peacefully", "bedtime story", "night sky stars"],
    simplifica: ["senior using phone", "elderly technology", "simple interface"],
    spark: ["couple coffee shop", "dating smartphone", "young people city"],
    blackcube: ["modern office laptop", "code programming", "startup team"],
    squad: ["business team meeting", "performance review", "office teamwork"],
  };

  const base = brandQueries[brandSlug] || ["urban city", "technology", "people lifestyle"];

  // Extract visual cues from script text
  const combined = `${hook} ${body}`.toLowerCase();
  const visualMap: [string, string][] = [
    ["torneira", "kitchen faucet repair"],
    ["encanador", "plumber pipe repair"],
    ["eletricista", "electrician working"],
    ["cozinha", "modern kitchen"],
    ["celular", "smartphone screen"],
    ["app", "mobile app usage"],
    ["familia", "family living room"],
    ["whatsapp", "phone messaging"],
    ["grupo", "family gathering"],
    ["casa", "house interior modern"],
    ["servi", "professional worker"],
    ["orçamento", "calculator budget"],
    ["avalia", "five star review"],
    ["profissional", "professional handyman"],
  ];

  const scriptQueries: string[] = [];
  for (const [keyword, query] of visualMap) {
    if (combined.includes(keyword) && scriptQueries.length < 3) {
      scriptQueries.push(query);
    }
  }

  // Combine: brand defaults + script-specific, deduplicate
  const all = [...scriptQueries, ...base];
  return [...new Set(all)].slice(0, 5);
}

function downloadFile(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const getter = url.startsWith("https") ? https : http;
    getter.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirect = response.headers.location;
        if (redirect) {
          downloadFile(redirect, dest).then(resolve).catch(reject);
          return;
        }
      }
      response.pipe(file);
      file.on("finish", () => {
        file.close();
        resolve();
      });
    }).on("error", (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

export async function fetchStockVideos(
  hook: string,
  body: string,
  brandSlug: string,
  count: number = 3,
  tempDir: string = "/tmp/content-engine-stock"
): Promise<StockVideo[]> {
  if (!PEXELS_API_KEY) {
    console.log("[stock] No PEXELS_API_KEY set, using animated gradient fallback");
    return [];
  }

  const queries = getSearchQueries(hook, body, brandSlug);
  console.log(`[stock] Searching Pexels for: ${queries.join(", ")}`);

  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const client = createClient(PEXELS_API_KEY);
  const videos: StockVideo[] = [];

  for (const query of queries) {
    if (videos.length >= count) break;

    try {
      const result = await client.videos.search({
        query,
        per_page: 3,
        orientation: "portrait",
        size: "medium",
      });

      if ("videos" in result) {
        for (const video of result.videos) {
          if (videos.length >= count) break;

          // Find a suitable video file (prefer HD, portrait)
          const file = (video as VideoWithVideoFiles).video_files
            .filter((f) => f.width && f.height && f.width < f.height) // portrait
            .filter((f) => (f.height || 0) >= 720)
            .sort((a, b) => (a.height || 0) - (b.height || 0))[0];

          if (!file?.link) continue;

          const localPath = path.join(tempDir, `stock_${Date.now()}_${videos.length}.mp4`);

          try {
            await downloadFile(file.link, localPath);
            videos.push({
              localPath,
              width: file.width || 1080,
              height: file.height || 1920,
              duration: video.duration || 10,
            });
            console.log(`[stock] Downloaded: ${query} -> ${localPath}`);
          } catch (dlErr) {
            console.warn(`[stock] Download failed for ${query}:`, dlErr);
          }
        }
      }
    } catch (err) {
      console.warn(`[stock] Pexels search failed for "${query}":`, err);
    }
  }

  return videos;
}

export { getSearchQueries };
