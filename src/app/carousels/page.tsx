"use client";

import { useState, useEffect, useCallback } from "react";
import {
  allCarousels,
  brandConfigs,
  chameiCarousels,
  squadCarousels,
  type CarouselData,
} from "@/lib/carousel-content";
import { settingsStore } from "@/lib/store";
import type { AppSettings, CanvaBrandTemplates } from "@/lib/types";

const slideTypeLabels: Record<string, string> = {
  cover: "Capa",
  content: "Conteudo",
  comparison: "Comparacao",
  checklist: "Checklist",
  cta: "CTA",
};

const slideTypeColors: Record<string, string> = {
  cover: "bg-blue-600",
  content: "bg-gray-600",
  comparison: "bg-amber-600",
  checklist: "bg-emerald-600",
  cta: "bg-purple-600",
};

function SlidePreview({
  slide,
  index,
  total,
  brand,
}: {
  slide: CarouselData["slides"][number];
  index: number;
  total: number;
  brand: string;
}) {
  const config = brandConfigs[brand];
  const isDark = slide.type === "cover" || slide.type === "cta";

  return (
    <div
      className="relative rounded-lg overflow-hidden border border-border flex-shrink-0"
      style={{
        width: 180,
        height: 225,
        background: isDark
          ? `linear-gradient(160deg, ${config.accentColor}, ${config.secondaryColor})`
          : "#FAFAFA",
      }}
    >
      {/* Slide type badge */}
      <div className="absolute top-2 left-2 z-10">
        <span
          className={`text-[9px] font-bold text-white px-1.5 py-0.5 rounded ${slideTypeColors[slide.type]}`}
        >
          {slideTypeLabels[slide.type]}
        </span>
      </div>

      {/* Content preview */}
      <div
        className="p-3 pt-7 h-full flex flex-col justify-center"
        style={{
          color: isDark ? "#ffffff" : "#1a1a1a",
        }}
      >
        {slide.number && (
          <div className="text-[10px] font-bold opacity-30 mb-1">
            {slide.number}
          </div>
        )}
        <p className="text-[11px] font-bold leading-tight line-clamp-4">
          {slide.content}
        </p>
        {slide.subtext && (
          <p className="text-[9px] mt-1 opacity-60 leading-tight line-clamp-2">
            {slide.subtext}
          </p>
        )}
      </div>

      {/* Dots */}
      <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
        {Array.from({ length: total }).map((_, j) => (
          <div
            key={j}
            className="rounded-full"
            style={{
              width: j === index ? 8 : 3,
              height: 3,
              backgroundColor:
                j === index
                  ? isDark
                    ? "#ffffff"
                    : config.accentColor
                  : isDark
                    ? "rgba(255,255,255,0.3)"
                    : "rgba(0,0,0,0.15)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

type CanvaStatus = "idle" | "generating" | "done" | "exporting" | "exported" | "error";

interface CanvaDesignInfo {
  id: string;
  title: string;
  editUrl: string;
  viewUrl: string;
}

function CarouselCard({
  carousel,
  canvaToken,
  brandTemplates,
}: {
  carousel: CarouselData;
  canvaToken?: string;
  brandTemplates?: CanvaBrandTemplates;
}) {
  const config = brandConfigs[carousel.brand];
  const [expanded, setExpanded] = useState(false);
  const [canvaStatus, setCanvaStatus] = useState<CanvaStatus>("idle");
  const [canvaDesigns, setCanvaDesigns] = useState<CanvaDesignInfo[]>([]);
  const [canvaExportUrls, setCanvaExportUrls] = useState<string[]>([]);
  const [canvaError, setCanvaError] = useState("");

  const hasCanva = !!canvaToken && !!brandTemplates;

  const handleGenerateCanva = async () => {
    if (!hasCanva) return;
    setCanvaStatus("generating");
    setCanvaError("");
    try {
      const res = await fetch("/api/canva", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate",
          carouselId: carousel.id,
          brandSlug: carousel.brand,
          token: canvaToken,
          brandTemplates: {
            brandSlug: carousel.brand,
            ...brandTemplates,
          },
        }),
      });
      const data = await res.json();
      if (data.error) {
        setCanvaStatus("error");
        setCanvaError(data.error);
        return;
      }
      setCanvaDesigns(data.designs || []);
      setCanvaExportUrls(data.exportUrls || []);
      setCanvaStatus(data.exportUrls?.length > 0 ? "exported" : "done");
      if (data.errors?.length > 0) {
        setCanvaError(data.errors.join("; "));
      }
    } catch (err) {
      setCanvaStatus("error");
      setCanvaError(err instanceof Error ? err.message : "Erro desconhecido");
    }
  };

  const handleExportPng = async () => {
    if (canvaDesigns.length === 0) return;
    setCanvaStatus("exporting");
    try {
      const res = await fetch("/api/canva", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "export",
          designIds: canvaDesigns.map((d) => d.id),
          token: canvaToken,
        }),
      });
      const data = await res.json();
      const urls = (data.results || [])
        .filter((r: { url?: string }) => r.url)
        .map((r: { url: string }) => r.url);
      setCanvaExportUrls(urls);
      setCanvaStatus("exported");
    } catch (err) {
      setCanvaStatus("error");
      setCanvaError(err instanceof Error ? err.message : "Erro no export");
    }
  };

  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="p-5 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
            style={{ backgroundColor: config.accentColor + "20" }}
          >
            {config.brandEmoji}
          </div>
          <div>
            <p className="text-xs text-muted font-medium uppercase tracking-wider">
              {config.brandName} — {carousel.id}
            </p>
            <h3 className="text-foreground font-bold mt-0.5 text-sm leading-snug">
              {carousel.title}
            </h3>
            <p className="text-xs text-muted mt-1">
              {carousel.slides.length} slides
              {" — "}
              {carousel.slides.map((s) => slideTypeLabels[s.type]).join(", ")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Canva button */}
          {hasCanva && (
            <>
              {canvaStatus === "idle" && (
                <button
                  onClick={handleGenerateCanva}
                  className="text-xs font-medium px-3 py-1.5 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-all"
                >
                  Gerar no Canva
                </button>
              )}
              {canvaStatus === "generating" && (
                <span className="text-xs text-purple-400 px-3 py-1.5 bg-purple-500/10 rounded-lg animate-pulse">
                  Gerando...
                </span>
              )}
              {canvaStatus === "done" && (
                <button
                  onClick={handleExportPng}
                  className="text-xs font-medium px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-all"
                >
                  Exportar PNG do Canva
                </button>
              )}
              {canvaStatus === "exporting" && (
                <span className="text-xs text-amber-400 px-3 py-1.5 bg-amber-500/10 rounded-lg animate-pulse">
                  Exportando...
                </span>
              )}
              {canvaStatus === "exported" && (
                <span className="text-xs text-green-400 px-3 py-1.5 bg-green-500/10 rounded-lg">
                  PNG exportado
                </span>
              )}
              {canvaStatus === "error" && (
                <button
                  onClick={handleGenerateCanva}
                  className="text-xs font-medium px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                  title={canvaError}
                >
                  Erro — tentar novamente
                </button>
              )}
            </>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-accent hover:text-accent/80 font-medium px-3 py-1.5 rounded-lg bg-accent/10 hover:bg-accent/20 transition-all flex-shrink-0"
          >
            {expanded ? "Fechar" : "Ver slides"}
          </button>
        </div>
      </div>

      {/* Canva results */}
      {(canvaDesigns.length > 0 || canvaExportUrls.length > 0 || canvaError) && (
        <div className="px-5 pb-3">
          {canvaError && (
            <p className="text-xs text-red-400 mb-2">{canvaError}</p>
          )}
          {canvaDesigns.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {canvaDesigns.map((d) => (
                <a
                  key={d.id}
                  href={d.editUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-purple-400 bg-purple-500/10 px-2 py-1 rounded hover:bg-purple-500/20 transition-colors"
                >
                  {d.title}
                </a>
              ))}
            </div>
          )}
          {canvaExportUrls.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {canvaExportUrls.map((url, i) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-green-400 bg-green-500/10 px-2 py-1 rounded hover:bg-green-500/20 transition-colors"
                >
                  PNG Slide {i + 1}
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Slide previews */}
      {expanded && (
        <div className="px-5 pb-5">
          <div className="flex gap-3 overflow-x-auto pb-2">
            {carousel.slides.map((slide, i) => (
              <SlidePreview
                key={i}
                slide={slide}
                index={i}
                total={carousel.slides.length}
                brand={carousel.brand}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CarouselsPage() {
  const [activeBrand, setActiveBrand] = useState<"all" | "chamei" | "squad">(
    "all"
  );
  const [settings, setSettings] = useState<AppSettings | null>(null);

  useEffect(() => {
    setSettings(settingsStore.get());
  }, []);

  const displayed =
    activeBrand === "chamei"
      ? chameiCarousels
      : activeBrand === "squad"
        ? squadCarousels
        : allCarousels;

  const canvaToken = settings?.canva?.canvaAccessToken || "";
  const canvaConfigured = !!canvaToken;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Carrosseis</h1>
          <p className="text-sm text-muted mt-1">
            {allCarousels.length} carrosseis prontos para gerar — 1080x1350 PNG
          </p>
        </div>
      </div>

      {/* Brand tabs */}
      <div className="flex gap-2 mb-6">
        {(["all", "chamei", "squad"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveBrand(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeBrand === tab
                ? "bg-accent text-white"
                : "bg-surface text-muted hover:text-foreground border border-border"
            }`}
          >
            {tab === "all"
              ? `Todos (${allCarousels.length})`
              : `${brandConfigs[tab].brandEmoji} ${brandConfigs[tab].brandName} (${
                  tab === "chamei"
                    ? chameiCarousels.length
                    : squadCarousels.length
                })`}
          </button>
        ))}
      </div>

      {/* Info box */}
      <div className="bg-accent/5 border border-accent/20 rounded-xl p-4 mb-6">
        <p className="text-sm text-foreground">
          <span className="font-bold">Como gerar:</span> Execute{" "}
          <code className="bg-surface px-2 py-0.5 rounded text-accent text-xs">
            node render-carousels.mjs
          </code>{" "}
          na raiz do projeto. Os PNGs serao salvos em{" "}
          <code className="bg-surface px-2 py-0.5 rounded text-accent text-xs">
            ~/Desktop/CLAUDE/ContentEngine/carousels/
          </code>
        </p>
        <p className="text-xs text-muted mt-2">
          Filtrar por marca:{" "}
          <code className="bg-surface px-1.5 py-0.5 rounded text-xs">
            node render-carousels.mjs --brand chamei
          </code>
          {" | "}
          Filtrar por ID:{" "}
          <code className="bg-surface px-1.5 py-0.5 rounded text-xs">
            node render-carousels.mjs --id chamei-01
          </code>
        </p>
      </div>

      {/* Canva status banner */}
      {!canvaConfigured && (
        <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-4 mb-6">
          <p className="text-sm text-foreground">
            <span className="font-bold">Canva Integration:</span>{" "}
            Configure o Canva Access Token e os template IDs em{" "}
            <a href="/settings" className="text-accent underline">
              Configuracoes
            </a>{" "}
            para gerar carrosseis profissionais diretamente no Canva.
          </p>
        </div>
      )}

      {/* Template Guide */}
      {canvaConfigured && (
        <details className="mb-6">
          <summary className="cursor-pointer text-sm font-medium text-foreground bg-surface border border-border rounded-xl p-4">
            Guia de Templates Canva
          </summary>
          <div className="bg-surface border border-border border-t-0 rounded-b-xl p-4 text-xs text-muted space-y-2">
            <p>Como configurar templates no Canva:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Abra canva.com e crie um design 1080x1350 (Post Instagram)</li>
              <li>
                Crie o template com a identidade visual da marca (logo, cores, fonte)
              </li>
              <li>
                Adicione campos de texto com nomes:{" "}
                <code className="bg-background px-1 rounded">{"{{title}}"}</code>,{" "}
                <code className="bg-background px-1 rounded">{"{{subtitle}}"}</code>,{" "}
                <code className="bg-background px-1 rounded">{"{{number}}"}</code>,{" "}
                <code className="bg-background px-1 rounded">{"{{brand_name}}"}</code>
              </li>
              <li>Salve como Brand Template e copie o ID</li>
              <li>Cole nas Configuracoes {'>'} Canva {'>'} Templates por Marca</li>
            </ol>
            <p className="font-medium mt-2">5 templates por marca: Cover, Content, Comparison, Checklist, CTA</p>
          </div>
        </details>
      )}

      {/* Carousel cards */}
      <div className="space-y-4">
        {displayed.map((carousel) => (
          <CarouselCard
            key={carousel.id}
            carousel={carousel}
            canvaToken={canvaConfigured ? canvaToken : undefined}
            brandTemplates={
              settings?.canva?.brandTemplates?.[carousel.brand]
            }
          />
        ))}
      </div>
    </div>
  );
}
