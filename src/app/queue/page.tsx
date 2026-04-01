"use client";

import { useEffect, useState, useCallback } from "react";
import { brandStore, scriptStore, postStore, pillarStore } from "@/lib/store";
import { Brand, Script, Post, ContentPillar } from "@/lib/types";
import {
  cn,
  platformIcons,
  formatDateTime,
  statusLabels,
} from "@/lib/utils";

type Column = "draft" | "review" | "approved" | "scheduled" | "published";

const columns: { id: Column; label: string; color: string }[] = [
  { id: "draft", label: "Rascunho", color: "border-gray-500" },
  { id: "review", label: "Em Revisao", color: "border-yellow-500" },
  { id: "approved", label: "Aprovado", color: "border-green-500" },
  { id: "scheduled", label: "Agendado", color: "border-purple-500" },
  { id: "published", label: "Publicado", color: "border-blue-500" },
];

export default function QueuePage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [scripts, setScripts] = useState<Script[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [pillars, setPillars] = useState<ContentPillar[]>([]);
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);
  const [filterBrand, setFilterBrand] = useState("");
  const [filterPillar, setFilterPillar] = useState("");
  const [dragItem, setDragItem] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");

  const reload = useCallback(() => {
    setBrands(brandStore.getAll());
    setScripts(scriptStore.getAll());
    setPosts(postStore.getAll());
    setPillars(pillarStore.getAll());
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const filteredScripts = scripts.filter((s) => {
    if (filterBrand && s.brandId !== filterBrand) return false;
    if (filterPillar && s.pillarId !== filterPillar) return false;
    return true;
  });

  const getColumnScripts = (status: Column) => {
    // Map script statuses + post statuses to columns
    if (status === "scheduled" || status === "published") {
      const scriptIds = posts
        .filter((p) => p.status === status)
        .map((p) => p.scriptId);
      return filteredScripts.filter(
        (s) => scriptIds.includes(s.id) && !["draft", "review"].includes(s.status)
      );
    }
    return filteredScripts.filter((s) => s.status === status);
  };

  const handleDragStart = (scriptId: string) => {
    setDragItem(scriptId);
  };

  const handleDrop = (targetStatus: Column) => {
    if (!dragItem) return;
    const script = scripts.find((s) => s.id === dragItem);
    if (!script) return;

    if (targetStatus === "scheduled" || targetStatus === "published") {
      // Update related posts
      const relatedPosts = posts.filter((p) => p.scriptId === dragItem);
      relatedPosts.forEach((p) => {
        postStore.update(p.id, {
          status: targetStatus,
          publishedAt: targetStatus === "published" ? new Date().toISOString() : p.publishedAt,
        });
      });
      scriptStore.update(dragItem, { status: "approved" });
    } else {
      scriptStore.update(dragItem, { status: targetStatus as Script["status"] });
    }
    setDragItem(null);
    reload();
  };

  const handleApprove = (scriptId: string) => {
    scriptStore.update(scriptId, { status: "approved" });
    reload();
    setSelectedScript(null);
  };

  const handleReject = (scriptId: string) => {
    scriptStore.update(scriptId, { status: "rejected", feedback });
    setFeedback("");
    reload();
    setSelectedScript(null);
  };

  const handleBulkApprove = () => {
    filteredScripts
      .filter((s) => s.status === "review")
      .forEach((s) => scriptStore.update(s.id, { status: "approved" }));
    reload();
  };

  return (
    <div className="max-w-full mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Fila de Aprovacao</h1>
          <p className="text-muted text-sm mt-1">Arraste roteiros entre colunas para mudar status</p>
        </div>
        <div className="flex gap-3">
          {/* Filters */}
          <select
            value={filterBrand}
            onChange={(e) => setFilterBrand(e.target.value)}
            className="bg-surface border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent"
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
            className="bg-surface border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent"
          >
            <option value="">Todos os pilares</option>
            {pillars.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleBulkApprove}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Aprovar todos em revisao
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((col) => {
          const colScripts = getColumnScripts(col.id);
          return (
            <div
              key={col.id}
              className={cn(
                "flex-shrink-0 w-72 bg-surface/50 rounded-xl border-t-2",
                col.color
              )}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(col.id)}
            >
              <div className="p-3 flex items-center justify-between">
                <h3 className="text-sm font-medium">{col.label}</h3>
                <span className="text-xs text-muted bg-background px-2 py-0.5 rounded-full">
                  {colScripts.length}
                </span>
              </div>
              <div className="p-2 space-y-2 min-h-[200px]">
                {colScripts.map((script) => {
                  const brand = brands.find((b) => b.id === script.brandId);
                  const scriptPosts = posts.filter((p) => p.scriptId === script.id);
                  return (
                    <div
                      key={script.id}
                      draggable
                      onDragStart={() => handleDragStart(script.id)}
                      onClick={() => setSelectedScript(script)}
                      className={cn(
                        "kanban-card bg-background border border-border rounded-lg p-3 cursor-pointer",
                        dragItem === script.id && "dragging"
                      )}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className="w-6 h-6 rounded flex items-center justify-center text-xs"
                          style={{ backgroundColor: `${brand?.colors.primary}20` }}
                        >
                          {brand?.logoEmoji}
                        </span>
                        <span
                          className="text-xs font-medium"
                          style={{ color: brand?.colors.primary }}
                        >
                          {brand?.name}
                        </span>
                      </div>
                      <p className="text-sm font-medium line-clamp-2 mb-2">{script.hook}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-1">
                          {scriptPosts.map((p) => (
                            <span key={p.id} className="text-xs">
                              {platformIcons[p.platform]}
                            </span>
                          ))}
                        </div>
                        <span className="text-[10px] text-muted">~{script.duration}s</span>
                      </div>
                      {script.feedback && (
                        <div className="mt-2 text-[10px] text-red-400 bg-red-500/10 rounded p-1.5">
                          {script.feedback}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Script Detail Modal */}
      {selectedScript && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-8"
          onClick={() => setSelectedScript(null)}
        >
          <div
            className="bg-surface border border-border rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">
                  {brands.find((b) => b.id === selectedScript.brandId)?.logoEmoji}
                </span>
                <div>
                  <h3 className="font-semibold">{selectedScript.title}</h3>
                  <p className="text-xs text-muted">
                    {brands.find((b) => b.id === selectedScript.brandId)?.name} &middot;{" "}
                    {pillars.find((p) => p.id === selectedScript.pillarId)?.name} &middot;{" "}
                    {statusLabels[selectedScript.status]}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedScript(null)}
                className="text-muted hover:text-foreground text-xl"
              >
                ×
              </button>
            </div>

            <div className="bg-accent/10 border border-accent/20 rounded-lg p-3 mb-4">
              <p className="text-xs text-accent font-medium mb-1">HOOK</p>
              <p className="text-sm font-medium">{selectedScript.hook}</p>
            </div>

            <div className="text-sm whitespace-pre-line mb-4">{selectedScript.body}</div>

            <div className="bg-background rounded-lg p-3 mb-4">
              <p className="text-xs text-muted mb-1">Notas visuais</p>
              <p className="text-sm">{selectedScript.visualNotes}</p>
            </div>

            {/* Posts for this script */}
            {posts.filter((p) => p.scriptId === selectedScript.id).length > 0 && (
              <div className="border-t border-border pt-4 mb-4">
                <p className="text-sm font-medium mb-2">Posts associados</p>
                {posts
                  .filter((p) => p.scriptId === selectedScript.id)
                  .map((post) => (
                    <div key={post.id} className="flex items-center gap-2 text-sm mb-1">
                      <span>{platformIcons[post.platform]}</span>
                      <span className="text-muted">
                        {post.scheduledAt ? formatDateTime(post.scheduledAt) : "Sem data"}
                      </span>
                      <span className="text-xs text-muted">({statusLabels[post.status]})</span>
                    </div>
                  ))}
              </div>
            )}

            {/* Actions */}
            {(selectedScript.status === "draft" || selectedScript.status === "review") && (
              <div className="border-t border-border pt-4 space-y-3">
                <div className="flex gap-3">
                  <button
                    onClick={() => handleApprove(selectedScript.id)}
                    className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Aprovar
                  </button>
                  <button
                    onClick={() => {
                      scriptStore.update(selectedScript.id, { status: "review" });
                      reload();
                      setSelectedScript(null);
                    }}
                    className="flex-1 py-2.5 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Enviar pra revisao
                  </button>
                </div>
                <div>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Feedback de rejeicao (opcional)..."
                    className="w-full bg-background border border-border rounded-lg p-2 text-sm text-foreground resize-none h-16 mb-2 focus:outline-none focus:border-red-500"
                  />
                  <button
                    onClick={() => handleReject(selectedScript.id)}
                    className="w-full py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-sm font-medium transition-colors"
                  >
                    Rejeitar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
