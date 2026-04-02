import { createClient, type Video } from "pexels";
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

  // Extract visual cues — DRAMATIC, scroll-stopping footage
  const combined = `${hook} ${body}`.toLowerCase();
  const visualMap: [string, string[]][] = [
    // Home repair — dramatic problems
    ["torneira", ["water flooding kitchen disaster", "water pipe burst spray", "frustrated woman water leak"]],
    ["encanador", ["water pipe burst flooding", "plumber emergency repair", "water damage house"]],
    ["eletricista", ["electrical sparks short circuit", "power outage dark house candle", "electric wire sparks danger"]],
    ["luz", ["electrical sparks fire", "power outage blackout city", "light bulb explosion slow motion"]],
    ["pintor", ["paint disaster mess wall", "paint splatter fail", "beautiful wall painting transformation"]],
    ["pedreiro", ["construction demolition dramatic", "wall cracking breaking", "house renovation before after"]],

    // Frustration & waiting
    ["cozinha", ["kitchen disaster mess flood", "woman stressed kitchen chaos"]],
    ["celular", ["angry person smashing phone", "person stressed phone waiting", "phone screen cracked"]],
    ["whatsapp", ["person typing phone angry", "read receipts blue ticks waiting", "phone message ignored"]],
    ["orçamento", ["money burning fire", "empty wallet frustrated", "person counting coins stressed"]],
    ["espera", ["person angry waiting clock", "time lapse clock fast", "bored frustrated couch"]],
    ["não apareceu", ["empty room nobody came", "stood up waiting alone", "looking out window waiting"]],

    // Social & family
    ["grupo", ["family arguing dinner table", "chaotic family group chat", "loud family celebration"]],
    ["família", ["family laughing together dinner", "grandmother phone confused", "family chaos funny"]],
    ["vizin", ["neighbors talking fence gossiping", "knocking door nobody answers"]],
    ["indicação", ["word of mouth telephone game", "confused person many opinions"]],

    // Resolution & satisfaction
    ["resolveu", ["celebration confetti happy", "thumbs up success satisfied", "relief deep breath smile"]],
    ["avalia", ["five stars glowing review", "happy customer handshake", "phone screen five stars"]],
    ["profissional", ["confident worker hero pose", "professional tools organized", "handyman saves the day"]],
    ["chamei", ["smartphone app smooth demo", "quick easy phone solution", "instant notification success"]],

    // Pain of competitors
    ["spam", ["phone ringing nonstop annoying", "notification overload phone stress", "person blocking phone calls"]],
    ["pago", ["money thrown away trash", "credit card declined frustrated", "burning money waste"]],
    ["caro", ["expensive price tag shock", "jaw drop price reaction", "empty pockets turned out"]],
    ["google", ["scrolling endless search results", "confused person too many options", "information overload screen"]],
  ];

  const scriptQueries: string[] = [];
  for (const [keyword, queries] of visualMap) {
    if (combined.includes(keyword)) {
      for (const q of queries) {
        if (scriptQueries.length < 4) scriptQueries.push(q);
      }
    }
  }

  // Prefer script-specific over generic brand queries
  const all = scriptQueries.length >= 3 ? scriptQueries : [...scriptQueries, ...base];
  return [...new Set(all)].slice(0, 6);
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
        per_page: 5,
        orientation: "portrait",
        size: "medium",
      });

      if ("videos" in result) {
        for (const video of result.videos) {
          if (videos.length >= count) break;

          // Find a suitable video file (prefer HD, portrait)
          const file = (video as Video).video_files
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

/**
 * Fetch ONE stock video per keyword — for scene-by-scene matching.
 * Each keyword maps to one scene in the video.
 */
export async function fetchStockByKeywords(
  keywords: string[],
  tempDir: string = "/tmp/content-engine-stock"
): Promise<StockVideo[]> {
  if (!PEXELS_API_KEY || keywords.length === 0) {
    console.log("[stock] No API key or keywords, using fallback");
    return [];
  }

  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const client = createClient(PEXELS_API_KEY);
  const videos: StockVideo[] = [];

  for (let i = 0; i < keywords.length; i++) {
    const query = keywords[i];
    console.log(`[stock] Scene ${i + 1}/${keywords.length}: "${query}"`);

    try {
      const result = await client.videos.search({
        query,
        per_page: 3,
        orientation: "portrait",
        size: "medium",
      });

      if ("videos" in result && result.videos.length > 0) {
        // Pick the best portrait video
        let found = false;
        for (const video of result.videos) {
          if (found) break;
          const file = (video as Video).video_files
            .filter((f) => f.width && f.height && f.width < f.height)
            .filter((f) => (f.height || 0) >= 720)
            .sort((a, b) => (a.height || 0) - (b.height || 0))[0];

          if (!file?.link) continue;

          const localPath = path.join(tempDir, `scene_${i}.mp4`);
          try {
            await downloadFile(file.link, localPath);
            videos.push({
              localPath,
              width: file.width || 1080,
              height: file.height || 1920,
              duration: video.duration || 10,
            });
            found = true;
            console.log(`[stock]   ✓ Downloaded`);
          } catch {
            console.warn(`[stock]   ✗ Download failed`);
          }
        }

        if (!found) {
          console.warn(`[stock]   ✗ No portrait video found for "${query}"`);
        }
      } else {
        console.warn(`[stock]   ✗ No results for "${query}"`);
      }
    } catch (err) {
      console.warn(`[stock]   ✗ Search failed:`, err);
    }
  }

  return videos;
}

export { getSearchQueries };
