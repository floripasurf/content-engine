#!/usr/bin/env node

/**
 * Render all carousel slides as 1080x1350 PNG stills using Remotion.
 *
 * Usage: node render-carousels.mjs [--brand chamei|squad] [--id carousel-id]
 *
 * Output: ~/Desktop/CLAUDE/ContentEngine/carousels/{brand}/{carousel-slug}/slide-01-cover.png
 */

import path from "path";
import fs from "fs";
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";

// We need to import the carousel data. Since it's TS, we read and extract inline.
// Instead, dynamically import after bundling — but for data we just inline the import
// via a small workaround: compile TS with esbuild first.

import { execSync } from "child_process";

// Step 1: Compile carousel-content.ts to a temp JS file
const srcTs = path.resolve("src/lib/carousel-content.ts");
const tmpJs = path.resolve(".carousel-content-compiled.mjs");

console.log("[1/4] Compiling carousel content data...");
execSync(
  `./node_modules/.bin/esbuild ${srcTs} --bundle --format=esm --outfile=${tmpJs} --platform=node`,
  { stdio: "inherit" }
);

const { allCarousels, brandConfigs } = await import(tmpJs);

// Clean up temp file
fs.unlinkSync(tmpJs);

// Parse CLI args
const args = process.argv.slice(2);
let filterBrand = null;
let filterId = null;

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--brand" && args[i + 1]) filterBrand = args[++i];
  if (args[i] === "--id" && args[i + 1]) filterId = args[++i];
}

const carouselsToRender = allCarousels.filter((c) => {
  if (filterBrand && c.brand !== filterBrand) return false;
  if (filterId && c.id !== filterId) return false;
  return true;
});

console.log(`[2/4] Bundling Remotion project...`);
const bundleLocation = await bundle({
  entryPoint: path.resolve("src/remotion/index.ts"),
  webpackOverride: (config) => config,
});

const BASE_DIR = path.join(
  process.env.HOME,
  "Desktop/CLAUDE/ContentEngine/carousels"
);

console.log(`[3/4] Rendering ${carouselsToRender.length} carousels...`);

let totalSlides = 0;
let rendered = 0;

for (const carousel of carouselsToRender) {
  totalSlides += carousel.slides.length;
}

for (const carousel of carouselsToRender) {
  const config = brandConfigs[carousel.brand];
  if (!config) {
    console.warn(`  SKIP: no brand config for "${carousel.brand}"`);
    continue;
  }

  // Create slug from title
  const slug = carousel.id + "-" + carousel.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);

  const outDir = path.join(BASE_DIR, carousel.brand, slug);
  fs.mkdirSync(outDir, { recursive: true });

  console.log(`\n  Carousel: ${carousel.id} — ${carousel.title}`);
  console.log(`  Output:   ${outDir}`);

  for (let i = 0; i < carousel.slides.length; i++) {
    const slide = carousel.slides[i];
    const padded = String(i + 1).padStart(2, "0");
    const suffix = i === 0 ? "cover" : slide.type;
    const fileName = `slide-${padded}-${suffix}.png`;
    const outputPath = path.join(outDir, fileName);

    const inputProps = {
      slideIndex: i,
      totalSlides: carousel.slides.length,
      title: carousel.title,
      slideContent: slide.content,
      slideSubtext: slide.subtext || "",
      slideEmoji: slide.emoji || "",
      slideNumber: slide.number || "",
      brandName: config.brandName,
      brandEmoji: config.brandEmoji,
      accentColor: config.accentColor,
      secondaryColor: config.secondaryColor,
      slideType: slide.type,
    };

    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: "CarouselSlide",
      inputProps,
    });

    await renderStill({
      composition,
      serveUrl: bundleLocation,
      output: outputPath,
      inputProps,
    });

    rendered++;
    process.stdout.write(
      `    [${rendered}/${totalSlides}] ${fileName}\n`
    );
  }
}

console.log(`\n[4/4] Done! Rendered ${rendered} slides to ${BASE_DIR}`);
