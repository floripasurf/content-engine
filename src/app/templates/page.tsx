"use client";

import { useEffect, useState } from "react";
import { pillarStore, templateStore } from "@/lib/store";
import { ContentPillar, ScriptTemplate } from "@/lib/types";
import { cn, pillarColors, pillarEmojis } from "@/lib/utils";

export default function TemplatesPage() {
  const [pillars, setPillars] = useState<ContentPillar[]>([]);
  const [templates, setTemplates] = useState<ScriptTemplate[]>([]);
  const [selectedPillar, setSelectedPillar] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<ScriptTemplate | null>(null);

  useEffect(() => {
    setPillars(pillarStore.getAll());
    setTemplates(templateStore.getAll());
  }, []);

  const filtered = selectedPillar
    ? templates.filter((t) => t.pillarId === selectedPillar)
    : templates;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Templates de Roteiro</h1>
        <p className="text-muted text-sm mt-1">Estruturas testadas para conteudo viral</p>
      </div>

      {/* Pillar Filter */}
      <div className="flex gap-3">
        <button
          onClick={() => setSelectedPillar("")}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-colors border",
            !selectedPillar
              ? "border-accent bg-accent/10 text-accent"
              : "border-border bg-surface text-muted hover:bg-surface-hover"
          )}
        >
          Todos ({templates.length})
        </button>
        {pillars.map((p) => {
          const count = templates.filter((t) => t.pillarId === p.id).length;
          return (
            <button
              key={p.id}
              onClick={() => setSelectedPillar(p.id)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors border",
                selectedPillar === p.id
                  ? `${pillarColors[p.id]}`
                  : "border-border bg-surface text-muted hover:bg-surface-hover"
              )}
            >
              {pillarEmojis[p.id]} {p.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-3 gap-4">
        {filtered.map((tmpl) => {
          const pillar = pillars.find((p) => p.id === tmpl.pillarId);
          return (
            <button
              key={tmpl.id}
              onClick={() => setSelectedTemplate(tmpl)}
              className={cn(
                "text-left bg-surface border rounded-xl p-5 transition-all hover:border-border-hover",
                selectedTemplate?.id === tmpl.id
                  ? "border-accent ring-1 ring-accent/30"
                  : "border-border"
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <span className={cn("text-xs px-2 py-0.5 rounded-full border", pillarColors[tmpl.pillarId])}>
                  {pillar?.name}
                </span>
                <span className="text-xs text-muted">
                  {tmpl.format} &middot; ~{tmpl.duration}s
                </span>
              </div>
              <h3 className="font-medium mb-2">{tmpl.name}</h3>
              <p className="text-xs text-muted font-mono bg-background rounded p-2 line-clamp-3">
                {tmpl.hookPattern}
              </p>
            </button>
          );
        })}
      </div>

      {/* Template Detail */}
      {selectedTemplate && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-8"
          onClick={() => setSelectedTemplate(null)}
        >
          <div
            className="bg-surface border border-border rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className={cn("text-xs px-2 py-0.5 rounded-full border mb-2 inline-block", pillarColors[selectedTemplate.pillarId])}>
                  {pillars.find((p) => p.id === selectedTemplate.pillarId)?.name}
                </span>
                <h2 className="text-xl font-bold">{selectedTemplate.name}</h2>
              </div>
              <button
                onClick={() => setSelectedTemplate(null)}
                className="text-muted hover:text-foreground text-xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Estrutura</h4>
                <div className="bg-background rounded-lg p-4 text-sm font-mono whitespace-pre-line">
                  {selectedTemplate.structure}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Padrao de Hook</h4>
                  <div className="bg-accent/10 border border-accent/20 rounded-lg p-3 text-sm">
                    {selectedTemplate.hookPattern}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">Padrao de CTA</h4>
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-sm">
                    {selectedTemplate.ctaPattern}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">Formato</h4>
                  <p className="text-sm text-muted">{selectedTemplate.format}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Duracao sugerida</h4>
                  <p className="text-sm text-muted">~{selectedTemplate.duration}s</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Exemplo</h4>
                <div className="bg-background rounded-lg p-4 text-sm whitespace-pre-line text-muted">
                  {selectedTemplate.examples}
                </div>
              </div>

              <a
                href={`/generate`}
                className="block w-full py-3 bg-accent hover:bg-accent-hover text-white rounded-xl font-medium text-center transition-colors"
              >
                Usar este template
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
