"use client";

import { useEffect, useState, useCallback } from "react";
import {
  brandStore,
  pillarStore,
  templateStore,
  scriptStore,
  postStore,
} from "@/lib/store";
import { Brand, ContentPillar, ScriptTemplate, Script } from "@/lib/types";
import {
  cn,
  platformIcons,
  platformNames,
  pillarColors,
  pillarEmojis,
} from "@/lib/utils";

type Step = 1 | 2 | 3 | 4 | 5;

const formats = [
  { id: "reels", label: "Reels", duration: "60s", icon: "📸" },
  { id: "tiktok", label: "TikTok", duration: "30s", icon: "🎵" },
  { id: "story", label: "Story", duration: "15s", icon: "📱" },
  { id: "carousel", label: "Carousel", duration: "—", icon: "🎠" },
];

export default function GeneratePage() {
  const [step, setStep] = useState<Step>(1);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [pillars, setPillars] = useState<ContentPillar[]>([]);
  const [templates, setTemplates] = useState<ScriptTemplate[]>([]);

  // Config state
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [selectedPillar, setSelectedPillar] = useState<string>("");
  const [selectedFormat, setSelectedFormat] = useState<string>("reels");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [customPrompt, setCustomPrompt] = useState("");

  // Generation state
  const [generating, setGenerating] = useState(false);
  const [variants, setVariants] = useState<
    Omit<Script, "id" | "createdAt" | "updatedAt">[]
  >([]);
  const [selectedVariant, setSelectedVariant] = useState<number>(-1);

  // Edit state
  const [editHook, setEditHook] = useState("");
  const [editBody, setEditBody] = useState("");
  const [editVisual, setEditVisual] = useState("");
  const [editDuration, setEditDuration] = useState(30);

  // Caption state
  const [captions, setCaptions] = useState<
    { platform: string; caption: string; hashtags: string[]; cta: string }[]
  >([]);

  // Schedule state
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("09:00");

  useEffect(() => {
    setBrands(brandStore.getAll());
    setPillars(pillarStore.getAll());
    setTemplates(templateStore.getAll());
  }, []);

  const filteredTemplates = templates.filter(
    (t) => !selectedPillar || t.pillarId === selectedPillar
  );

  const brand = brands.find((b) => b.id === selectedBrand);
  const pillar = pillars.find((p) => p.id === selectedPillar);

  const handleGenerate = useCallback(async () => {
    setGenerating(true);

    // Call our API route
    try {
      const tmpl = templates.find((t) => t.id === selectedTemplate);
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandId: selectedBrand,
          pillarId: selectedPillar,
          templateId: selectedTemplate || undefined,
          format: selectedFormat,
          customPrompt: customPrompt || undefined,
          // Brand context for Claude CLI
          brandName: brand?.name,
          brandTone: brand?.tone,
          brandPainPoints: brand?.painPoints,
          brandCompetitors: brand?.competitors,
          brandTargetAudience: brand?.targetAudience,
          pillarName: pillar?.name,
          pillarEmotion: pillar?.emotion,
          templateStructure: tmpl?.structure,
        }),
      });
      const data = await res.json();
      setVariants(data.scripts);
    } catch {
      // Fallback with empty
      setVariants([]);
    }
    setGenerating(false);
    setStep(2);
  }, [selectedBrand, selectedPillar, selectedTemplate, selectedFormat, customPrompt]);

  const handleSelectVariant = (idx: number) => {
    setSelectedVariant(idx);
    const v = variants[idx];
    setEditHook(v.hook);
    setEditBody(v.body);
    setEditVisual(v.visualNotes);
    setEditDuration(v.duration);
    setStep(3);
  };

  const [generatingCaptions, setGeneratingCaptions] = useState(false);

  const handleGenerateCaptions = async () => {
    if (!brand) return;
    setGeneratingCaptions(true);

    try {
      const res = await fetch("/api/caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hook: editHook,
          bodyText: editBody,
          platforms: brand.platforms,
          brandSlug: brand.slug,
          brandTone: brand.tone,
        }),
      });
      const data = await res.json();
      if (data.captions?.length) {
        setCaptions(data.captions);
        setGeneratingCaptions(false);
        setStep(4);
        return;
      }
    } catch {
      // fall through to local fallback
    }

    // Local fallback if API fails
    const caps = brand.platforms.map((platform) => {
      const maxLen = platform === "tiktok" ? 150 : platform === "instagram" ? 300 : 500;
      const caption = `${editHook}\n\n${editBody.split("\n").slice(0, 3).join("\n").slice(0, maxLen)}...`;
      const hashtags = [
        `#${brand.slug}`,
        "#viral",
        "#conteudo",
        "#brasil",
        platform === "tiktok" ? "#fyp" : "#reels",
        pillar?.slug === "dor" ? "#problemas" : pillar?.slug === "solucao" ? "#solucao" : "#depoimento",
      ];
      const cta =
        platform === "linkedin"
          ? "Comenta o que voce acha."
          : "Link na bio.";
      return { platform, caption, hashtags, cta };
    });
    setCaptions(caps);
    setGeneratingCaptions(false);
    setStep(4);
  };

  const handleSaveDraft = () => {
    const script = scriptStore.create({
      brandId: selectedBrand,
      pillarId: selectedPillar,
      templateId: selectedTemplate || null,
      title: editHook.slice(0, 60),
      hook: editHook,
      body: editBody,
      visualNotes: editVisual,
      voiceoverText: null,
      duration: editDuration,
      status: "draft",
      feedback: null,
    });

    // Create posts for each caption
    captions.forEach((cap) => {
      const scheduledAt =
        scheduleDate && scheduleTime
          ? new Date(`${scheduleDate}T${scheduleTime}`).toISOString()
          : null;
      postStore.create({
        scriptId: script.id,
        brandId: selectedBrand,
        platform: cap.platform,
        caption: `${cap.caption}\n\n${cap.hashtags.join(" ")}\n\n${cap.cta}`,
        hashtags: cap.hashtags,
        cta: cap.cta,
        scheduledAt,
        publishedAt: null,
        status: scheduledAt ? "scheduled" : "draft",
        mediaUrl: null,
        metrics: null,
      });
    });

    setStep(5);
  };

  const stepLabels = ["Config", "Gerar", "Editar", "Legenda", "Salvar"];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Gerar Roteiros</h1>
        <p className="text-muted text-sm mt-1">Crie conteudo viral para suas marcas</p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <button
              onClick={() => s < step && setStep(s as Step)}
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                s === step
                  ? "bg-accent text-white"
                  : s < step
                    ? "bg-accent/20 text-accent cursor-pointer"
                    : "bg-surface text-muted border border-border"
              )}
            >
              {s}
            </button>
            <span
              className={cn(
                "text-xs",
                s === step ? "text-accent font-medium" : "text-muted"
              )}
            >
              {stepLabels[s - 1]}
            </span>
            {s < 5 && <div className="w-8 h-px bg-border mx-1" />}
          </div>
        ))}
      </div>

      {/* Step 1: Config */}
      {step === 1 && (
        <div className="space-y-6 page-enter">
          {/* Brand Selector */}
          <div>
            <label className="block text-sm font-medium mb-3">Selecione a Marca</label>
            <div className="grid grid-cols-3 gap-3">
              {brands.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setSelectedBrand(b.id)}
                  className={cn(
                    "text-left p-4 rounded-xl border transition-all",
                    selectedBrand === b.id
                      ? "border-accent ring-1 ring-accent/30 bg-accent/5"
                      : "border-border bg-surface hover:border-border-hover"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                      style={{ backgroundColor: `${b.colors.primary}20` }}
                    >
                      {b.logoEmoji}
                    </div>
                    <div>
                      <p className="font-medium text-sm" style={{ color: b.colors.primary }}>
                        {b.name}
                      </p>
                      <p className="text-xs text-muted truncate max-w-[180px]">
                        {b.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Pillar Selector */}
          <div>
            <label className="block text-sm font-medium mb-3">Pilar de Conteudo</label>
            <div className="grid grid-cols-3 gap-3">
              {pillars.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedPillar(p.id);
                    setSelectedTemplate("");
                  }}
                  className={cn(
                    "text-left p-4 rounded-xl border transition-all",
                    selectedPillar === p.id
                      ? "border-accent ring-1 ring-accent/30 bg-accent/5"
                      : "border-border bg-surface hover:border-border-hover"
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{pillarEmojis[p.id]}</span>
                    <span className={cn("text-xs px-2 py-0.5 rounded-full border", pillarColors[p.id])}>
                      {p.name}
                    </span>
                  </div>
                  <p className="text-xs text-muted">{p.description}</p>
                  <p className="text-[10px] text-muted/70 mt-1">Emocao: {p.emotion}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Format Selector */}
          <div>
            <label className="block text-sm font-medium mb-3">Formato</label>
            <div className="flex gap-3">
              {formats.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSelectedFormat(f.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-3 rounded-xl border transition-all",
                    selectedFormat === f.id
                      ? "border-accent ring-1 ring-accent/30 bg-accent/5"
                      : "border-border bg-surface hover:border-border-hover"
                  )}
                >
                  <span>{f.icon}</span>
                  <span className="text-sm font-medium">{f.label}</span>
                  <span className="text-xs text-muted">({f.duration})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Template Selector */}
          {selectedPillar && (
            <div>
              <label className="block text-sm font-medium mb-3">Template (opcional)</label>
              <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-2">
                <button
                  onClick={() => setSelectedTemplate("")}
                  className={cn(
                    "text-left p-3 rounded-lg border transition-all text-sm",
                    !selectedTemplate
                      ? "border-accent bg-accent/5"
                      : "border-border bg-surface hover:border-border-hover"
                  )}
                >
                  Livre (sem template)
                </button>
                {filteredTemplates.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTemplate(t.id)}
                    className={cn(
                      "text-left p-3 rounded-lg border transition-all",
                      selectedTemplate === t.id
                        ? "border-accent bg-accent/5"
                        : "border-border bg-surface hover:border-border-hover"
                    )}
                  >
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-muted mt-1 truncate">{t.hookPattern}</p>
                    <p className="text-[10px] text-muted/70 mt-1">
                      {t.format} &middot; ~{t.duration}s
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Custom Prompt */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Topico / Prompt customizado (opcional)
            </label>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Ex: Fazer um video sobre a frustracao de esperar orcamento por 3 dias..."
              className="w-full bg-surface border border-border rounded-lg p-3 text-sm text-foreground placeholder:text-muted/50 resize-none h-24 focus:outline-none focus:border-accent"
            />
          </div>

          {/* Generate Button */}
          <button
            disabled={!selectedBrand || !selectedPillar}
            onClick={handleGenerate}
            className="w-full py-4 bg-gradient-to-r from-accent to-pink-500 hover:from-accent-hover hover:to-pink-600 text-white rounded-xl font-semibold text-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Gerar Roteiros
          </button>
        </div>
      )}

      {/* Step 2: Generated Variants */}
      {step === 2 && (
        <div className="space-y-6 page-enter">
          {generating ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center mx-auto mb-4 glow-pulse">
                <span className="text-3xl">🔥</span>
              </div>
              <p className="text-lg font-medium">Criando conteudo viral...</p>
              <p className="text-sm text-muted mt-2">Gerando 3 variantes para {brand?.name}</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Escolha uma variante</h2>
                  <p className="text-sm text-muted">
                    3 roteiros para {brand?.name} &middot;{" "}
                    <span className={cn("px-1.5 py-0.5 rounded text-xs border", pillarColors[selectedPillar])}>
                      {pillar?.name}
                    </span>
                  </p>
                </div>
                <button
                  onClick={handleGenerate}
                  className="px-4 py-2 bg-surface border border-border rounded-lg text-sm hover:bg-surface-hover transition-colors"
                >
                  Regenerar
                </button>
              </div>

              <div className="space-y-4">
                {variants.map((v, i) => (
                  <div
                    key={i}
                    className="bg-surface border border-border rounded-xl p-5 hover:border-accent/30 transition-all cursor-pointer"
                    onClick={() => handleSelectVariant(i)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <span className="text-xs text-muted">Variante {i + 1}</span>
                        <h3 className="font-semibold mt-1">{v.title}</h3>
                      </div>
                      <span className="text-xs text-muted bg-background px-2 py-1 rounded">
                        ~{v.duration}s
                      </span>
                    </div>

                    {/* Hook highlighted */}
                    <div className="bg-accent/10 border border-accent/20 rounded-lg p-3 mb-3">
                      <p className="text-xs text-accent font-medium mb-1">HOOK</p>
                      <p className="text-sm font-medium">{v.hook}</p>
                    </div>

                    {/* Body preview */}
                    <div className="text-sm text-muted whitespace-pre-line line-clamp-6">
                      {v.body}
                    </div>

                    {/* Visual notes */}
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <p className="text-xs text-muted">
                        <span className="font-medium text-foreground/60">Notas visuais:</span>{" "}
                        {v.visualNotes.slice(0, 120)}...
                      </p>
                    </div>

                    <button
                      className="mt-4 w-full py-2.5 bg-accent/10 hover:bg-accent/20 text-accent rounded-lg text-sm font-medium transition-colors"
                    >
                      Selecionar esta variante
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Step 3: Edit & Refine */}
      {step === 3 && (
        <div className="space-y-6 page-enter">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Editar Roteiro</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setStep(2)}
                className="px-3 py-1.5 text-sm bg-surface border border-border rounded-lg hover:bg-surface-hover"
              >
                Voltar
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-4">
              {/* Hook Editor */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Hook (primeiros 3 segundos)
                </label>
                <div className="relative">
                  <textarea
                    value={editHook}
                    onChange={(e) => setEditHook(e.target.value)}
                    className="w-full bg-accent/5 border border-accent/30 rounded-lg p-3 text-sm text-foreground resize-none h-20 focus:outline-none focus:border-accent"
                  />
                  <div className="flex gap-1.5 mt-2">
                    <span className="text-[10px] text-muted">Power words:</span>
                    {["POV:", "Ninguem fala sobre", "Red flags", "Eu descobri", "Teste:"].map(
                      (w) => (
                        <button
                          key={w}
                          onClick={() => setEditHook(w + " " + editHook)}
                          className="text-[10px] px-2 py-0.5 bg-surface border border-border rounded-full hover:border-accent/50 transition-colors"
                        >
                          {w}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>

              {/* Body Editor */}
              <div>
                <label className="block text-sm font-medium mb-2">Corpo do Roteiro</label>
                <textarea
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                  className="w-full bg-surface border border-border rounded-lg p-3 text-sm text-foreground font-mono resize-none h-72 focus:outline-none focus:border-accent"
                />
                <div className="flex gap-1.5 mt-2">
                  <span className="text-[10px] text-muted">Inserir:</span>
                  {[
                    "[CORTE]",
                    "[TEXTO NA TELA: \"\"]",
                    "**destaque**",
                    "[TRANSICAO]",
                  ].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setEditBody(editBody + "\n" + tag)}
                      className="text-[10px] px-2 py-0.5 bg-surface border border-border rounded-full hover:border-accent/50 transition-colors font-mono"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Visual Notes */}
              <div>
                <label className="block text-sm font-medium mb-2">Notas Visuais</label>
                <textarea
                  value={editVisual}
                  onChange={(e) => setEditVisual(e.target.value)}
                  className="w-full bg-surface border border-border rounded-lg p-3 text-sm text-foreground resize-none h-24 focus:outline-none focus:border-accent"
                />
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Duracao estimada: {editDuration}s
                </label>
                <input
                  type="range"
                  min={10}
                  max={120}
                  value={editDuration}
                  onChange={(e) => setEditDuration(Number(e.target.value))}
                  className="w-full accent-accent"
                />
                <div className="flex justify-between text-xs text-muted">
                  <span>10s</span>
                  <span>120s</span>
                </div>
              </div>
            </div>

            {/* Side Panel: Template Reference */}
            <div className="space-y-4">
              {brand && (
                <div className="bg-surface border border-border rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">{brand.logoEmoji}</span>
                    <span className="font-medium text-sm" style={{ color: brand.colors.primary }}>
                      {brand.name}
                    </span>
                  </div>
                  <p className="text-xs text-muted">{brand.tone}</p>
                </div>
              )}

              {selectedTemplate && (() => {
                const tmpl = templates.find((t) => t.id === selectedTemplate);
                if (!tmpl) return null;
                return (
                  <div className="bg-surface border border-border rounded-xl p-4">
                    <h4 className="text-sm font-medium mb-2">Template</h4>
                    <p className="text-xs text-accent mb-2">{tmpl.name}</p>
                    <div className="text-xs text-muted whitespace-pre-line bg-background rounded p-3">
                      {tmpl.structure}
                    </div>
                    <div className="mt-3">
                      <p className="text-[10px] text-muted">Hook pattern:</p>
                      <p className="text-xs font-mono bg-background rounded p-2 mt-1">
                        {tmpl.hookPattern}
                      </p>
                    </div>
                    <div className="mt-2">
                      <p className="text-[10px] text-muted">CTA pattern:</p>
                      <p className="text-xs font-mono bg-background rounded p-2 mt-1">
                        {tmpl.ctaPattern}
                      </p>
                    </div>
                  </div>
                );
              })()}

              <div className="bg-surface border border-border rounded-xl p-4">
                <h4 className="text-sm font-medium mb-2">Preview</h4>
                <div className="bg-black rounded-2xl p-3 aspect-[9/16] flex flex-col justify-between text-white max-h-80 overflow-hidden">
                  <div className="text-[10px] font-bold leading-tight">{editHook}</div>
                  <div className="text-[8px] opacity-70 whitespace-pre-line line-clamp-8">
                    {editBody}
                  </div>
                  <div className="text-[8px] opacity-50">~{editDuration}s</div>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleGenerateCaptions}
            className="w-full py-3 bg-gradient-to-r from-accent to-pink-500 hover:from-accent-hover hover:to-pink-600 text-white rounded-xl font-semibold transition-all"
          >
            Gerar Legendas e CTAs
          </button>
        </div>
      )}

      {/* Step 4: Caption & CTA */}
      {step === 4 && (
        <div className="space-y-6 page-enter">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Legendas e CTAs</h2>
            <button
              onClick={() => setStep(3)}
              className="px-3 py-1.5 text-sm bg-surface border border-border rounded-lg hover:bg-surface-hover"
            >
              Voltar
            </button>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {captions.map((cap, i) => (
              <div key={i} className="bg-surface border border-border rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl">{platformIcons[cap.platform]}</span>
                  <span className="font-medium">{platformNames[cap.platform]}</span>
                </div>

                {/* Mock phone frame */}
                <div className="bg-black rounded-2xl p-4 mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                      style={{ backgroundColor: brand?.colors.primary }}
                    >
                      {brand?.logoEmoji}
                    </div>
                    <span className="text-white text-xs font-medium">{brand?.slug}</span>
                  </div>
                  <div className="bg-gray-800 rounded-lg aspect-video mb-3 flex items-center justify-center">
                    <span className="text-3xl">▶️</span>
                  </div>
                  <p className="text-white text-[10px] whitespace-pre-line line-clamp-4">
                    {cap.caption.slice(0, 200)}
                  </p>
                  <p className="text-blue-400 text-[9px] mt-1">{cap.hashtags.join(" ")}</p>
                </div>

                {/* Editable fields */}
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-muted">Legenda</label>
                    <textarea
                      value={cap.caption}
                      onChange={(e) => {
                        const newCaps = [...captions];
                        newCaps[i] = { ...cap, caption: e.target.value };
                        setCaptions(newCaps);
                      }}
                      className="w-full bg-background border border-border rounded-lg p-2 text-xs text-foreground resize-none h-24 mt-1 focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted">Hashtags</label>
                    <input
                      value={cap.hashtags.join(" ")}
                      onChange={(e) => {
                        const newCaps = [...captions];
                        newCaps[i] = {
                          ...cap,
                          hashtags: e.target.value.split(" ").filter(Boolean),
                        };
                        setCaptions(newCaps);
                      }}
                      className="w-full bg-background border border-border rounded-lg p-2 text-xs text-foreground mt-1 focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted">CTA</label>
                    <input
                      value={cap.cta}
                      onChange={(e) => {
                        const newCaps = [...captions];
                        newCaps[i] = { ...cap, cta: e.target.value };
                        setCaptions(newCaps);
                      }}
                      className="w-full bg-background border border-border rounded-lg p-2 text-xs text-foreground mt-1 focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setStep(5)}
            className="w-full py-3 bg-gradient-to-r from-accent to-pink-500 hover:from-accent-hover hover:to-pink-600 text-white rounded-xl font-semibold transition-all"
          >
            Revisar e Agendar
          </button>
        </div>
      )}

      {/* Step 5: Review & Queue */}
      {step === 5 && variants.length > 0 && (
        <div className="space-y-6 page-enter">
          <h2 className="text-lg font-semibold">Revisar e Salvar</h2>

          <div className="bg-surface border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">{brand?.logoEmoji}</span>
              <div>
                <h3 className="font-semibold" style={{ color: brand?.colors.primary }}>
                  {brand?.name}
                </h3>
                <p className="text-xs text-muted">
                  {pillar?.name} &middot; {selectedFormat} &middot; ~{editDuration}s
                </p>
              </div>
            </div>

            <div className="bg-accent/10 border border-accent/20 rounded-lg p-3 mb-4">
              <p className="text-xs text-accent font-medium mb-1">HOOK</p>
              <p className="text-sm font-medium">{editHook}</p>
            </div>

            <div className="text-sm whitespace-pre-line mb-4">{editBody}</div>

            <div className="bg-background rounded-lg p-3 mb-4">
              <p className="text-xs text-muted font-medium mb-1">Notas Visuais</p>
              <p className="text-sm">{editVisual}</p>
            </div>

            {captions.length > 0 && (
              <div className="border-t border-border pt-4">
                <p className="text-sm font-medium mb-2">Legendas ({captions.length} plataformas)</p>
                {captions.map((cap, i) => (
                  <div key={i} className="flex items-start gap-2 mb-2">
                    <span>{platformIcons[cap.platform]}</span>
                    <p className="text-xs text-muted line-clamp-2">{cap.caption.slice(0, 100)}...</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Schedule */}
          <div className="bg-surface border border-border rounded-xl p-6">
            <h3 className="font-medium mb-4">Agendar (opcional)</h3>
            <div className="flex gap-4">
              <div>
                <label className="text-xs text-muted">Data</label>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="block w-full bg-background border border-border rounded-lg p-2 text-sm mt-1 focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="text-xs text-muted">Horario</label>
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="block w-full bg-background border border-border rounded-lg p-2 text-sm mt-1 focus:outline-none focus:border-accent"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleSaveDraft}
              className="flex-1 py-3 bg-surface border border-border hover:bg-surface-hover rounded-xl font-medium transition-colors"
            >
              Salvar Rascunho
            </button>
            <button
              onClick={() => {
                if (!scheduleDate) {
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  setScheduleDate(tomorrow.toISOString().split("T")[0]);
                }
                handleSaveDraft();
              }}
              className="flex-1 py-3 bg-gradient-to-r from-accent to-pink-500 hover:from-accent-hover hover:to-pink-600 text-white rounded-xl font-semibold transition-all"
            >
              Adicionar a Fila
            </button>
          </div>

          {/* Success message if step 5 was reached from save */}
          {scriptStore.getAll().length > 0 && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center">
              <p className="text-green-400 font-medium">Roteiro salvo com sucesso!</p>
              <div className="flex gap-3 justify-center mt-3">
                <button
                  onClick={() => {
                    setStep(1);
                    setVariants([]);
                    setSelectedVariant(-1);
                    setCaptions([]);
                  }}
                  className="px-4 py-2 bg-surface border border-border rounded-lg text-sm hover:bg-surface-hover"
                >
                  Gerar outro
                </button>
                <a
                  href="/queue"
                  className="px-4 py-2 bg-accent/20 text-accent rounded-lg text-sm hover:bg-accent/30"
                >
                  Ver fila
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
