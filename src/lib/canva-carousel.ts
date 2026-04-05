// Service that maps Content Engine carousel data to Canva designs
import { CanvaClient, type CanvaDesign } from "./canva-api";
import type { CarouselData, CarouselSlideData } from "./carousel-content";
import { brandConfigs } from "./carousel-content";

export interface CarouselTemplate {
  brandSlug: string;
  coverTemplateId: string;
  contentTemplateId: string;
  comparisonTemplateId: string;
  checklistTemplateId: string;
  ctaTemplateId: string;
}

export interface CarouselGenerationResult {
  designs: CanvaDesign[];
  exportUrls: string[];
  errors: string[];
}

/**
 * Pick the right Canva template ID based on the slide type.
 */
function getTemplateId(
  slideType: CarouselSlideData["type"],
  templates: CarouselTemplate,
): string {
  const map: Record<CarouselSlideData["type"], string> = {
    cover: templates.coverTemplateId,
    content: templates.contentTemplateId,
    comparison: templates.comparisonTemplateId,
    checklist: templates.checklistTemplateId,
    cta: templates.ctaTemplateId,
  };
  return map[slideType];
}

/**
 * Build the autofill data map for a slide.
 * These keys must match the placeholder names in the Canva template:
 *   {{title}}, {{subtitle}}, {{number}}, {{brand_name}}
 */
function buildAutofillData(
  slide: CarouselSlideData,
  carousel: CarouselData,
): Record<string, string> {
  const config = brandConfigs[carousel.brand];
  const data: Record<string, string> = {
    title: slide.content,
    subtitle: slide.subtext || "",
    brand_name: config?.brandName || carousel.brand,
  };

  if (slide.number) {
    data.number = slide.number;
  }
  if (slide.emoji) {
    data.number = slide.emoji;
  }

  return data;
}

/**
 * Generate all slides of a carousel in Canva.
 * Creates one design per slide from the matching brand template,
 * autofills it, then exports all as PNG.
 */
export async function generateCanvaCarousel(
  carousel: CarouselData,
  templates: CarouselTemplate,
  client: CanvaClient,
): Promise<CarouselGenerationResult> {
  const designs: CanvaDesign[] = [];
  const exportUrls: string[] = [];
  const errors: string[] = [];

  // Step 1: Create & autofill each slide
  for (let i = 0; i < carousel.slides.length; i++) {
    const slide = carousel.slides[i];
    const templateId = getTemplateId(slide.type, templates);

    if (!templateId) {
      errors.push(
        `Slide ${i + 1} (${slide.type}): template ID nao configurado`,
      );
      continue;
    }

    try {
      // Create design from template
      const design = await client.createDesignFromTemplate(
        templateId,
        `${carousel.title} — Slide ${String(i + 1).padStart(2, "0")}`,
      );

      // Autofill with slide content
      const data = buildAutofillData(slide, carousel);
      await client.autofillDesign(design.id, data);

      designs.push(design);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Erro desconhecido";
      errors.push(`Slide ${i + 1} (${slide.type}): ${msg}`);
    }
  }

  // Step 2: Export all created designs as PNG
  for (const design of designs) {
    try {
      const result = await client.exportDesign(design.id);
      if (result.urls && result.urls.length > 0) {
        exportUrls.push(result.urls[0].url);
      } else if (result.status === "failed") {
        errors.push(
          `Export falhou para "${design.title}": ${result.error || "erro desconhecido"}`,
        );
      }
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Erro desconhecido";
      errors.push(`Export falhou para "${design.title}": ${msg}`);
    }
  }

  return { designs, exportUrls, errors };
}
