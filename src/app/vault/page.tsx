"use client";

import { useEffect, useState } from "react";
import { brandStore, scriptStore, pillarStore } from "@/lib/store";
import { Brand, Script, ContentPillar } from "@/lib/types";
import { cn, pillarColors, pillarEmojis } from "@/lib/utils";

const statusConfig: Record<string, { label: string; color: string }> = {
  draft: { label: "Rascunho", color: "bg-gray-500/10 text-gray-400" },
  review: { label: "Em Revisão", color: "bg-yellow-500/10 text-yellow-400" },
  approved: { label: "Aprovado", color: "bg-green-500/10 text-green-400" },
  rejected: { label: "Rejeitado", color: "bg-red-500/10 text-red-400" },
  produced: { label: "Produzido", color: "bg-blue-500/10 text-blue-400" },
};

export default function VaultPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [pillars, setPillars] = useState<ContentPillar[]>([]);
  const [scripts, setScripts] = useState<Script[]>([]);
  const [filterBrand, setFilterBrand] = useState("");
  const [filterPillar, setFilterPillar] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"date" | "duration" | "title">("date");

  useEffect(() => {
    setBrands(brandStore.getAll());
    setPillars(pillarStore.getAll());
    setScripts(scriptStore.getAll());
  }, []);

  const filtered = scripts
    .filter((s) => !filterBrand || s.brandId === filterBrand)
    .filter((s) => !filterPillar || s.pillarId === filterPillar)
    .filter((s) => !filterStatus || s.status === filterStatus)
    .filter(
      (s) =>
        !search ||
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.hook.toLowerCase().includes(search.toLowerCase()) ||
        s.body.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "date") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === "duration") return b.duration - a.duration;
      return a.title.localeCompare(b.title);
    });

  const getBrand = (id: string) => brands.find((b) => b.id === id);
  const getPillar = (id: string) => pillars.find((p) => p.id === id);

  const activeFilters = [filterBrand, filterPillar, filterStatus, search].filter(Boolean).length;

  const handleStatusChange = (scriptId: string, newStatus: string) => {
    scriptStore.update(scriptId, { status: newStatus as Script["status"] });
    setScripts(scriptStore.getAll());
  };

  const handleDuplicate = (script: Script) => {
    scriptStore.create({
      brandId: script.brandId,
      pillarId: script.pillarId,
      templateId: script.templateId,
      title: `${script.title} (cópia)`,
      hook: script.hook,
      body: script.body,
      visualNotes: script.visualNotes,
      voiceoverText: script.voiceoverText,
      duration: script.duration,
      status: "draft",
      feedback: null,
    });
    setScripts(scriptStore.getAll());
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Banco de Roteiros</h1>
        <p className="text-muted text-sm mt-1">
          Todos os roteiros gerados, organizados e prontos para uso. Nada é descartado.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {Object.entries(statusConfig).map(([key, { label, color }]) => {
          const count = scripts.filter((s) => s.status === key).length;
          return (
            <button
              key={key}
              onClick={() => setFilterStatus(filterStatus === key ? "" : key)}
              className={cn(
                "p-3 rounded-xl border text-center transition-all",
                filterStatus === key
                  ? "border-accent bg-accent/5"
                  : "border-border bg-surface hover:border-border-hover"
              )}
            >
              <p className="text-2xl font-bold">{count}</p>
              <p className={cn("text-xs font-medium rounded-full px-2 py-0.5 inline-block mt-1", color)}>
                {label}
              </p>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="Buscar por título, hook ou conteúdo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[250px] bg-surface border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
        />
        <select
          value={filterBrand}
          onChange={(e) => setFilterBrand(e.target.value)}
          className="bg-surface border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
        >
          <option value="">Todas as marcas</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.logoEmoji} {b.name}
            </option>
          ))}
        </select>
        <select
          value={filterPillar}
          onChange={(e) => setFilterPillar(e.target.value)}
          className="bg-surface border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
        >
          <option value="">Todos os pilares</option>
          {pillars.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as "date" | "duration" | "title")}
          className="bg-surface border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
        >
          <option value="date">Mais recentes</option>
          <option value="title">A-Z</option>
          <option value="duration">Duração</option>
        </select>
        {activeFilters > 0 && (
          <button
            onClick={() => {
              setFilterBrand("");
              setFilterPillar("");
              setFilterStatus("");
              setSearch("");
            }}
            className="text-xs text-accent hover:underline"
          >
            Limpar filtros ({activeFilters})
          </button>
        )}
      </div>

      {/* Results count */}
      <p className="text-sm text-muted">
        {filtered.length} roteiro{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
      </p>

      {/* Script List */}
      <div className="space-y-3">
        {filtered.map((script) => {
          const brand = getBrand(script.brandId);
          const pillar = getPillar(script.pillarId);
          const isExpanded = expanded === script.id;

          return (
            <div
              key={script.id}
              className={cn(
                "bg-surface border rounded-xl transition-all",
                isExpanded ? "border-accent" : "border-border"
              )}
            >
              {/* Header - always visible */}
              <button
                onClick={() => setExpanded(isExpanded ? null : script.id)}
                className="w-full text-left p-4 flex items-center gap-4"
              >
                {/* Brand indicator */}
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0"
                  style={{ backgroundColor: `${brand?.colors.primary ?? "#666"}20` }}
                >
                  {brand?.logoEmoji ?? "?"}
                </div>

                {/* Title & hook */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-medium text-sm truncate">{script.title}</h3>
                    <span className={cn("text-xs px-2 py-0.5 rounded-full shrink-0", statusConfig[script.status]?.color)}>
                      {statusConfig[script.status]?.label}
                    </span>
                  </div>
                  <p className="text-xs text-muted truncate">{script.hook}</p>
                </div>

                {/* Pillar badge */}
                {pillar && (
                  <span
                    className={cn(
                      "text-xs px-2 py-0.5 rounded-full shrink-0",
                      pillarColors[pillar.id] ?? "bg-gray-500/10 text-gray-400"
                    )}
                  >
                    {pillarEmojis[pillar.id]} {pillar.name}
                  </span>
                )}

                {/* Duration */}
                <span className="text-xs text-muted shrink-0">{script.duration}s</span>

                {/* Expand indicator */}
                <span className={cn("text-muted transition-transform", isExpanded && "rotate-180")}>
                  ▾
                </span>
              </button>

              {/* Expanded content */}
              {isExpanded && (
                <div className="px-4 pb-4 space-y-4 border-t border-border pt-4">
                  {/* Full script */}
                  <div>
                    <h4 className="text-xs text-muted uppercase tracking-wider mb-2">Hook</h4>
                    <p className="text-sm font-medium p-3 bg-accent/5 border border-accent/20 rounded-lg">
                      {script.hook}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs text-muted uppercase tracking-wider mb-2">Roteiro</h4>
                    <pre className="text-sm whitespace-pre-wrap p-3 bg-background rounded-lg font-sans leading-relaxed">
                      {script.body}
                    </pre>
                  </div>
                  <div>
                    <h4 className="text-xs text-muted uppercase tracking-wider mb-2">Notas Visuais</h4>
                    <p className="text-sm text-muted p-3 bg-background rounded-lg">{script.visualNotes}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    <select
                      value={script.status}
                      onChange={(e) => handleStatusChange(script.id, e.target.value)}
                      className="bg-background border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-accent"
                    >
                      <option value="draft">Rascunho</option>
                      <option value="review">Em Revisão</option>
                      <option value="approved">Aprovado</option>
                      <option value="rejected">Rejeitado</option>
                      <option value="produced">Produzido</option>
                    </select>
                    <button
                      onClick={() => handleDuplicate(script)}
                      className="px-3 py-1.5 text-sm rounded-lg border border-border hover:bg-background transition-colors"
                    >
                      📋 Duplicar
                    </button>
                    <a
                      href={`/generate?script=${script.id}`}
                      className="px-3 py-1.5 text-sm rounded-lg border border-accent text-accent hover:bg-accent/10 transition-colors"
                    >
                      ✏️ Editar & Gerar Post
                    </a>
                  </div>

                  {/* Feedback if rejected */}
                  {script.feedback && (
                    <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-lg">
                      <p className="text-xs text-red-400 font-medium mb-1">Feedback:</p>
                      <p className="text-sm text-red-300">{script.feedback}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-12 bg-surface border border-border rounded-xl">
            <p className="text-4xl mb-3">📝</p>
            <p className="text-muted">
              {scripts.length === 0
                ? "Nenhum roteiro ainda. Vá para Gerar Roteiros para começar."
                : "Nenhum roteiro encontra os filtros selecionados."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
