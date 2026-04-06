"use client";

import { useEffect, useState, useCallback } from "react";
import { brandStore, scriptStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { Brand, Script } from "@/lib/types";

type TemplateId = "ViralReels" | "StoryMode" | "SplitComparison" | "TextOnScreen" | "StockFootage" | "SplitScreen" | "Carousel";
type VoiceId = "pt-BR-AntonioNeural" | "pt-BR-FranciscaNeural" | "pt-BR-ThalitaNeural";
type VoiceProviderId = "google" | "elevenlabs" | "edge-tts";
type VideoSourceId = "pexels" | "minimax" | "none";

interface AIVideoJob {
  id: string;
  status: "queued" | "generating" | "complete" | "error";
  progress: number;
  totalScenes: number;
  scenes: Array<{ index: number; status: string; prompt?: string }>;
  error?: string;
}

interface RenderJob {
  id: string;
  status: "queued" | "rendering" | "complete" | "error";
  progress: number;
  result?: { videoPath: string; audioPath: string | null; durationSeconds: number };
  error?: string;
  createdAt: string;
}

const templates: { id: TemplateId; label: string; description: string; icon: string }[] = [
  {
    id: "ViralReels",
    label: "Viral Reels",
    description: "TikTok-style com captions animadas, transicoes rapidas e CTA final",
    icon: "🔥",
  },
  {
    id: "StoryMode",
    label: "Story Mode",
    description: "Narrativa com legendas, baloes WhatsApp e emocoes",
    icon: "📖",
  },
  {
    id: "SplitComparison",
    label: "Antes / Depois",
    description: "Problema vs. Solucao com divisor animado",
    icon: "⚡",
  },
  {
    id: "TextOnScreen",
    label: "Texto na Tela (legado)",
    description: "Fundo escuro com texto animado",
    icon: "📝",
  },
  {
    id: "StockFootage",
    label: "Stock Footage (legado)",
    description: "Fundo gradiente com texto em barra inferior",
    icon: "🎥",
  },
  {
    id: "SplitScreen",
    label: "Tela Dividida (legado)",
    description: "Problema/Solucao basico",
    icon: "🔲",
  },
  {
    id: "Carousel",
    label: "Carrossel (legado)",
    description: "Slides estilo Instagram",
    icon: "📱",
  },
];

const videoSources: { id: VideoSourceId; label: string; description: string; icon: string; cost?: string }[] = [
  { id: "pexels", label: "Stock Footage (Pexels)", description: "Videos genericos de banco de imagem", icon: "🎬", cost: "Gratis" },
  { id: "minimax", label: "AI Video (Minimax)", description: "Cenas geradas por IA que batem com o roteiro", icon: "🤖", cost: "~$0.33/cena" },
  { id: "none", label: "Sem fundo (gradiente)", description: "Fundo animado com gradiente da marca", icon: "🎨", cost: "Gratis" },
];

const voiceProviders: { id: VoiceProviderId; label: string; description: string }[] = [
  { id: "google", label: "Google Neural (recomendado)", description: "Gratuito 1M chars/mes, qualidade boa" },
  { id: "elevenlabs", label: "ElevenLabs (premium)", description: "Melhor qualidade, requer API key" },
  { id: "edge-tts", label: "Edge TTS (basico)", description: "Gratuito, qualidade aceitavel" },
];

const voices: { id: VoiceId; label: string; description: string }[] = [
  { id: "pt-BR-AntonioNeural", label: "Antonio", description: "Masculino, profissional" },
  { id: "pt-BR-FranciscaNeural", label: "Francisca", description: "Feminino, acolhedor" },
  { id: "pt-BR-ThalitaNeural", label: "Thalita", description: "Feminino, jovem" },
];

export default function RenderPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [scripts, setScripts] = useState<Script[]>([]);
  const [selectedScriptId, setSelectedScriptId] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>("ViralReels");
  const [selectedProvider, setSelectedProvider] = useState<VoiceProviderId>("edge-tts");
  const [selectedVoice, setSelectedVoice] = useState<VoiceId>("pt-BR-AntonioNeural");
  const [selectedVideoSource, setSelectedVideoSource] = useState<VideoSourceId>("none");
  const [aiVideoJob, setAiVideoJob] = useState<AIVideoJob | null>(null);
  const [aiVideoJobId, setAiVideoJobId] = useState<string | null>(null);
  const [rendering, setRendering] = useState(false);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [currentJob, setCurrentJob] = useState<RenderJob | null>(null);
  const [recentJobs, setRecentJobs] = useState<RenderJob[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setBrands(brandStore.getAll());
    const allScripts = scriptStore.getAll();
    // Show approved and review scripts first, then all
    setScripts(
      allScripts.sort((a, b) => {
        const order = { approved: 0, review: 1, draft: 2, produced: 3, rejected: 4 };
        const oa = order[a.status] ?? 5;
        const ob = order[b.status] ?? 5;
        return oa - ob;
      })
    );
  }, []);

  // Poll job status
  useEffect(() => {
    if (!currentJobId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/render/status?jobId=${currentJobId}`);
        const job: RenderJob = await res.json();
        setCurrentJob(job);

        if (job.status === "complete" || job.status === "error") {
          setRendering(false);
          clearInterval(interval);
          // Refresh recent jobs
          fetchRecentJobs();
        }
      } catch {
        // ignore polling errors
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentJobId]);

  // Poll AI video job status
  useEffect(() => {
    if (!aiVideoJobId) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/ai-video?jobId=${aiVideoJobId}`);
        const job: AIVideoJob = await res.json();
        setAiVideoJob(job);
        if (job.status === "complete" || job.status === "error") {
          clearInterval(interval);
        }
      } catch {
        // ignore polling errors
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [aiVideoJobId]);

  const fetchRecentJobs = useCallback(async () => {
    try {
      const res = await fetch("/api/render/status");
      const data = await res.json();
      setRecentJobs(data.jobs ?? []);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchRecentJobs();
  }, [fetchRecentJobs]);

  const selectedScript = scripts.find((s) => s.id === selectedScriptId);
  const selectedBrand = selectedScript
    ? brands.find((b) => b.id === selectedScript.brandId)
    : null;

  const handleRender = async () => {
    if (!selectedScript || !selectedBrand) return;

    setError(null);
    setRendering(true);
    setCurrentJob(null);

    try {
      const res = await fetch("/api/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          script: {
            hook: selectedScript.hook,
            body: selectedScript.body,
            duration: selectedScript.duration,
            title: selectedScript.title,
          },
          brand: {
            name: selectedBrand.name,
            logoEmoji: selectedBrand.logoEmoji,
            colors: selectedBrand.colors,
          },
          template: selectedTemplate,
          voice: selectedVoice,
          voiceProvider: selectedProvider,
        }),
      });

      const data = await res.json();
      if (data.error) {
        setError(data.error);
        setRendering(false);
        return;
      }
      setCurrentJobId(data.jobId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao iniciar render");
      setRendering(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Gerar Video</h1>
        <p className="text-muted text-sm mt-1">
          Transforme seus roteiros em videos prontos para publicar. Zero custo, 100% automatico.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Configuration */}
        <div className="lg:col-span-2 space-y-6">
          {/* Script selection */}
          <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
            <h2 className="font-semibold text-sm uppercase tracking-wider text-muted">
              1. Escolha o Roteiro
            </h2>
            <select
              value={selectedScriptId}
              onChange={(e) => setSelectedScriptId(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-accent"
            >
              <option value="">Selecione um roteiro...</option>
              {scripts.map((s) => {
                const brand = brands.find((b) => b.id === s.brandId);
                return (
                  <option key={s.id} value={s.id}>
                    {brand?.logoEmoji} {s.title} ({s.duration}s) — {s.status}
                  </option>
                );
              })}
            </select>

            {selectedScript && (
              <div className="space-y-3">
                <div className="p-3 bg-accent/5 border border-accent/20 rounded-lg">
                  <p className="text-xs text-muted mb-1">Hook:</p>
                  <p className="text-sm font-medium">{selectedScript.hook}</p>
                </div>
                <div className="p-3 bg-background rounded-lg">
                  <p className="text-xs text-muted mb-1">Roteiro:</p>
                  <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed max-h-40 overflow-y-auto">
                    {selectedScript.body}
                  </pre>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted">
                  <span>Duracao: {selectedScript.duration}s</span>
                  {selectedBrand && (
                    <span>
                      Marca: {selectedBrand.logoEmoji} {selectedBrand.name}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Template selection */}
          <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
            <h2 className="font-semibold text-sm uppercase tracking-wider text-muted">
              2. Escolha o Template
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {templates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTemplate(t.id)}
                  className={cn(
                    "p-4 rounded-xl border text-left transition-all",
                    selectedTemplate === t.id
                      ? "border-accent bg-accent/10"
                      : "border-border hover:border-border-hover"
                  )}
                >
                  <span className="text-2xl">{t.icon}</span>
                  <p className="font-medium text-sm mt-2">{t.label}</p>
                  <p className="text-xs text-muted mt-1">{t.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Video source selection */}
          <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
            <h2 className="font-semibold text-sm uppercase tracking-wider text-muted">
              3. Fonte de Video
            </h2>
            <div className="space-y-3">
              {videoSources.map((vs) => (
                <label
                  key={vs.id}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all",
                    selectedVideoSource === vs.id
                      ? "border-accent bg-accent/10"
                      : "border-border hover:border-border-hover"
                  )}
                >
                  <input
                    type="radio"
                    name="videoSource"
                    value={vs.id}
                    checked={selectedVideoSource === vs.id}
                    onChange={() => setSelectedVideoSource(vs.id)}
                    className="accent-accent"
                  />
                  <span className="text-2xl">{vs.icon}</span>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{vs.label}</p>
                    <p className="text-xs text-muted mt-0.5">{vs.description}</p>
                  </div>
                  {vs.cost && (
                    <span className="text-xs text-muted px-2 py-1 bg-background rounded-lg">
                      {vs.cost}
                    </span>
                  )}
                </label>
              ))}
            </div>

            {/* AI Video details when Minimax selected */}
            {selectedVideoSource === "minimax" && selectedScript && (
              <div className="p-4 bg-accent/5 border border-accent/20 rounded-lg space-y-2">
                <p className="text-sm font-medium text-accent">Minimax Hailuo AI Video</p>
                {(() => {
                  const sceneRegex = /\[CENA\s*\d+/gi;
                  const matches = selectedScript.body.match(sceneRegex) || [];
                  const sceneCount = matches.length;
                  const costPerScene = 0.33;
                  const batches = Math.ceil(sceneCount / 3);
                  return (
                    <>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="bg-background rounded-lg p-2 text-center">
                          <p className="text-muted">Cenas</p>
                          <p className="font-bold text-lg">{sceneCount}</p>
                        </div>
                        <div className="bg-background rounded-lg p-2 text-center">
                          <p className="text-muted">Custo est.</p>
                          <p className="font-bold text-lg">${(sceneCount * costPerScene).toFixed(2)}</p>
                        </div>
                        <div className="bg-background rounded-lg p-2 text-center">
                          <p className="text-muted">Tempo est.</p>
                          <p className="font-bold text-lg">~{batches * 5}min</p>
                        </div>
                      </div>
                      <p className="text-xs text-muted">
                        Cada cena gera um clip de 6s em 1080P. Cenas sao processadas em paralelo (3 por vez).
                      </p>
                    </>
                  );
                })()}
              </div>
            )}

            {/* AI Video job progress */}
            {aiVideoJob && selectedVideoSource === "minimax" && (
              <div className="p-4 bg-surface border border-border rounded-lg space-y-3">
                <div className="flex justify-between text-xs text-muted">
                  <span>
                    {aiVideoJob.status === "queued" && "Na fila..."}
                    {aiVideoJob.status === "generating" && "Gerando cenas com IA..."}
                    {aiVideoJob.status === "complete" && "Cenas prontas!"}
                    {aiVideoJob.status === "error" && "Erro na geracao"}
                  </span>
                  <span>{aiVideoJob.progress}%</span>
                </div>
                <div className="w-full bg-background rounded-full h-2">
                  <div
                    className={cn(
                      "h-2 rounded-full transition-all duration-500",
                      aiVideoJob.status === "error" ? "bg-red-500" : "bg-accent"
                    )}
                    style={{ width: `${aiVideoJob.progress}%` }}
                  />
                </div>
                {/* Per-scene status */}
                <div className="grid grid-cols-4 gap-1">
                  {aiVideoJob.scenes.map((scene) => (
                    <div
                      key={scene.index}
                      className={cn(
                        "text-[10px] text-center py-1 rounded",
                        scene.status === "complete" && "bg-green-500/20 text-green-400",
                        scene.status === "generating" && "bg-yellow-500/20 text-yellow-400",
                        scene.status === "failed" && "bg-red-500/20 text-red-400",
                        scene.status === "pending" && "bg-background text-muted"
                      )}
                    >
                      Cena {scene.index}
                    </div>
                  ))}
                </div>
                {aiVideoJob.error && (
                  <p className="text-xs text-red-400">{aiVideoJob.error}</p>
                )}
              </div>
            )}
          </div>

          {/* Voice provider selection */}
          <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
            <h2 className="font-semibold text-sm uppercase tracking-wider text-muted">
              4. Provedor de Voz
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {voiceProviders.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedProvider(p.id)}
                  className={cn(
                    "p-4 rounded-xl border text-center transition-all",
                    selectedProvider === p.id
                      ? "border-accent bg-accent/10"
                      : "border-border hover:border-border-hover"
                  )}
                >
                  <p className="font-medium text-sm">{p.label}</p>
                  <p className="text-xs text-muted mt-1">{p.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Voice selection */}
          <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
            <h2 className="font-semibold text-sm uppercase tracking-wider text-muted">
              5. Escolha a Voz
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {voices.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVoice(v.id)}
                  className={cn(
                    "p-4 rounded-xl border text-center transition-all",
                    selectedVoice === v.id
                      ? "border-accent bg-accent/10"
                      : "border-border hover:border-border-hover"
                  )}
                >
                  <p className="font-medium text-sm">{v.label}</p>
                  <p className="text-xs text-muted mt-1">{v.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Actions & Status */}
        <div className="space-y-6">
          {/* Render button */}
          <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
            <button
              onClick={handleRender}
              disabled={!selectedScript || rendering}
              className={cn(
                "w-full py-4 rounded-xl font-bold text-sm transition-all",
                !selectedScript || rendering
                  ? "bg-border text-muted cursor-not-allowed"
                  : "bg-accent hover:bg-accent-hover text-white glow-pulse"
              )}
            >
              {rendering ? "Renderizando..." : "Renderizar Video"}
            </button>

            {/* Progress */}
            {currentJob && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted">
                  <span>
                    {currentJob.status === "queued" && "Na fila..."}
                    {currentJob.status === "rendering" && "Renderizando..."}
                    {currentJob.status === "complete" && "Completo!"}
                    {currentJob.status === "error" && "Erro!"}
                  </span>
                  <span>{currentJob.progress}%</span>
                </div>
                <div className="w-full bg-background rounded-full h-2">
                  <div
                    className={cn(
                      "h-2 rounded-full transition-all duration-500",
                      currentJob.status === "error" ? "bg-red-500" : "bg-accent"
                    )}
                    style={{ width: `${currentJob.progress}%` }}
                  />
                </div>

                {currentJob.status === "complete" && currentJob.result && (
                  <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <p className="text-xs text-green-400 font-medium">Video renderizado!</p>
                    <p className="text-xs text-muted mt-1">
                      Duracao: {currentJob.result.durationSeconds}s
                    </p>
                    <p className="text-xs text-muted mt-0.5 break-all">
                      {currentJob.result.videoPath}
                    </p>
                  </div>
                )}

                {currentJob.status === "error" && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-xs text-red-400 font-medium">Erro no render</p>
                    <p className="text-xs text-red-300 mt-1">{currentJob.error}</p>
                  </div>
                )}
              </div>
            )}

            {error && !currentJob && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-xs text-red-400">{error}</p>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="bg-surface border border-border rounded-xl p-5 space-y-3">
            <h3 className="font-semibold text-sm">Detalhes</h3>
            <div className="space-y-2 text-xs text-muted">
              <div className="flex justify-between">
                <span>Formato</span>
                <span>1080x1920 (vertical)</span>
              </div>
              <div className="flex justify-between">
                <span>FPS</span>
                <span>30</span>
              </div>
              <div className="flex justify-between">
                <span>Codec</span>
                <span>H.264 / MP4</span>
              </div>
              <div className="flex justify-between">
                <span>TTS</span>
                <span>{voiceProviders.find((p) => p.id === selectedProvider)?.label ?? "Edge TTS"}</span>
              </div>
            </div>
          </div>

          {/* Preview hint */}
          <div className="bg-accent-dim rounded-xl p-4">
            <p className="text-xs text-accent font-medium">Preview no Remotion</p>
            <p className="text-xs text-muted mt-1">
              Rode <code className="bg-background px-1 py-0.5 rounded">npx remotion preview src/remotion/index.ts</code> para visualizar os templates no navegador.
            </p>
          </div>

          {/* Recent jobs */}
          {recentJobs.length > 0 && (
            <div className="bg-surface border border-border rounded-xl p-5 space-y-3">
              <h3 className="font-semibold text-sm">Renders Recentes</h3>
              <div className="space-y-2">
                {recentJobs.slice(0, 5).map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center justify-between text-xs p-2 bg-background rounded-lg"
                  >
                    <span className="text-muted truncate max-w-[60%]">{job.id}</span>
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-full font-medium",
                        job.status === "complete" && "bg-green-500/10 text-green-400",
                        job.status === "rendering" && "bg-yellow-500/10 text-yellow-400",
                        job.status === "queued" && "bg-gray-500/10 text-gray-400",
                        job.status === "error" && "bg-red-500/10 text-red-400"
                      )}
                    >
                      {job.status === "complete" ? "Pronto" : job.status === "rendering" ? `${job.progress}%` : job.status === "error" ? "Erro" : "Fila"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
