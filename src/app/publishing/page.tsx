"use client";

import { useEffect, useState, useCallback } from "react";
import { postStore, brandStore, settingsStore, publishLogStore } from "@/lib/store";
import type { AppSettings } from "@/lib/types";
import { Post, PublishLog } from "@/lib/types";
import { Brand } from "@/lib/types";
import Link from "next/link";
import {
  cn,
  platformIcons,
  platformNames,
  platformColors,
  formatDateTime,
  formatRelative,
  statusLabels,
} from "@/lib/utils";

const allPlatforms = ["instagram", "tiktok", "youtube", "linkedin", "facebook"];

type PublishingTab = "queue" | "history" | "schedule";

export default function PublishingPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [logs, setLogs] = useState<PublishLog[]>([]);
  const [tab, setTab] = useState<PublishingTab>("queue");
  const [publishing, setPublishing] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<string | null>(null);
  const [filterPlatform, setFilterPlatform] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const reload = useCallback(() => {
    setPosts(postStore.getAll());
    setBrands(brandStore.getAll());
    setSettings(settingsStore.get());
    setLogs(publishLogStore.getRecent(100));
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const isDryRun = settings?.dryRun ?? true;
  const publishMode = settings?.publishMode ?? "manual";

  const modeLabel = publishMode === "buffer" ? "Buffer API" : publishMode === "direct" ? "APIs Diretas" : "Manual";

  // ─── Publish a single post ──────────────────────────────────────────────

  const handlePublish = async (post: Post) => {
    if (!settings) return;
    setPublishing((prev) => new Set(prev).add(post.id));

    try {
      const res = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post, settings, action: "publish_now" }),
      });
      const data = await res.json();

      // Log it
      publishLogStore.add({
        postId: post.id,
        platform: post.platform,
        action: data.result?.success ? "publish" : "error",
        method: data.method || "dry_run",
        request: { action: "publish_now" },
        response: data.result,
        timestamp: new Date().toISOString(),
        success: data.result?.success ?? false,
        error: data.result?.error,
      });

      // Update post in store
      if (data.result?.success) {
        postStore.update(post.id, {
          status: "published",
          publishedAt: new Date().toISOString(),
          externalId: data.result.externalId,
          externalUrl: data.result.url,
          publishMethod: data.method === "buffer" ? "buffer" : "direct",
          publishAttempts: (post.publishAttempts || 0) + 1,
        });
        showToast(isDryRun ? `Modo teste: publicacao simulada para ${platformNames[post.platform]}` : `Publicado em ${platformNames[post.platform]}!`);
      } else {
        postStore.update(post.id, {
          status: "failed",
          publishError: data.result?.error,
          publishAttempts: (post.publishAttempts || 0) + 1,
        });
        showToast(`Erro: ${data.result?.error || "Falha desconhecida"}`);
      }
    } catch (err) {
      postStore.update(post.id, {
        status: "failed",
        publishError: (err as Error).message,
        publishAttempts: (post.publishAttempts || 0) + 1,
      });
      showToast(`Erro de conexao: ${(err as Error).message}`);
    } finally {
      setPublishing((prev) => {
        const next = new Set(prev);
        next.delete(post.id);
        return next;
      });
      reload();
    }
  };

  // ─── Batch publish ─────────────────────────────────────────────────────

  const handleBatchPublish = async () => {
    if (!settings) return;
    const approved = posts.filter((p) => p.status === "scheduled" || p.status === "draft");
    if (approved.length === 0) {
      showToast("Nenhum post para publicar");
      return;
    }

    for (const post of approved) {
      await handlePublish(post);
    }
  };

  // ─── Test connection ───────────────────────────────────────────────────

  const handleTestConnection = async (platform: string) => {
    if (!settings) return;
    try {
      const res = await fetch("/api/publish/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, settings }),
      });
      const data = await res.json();
      showToast(data.connected ? `${platformNames[platform]}: Conectado!` : `${platformNames[platform]}: Falha na conexao`);
    } catch {
      showToast(`Erro ao testar ${platformNames[platform]}`);
    }
  };

  // ─── Connection status ─────────────────────────────────────────────────

  const isConnected = (platform: string): boolean => {
    if (!settings) return false;
    if (settings.dryRun) return true;
    if (settings.publishMode === "buffer") return !!settings.bufferApiKey;
    switch (platform) {
      case "instagram":
      case "facebook":
        return !!settings.metaApiKey;
      case "tiktok":
        return !!settings.tiktokApiKey;
      case "linkedin":
        return !!settings.linkedinApiKey;
      case "youtube":
        return !!settings.youtubeApiKey;
      default:
        return false;
    }
  };

  // ─── Queue posts ───────────────────────────────────────────────────────

  const queuePosts = posts.filter((p) => {
    const inQueue = ["draft", "scheduled", "failed"].includes(p.status);
    if (!inQueue) return false;
    if (filterPlatform && p.platform !== filterPlatform) return false;
    return true;
  });

  const publishedPosts = posts.filter((p) => p.status === "published");

  // ─── History logs ──────────────────────────────────────────────────────

  const filteredLogs = logs.filter((l) => {
    if (filterPlatform && l.platform !== filterPlatform) return false;
    if (filterStatus === "success" && !l.success) return false;
    if (filterStatus === "error" && l.success) return false;
    return true;
  });

  // ─── Schedule data ─────────────────────────────────────────────────────

  const getNext7Days = (): Date[] => {
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      d.setHours(0, 0, 0, 0);
      days.push(d);
    }
    return days;
  };

  const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

  if (!settings) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">Central de Publicacao</h1>
            {isDryRun && (
              <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs font-medium rounded-full">
                Modo Teste
              </span>
            )}
          </div>
          <p className="text-muted text-sm mt-1">
            Modo: <span className="text-accent font-medium">{modeLabel}</span>
            {" "}&middot;{" "}
            {publishedPosts.length} publicados &middot; {queuePosts.length} na fila
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleBatchPublish}
            className="px-4 py-2 bg-accent hover:bg-accent/80 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Publicar todos aprovados
          </button>
          <Link
            href="/settings"
            className="px-4 py-2 bg-surface border border-border text-muted hover:text-foreground rounded-lg text-sm transition-colors"
          >
            Configurar
          </Link>
        </div>
      </div>

      {/* Connections Section */}
      <div className="grid grid-cols-5 gap-3">
        {allPlatforms.map((platform) => {
          const connected = isConnected(platform);
          const lastPublished = posts
            .filter((p) => p.platform === platform && p.status === "published")
            .sort((a, b) => (b.publishedAt || "").localeCompare(a.publishedAt || ""))[0];

          return (
            <div
              key={platform}
              className="bg-surface border border-border rounded-xl p-4 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn("w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center text-white text-sm", platformColors[platform])}>
                    {platformIcons[platform]}
                  </div>
                  <span className="text-sm font-medium">{platformNames[platform]}</span>
                </div>
                <span className={cn("w-2.5 h-2.5 rounded-full", connected ? "bg-green-500" : "bg-red-500")} />
              </div>
              <p className="text-[11px] text-muted">
                {connected ? "Conectado" : "Desconectado"}
              </p>
              {lastPublished?.publishedAt && (
                <p className="text-[10px] text-muted">
                  Ultimo: {formatRelative(lastPublished.publishedAt)}
                </p>
              )}
              <button
                onClick={() => handleTestConnection(platform)}
                className="mt-auto text-[11px] text-accent hover:text-accent/80 transition-colors text-left"
              >
                Testar conexao
              </button>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface rounded-lg p-1 w-fit">
        {([
          { id: "queue" as const, label: "Fila de Publicacao" },
          { id: "history" as const, label: "Historico" },
          { id: "schedule" as const, label: "Agendamento" },
        ]).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "px-4 py-2 rounded-md text-sm transition-colors",
              tab === t.id ? "bg-accent text-white font-medium" : "text-muted hover:text-foreground"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <select
          value={filterPlatform}
          onChange={(e) => setFilterPlatform(e.target.value)}
          className="bg-surface border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent"
        >
          <option value="">Todas as plataformas</option>
          {allPlatforms.map((p) => (
            <option key={p} value={p}>{platformIcons[p]} {platformNames[p]}</option>
          ))}
        </select>
        {tab === "history" && (
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-surface border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent"
          >
            <option value="">Todos os status</option>
            <option value="success">Sucesso</option>
            <option value="error">Erro</option>
          </select>
        )}
      </div>

      {/* Tab Content */}
      {tab === "queue" && (
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-4 py-3 text-xs text-muted font-medium">Marca</th>
                <th className="px-4 py-3 text-xs text-muted font-medium">Plataforma</th>
                <th className="px-4 py-3 text-xs text-muted font-medium">Legenda</th>
                <th className="px-4 py-3 text-xs text-muted font-medium">Agendado</th>
                <th className="px-4 py-3 text-xs text-muted font-medium">Status</th>
                <th className="px-4 py-3 text-xs text-muted font-medium">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {queuePosts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted text-sm">
                    Nenhum post na fila. Aprove roteiros na{" "}
                    <Link href="/queue" className="text-accent hover:underline">Fila de Aprovacao</Link>{" "}
                    para comecar.
                  </td>
                </tr>
              ) : (
                queuePosts.map((post) => {
                  const brand = brands.find((b) => b.id === post.brandId);
                  const isPublishing = publishing.has(post.id);

                  return (
                    <tr key={post.id} className="border-b border-border/50 hover:bg-surface-hover/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{brand?.logoEmoji}</span>
                          <span className="text-sm font-medium">{brand?.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r text-white", platformColors[post.platform])}>
                          {platformIcons[post.platform]} {platformNames[post.platform]}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-foreground line-clamp-1 max-w-[280px]">
                          {post.caption}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted">
                        {post.scheduledAt ? formatDateTime(post.scheduledAt) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <QueueStatus status={post.status} isPublishing={isPublishing} error={post.publishError} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handlePublish(post)}
                            disabled={isPublishing}
                            className={cn(
                              "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                              isPublishing
                                ? "bg-accent/30 text-accent/50 cursor-not-allowed"
                                : "bg-accent hover:bg-accent/80 text-white"
                            )}
                          >
                            {isPublishing ? "Publicando..." : "Publicar agora"}
                          </button>
                          {post.status === "failed" && (
                            <button
                              onClick={() => handlePublish(post)}
                              disabled={isPublishing}
                              className="px-3 py-1.5 bg-yellow-600/20 text-yellow-400 rounded-lg text-xs font-medium hover:bg-yellow-600/30 transition-colors"
                            >
                              Tentar novamente
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === "history" && (
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-4 py-3 text-xs text-muted font-medium">Data</th>
                <th className="px-4 py-3 text-xs text-muted font-medium">Plataforma</th>
                <th className="px-4 py-3 text-xs text-muted font-medium">Acao</th>
                <th className="px-4 py-3 text-xs text-muted font-medium">Metodo</th>
                <th className="px-4 py-3 text-xs text-muted font-medium">Status</th>
                <th className="px-4 py-3 text-xs text-muted font-medium">Detalhes</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted text-sm">
                    Nenhum registro de publicacao ainda.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const post = posts.find((p) => p.id === log.postId);
                  const brand = post ? brands.find((b) => b.id === post.brandId) : null;

                  return (
                    <tr key={log.id} className="border-b border-border/50 hover:bg-surface-hover/50 transition-colors">
                      <td className="px-4 py-3 text-sm text-muted">
                        {formatRelative(log.timestamp)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {brand && <span className="text-xs">{brand.logoEmoji}</span>}
                          <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r text-white", platformColors[log.platform])}>
                            {platformIcons[log.platform]} {platformNames[log.platform]}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground capitalize">
                        {log.action === "publish" ? "Publicar" : log.action === "schedule" ? "Agendar" : log.action === "check_status" ? "Verificar" : "Erro"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[11px] font-medium",
                          log.method === "dry_run" ? "bg-yellow-500/20 text-yellow-400" :
                          log.method === "buffer" ? "bg-blue-500/20 text-blue-400" :
                          "bg-green-500/20 text-green-400"
                        )}>
                          {log.method === "dry_run" ? "Modo Teste" : log.method === "buffer" ? "Buffer" : "API Direta"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {log.success ? (
                          <span className="text-green-400 text-sm">Sucesso</span>
                        ) : (
                          <span className="text-red-400 text-sm">Falhou</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted max-w-[200px] truncate">
                        {log.error || (post?.externalUrl ? (
                          <a href={post.externalUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                            Ver post
                          </a>
                        ) : "—")}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === "schedule" && (
        <div className="space-y-6">
          {/* Auto-schedule toggle */}
          <div className="bg-surface border border-border rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Agendar automaticamente posts aprovados</p>
              <p className="text-xs text-muted mt-0.5">Posts aprovados preenchem automaticamente os horarios disponiveis</p>
            </div>
            <button
              onClick={() => {
                const updated = settingsStore.update({ autoSchedule: !settings.autoSchedule });
                setSettings(updated);
              }}
              className={cn(
                "w-12 h-6 rounded-full transition-colors relative",
                settings.autoSchedule ? "bg-accent" : "bg-border"
              )}
            >
              <div className={cn(
                "w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform",
                settings.autoSchedule ? "translate-x-6" : "translate-x-0.5"
              )} />
            </button>
          </div>

          {/* Weekly schedule grid */}
          <div className="bg-surface border border-border rounded-xl p-6">
            <h3 className="text-sm font-semibold mb-4">Proximos 7 dias</h3>
            <div className="grid grid-cols-7 gap-3">
              {getNext7Days().map((day) => {
                const dayKey = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][day.getDay()];
                const schedule = settings.postingSchedule[dayKey];
                const dayPosts = posts.filter((p) => {
                  if (!p.scheduledAt) return false;
                  const pDate = new Date(p.scheduledAt);
                  return pDate.getFullYear() === day.getFullYear() &&
                    pDate.getMonth() === day.getMonth() &&
                    pDate.getDate() === day.getDate();
                });
                const isToday = new Date().toDateString() === day.toDateString();

                return (
                  <div key={day.toISOString()} className={cn(
                    "rounded-lg border p-3 min-h-[160px]",
                    isToday ? "border-accent bg-accent/5" : "border-border bg-background"
                  )}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium">
                        {dayNames[day.getDay()]} {day.getDate()}
                      </span>
                      {isToday && <span className="text-[10px] text-accent font-medium">Hoje</span>}
                    </div>
                    <div className="space-y-1">
                      {schedule?.times.map((time) => {
                        const scheduledPost = dayPosts.find((p) => {
                          if (!p.scheduledAt) return false;
                          const pTime = new Date(p.scheduledAt);
                          return `${String(pTime.getHours()).padStart(2, "0")}:${String(pTime.getMinutes()).padStart(2, "0")}` === time;
                        });

                        return (
                          <div
                            key={time}
                            className={cn(
                              "rounded px-2 py-1 text-[10px]",
                              scheduledPost
                                ? "bg-accent/20 text-accent border border-accent/30"
                                : "bg-surface border border-border text-muted"
                            )}
                          >
                            <span className="font-medium">{time}</span>
                            {scheduledPost && (
                              <span className="ml-1">
                                {platformIcons[scheduledPost.platform]} {brands.find((b) => b.id === scheduledPost.brandId)?.logoEmoji}
                              </span>
                            )}
                            {!scheduledPost && <span className="ml-1 italic">Vazio</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Optimized times per platform */}
          <div className="bg-surface border border-border rounded-xl p-6">
            <h3 className="text-sm font-semibold mb-4">Horarios otimizados por plataforma</h3>
            <div className="grid grid-cols-2 gap-4">
              {allPlatforms.filter((p) => p !== "facebook").map((platform) => (
                <div key={platform} className="bg-background rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={cn("w-6 h-6 rounded flex items-center justify-center text-xs bg-gradient-to-br text-white", platformColors[platform])}>
                      {platformIcons[platform]}
                    </span>
                    <span className="text-sm font-medium">{platformNames[platform]}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {(settings.optimizedTimes?.[platform] || []).map((time) => (
                      <span key={time} className="px-2 py-0.5 bg-surface border border-border rounded text-xs text-muted">
                        {time}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Published posts (always visible at bottom) */}
      {publishedPosts.length > 0 && tab === "queue" && (
        <div>
          <h3 className="text-sm font-semibold mb-3 text-muted">Publicados recentemente</h3>
          <div className="grid grid-cols-3 gap-3">
            {publishedPosts.slice(0, 6).map((post) => {
              const brand = brands.find((b) => b.id === post.brandId);
              return (
                <div key={post.id} className="bg-surface border border-border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs">{brand?.logoEmoji}</span>
                      <span className="text-xs font-medium">{brand?.name}</span>
                    </div>
                    <span className={cn("inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-gradient-to-r text-white", platformColors[post.platform])}>
                      {platformIcons[post.platform]}
                    </span>
                  </div>
                  <p className="text-xs text-muted line-clamp-2 mb-2">{post.caption}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-green-400">
                      {post.publishedAt ? formatRelative(post.publishedAt) : "—"}
                    </span>
                    {post.externalUrl && (
                      <a
                        href={post.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-accent hover:underline"
                      >
                        Ver post ↗
                      </a>
                    )}
                  </div>
                  {post.metrics && (
                    <div className="flex gap-3 mt-2 pt-2 border-t border-border">
                      <span className="text-[10px] text-muted">{post.metrics.views} views</span>
                      <span className="text-[10px] text-muted">{post.metrics.likes} likes</span>
                      <span className="text-[10px] text-muted">{post.metrics.comments} comments</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-surface border border-border rounded-xl px-5 py-3 shadow-xl animate-in fade-in slide-in-from-bottom-4">
          <p className="text-sm">{toast}</p>
        </div>
      )}
    </div>
  );
}

// ─── Queue Status Component ──────────────────────────────────────────────────

function QueueStatus({ status, isPublishing, error }: { status: string; isPublishing: boolean; error?: string }) {
  if (isPublishing) {
    return (
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
        <span className="text-xs text-accent font-medium">Publicando...</span>
      </div>
    );
  }

  return (
    <div>
      <span className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
        status === "published" ? "bg-green-500/20 text-green-400" :
        status === "scheduled" ? "bg-purple-500/20 text-purple-400" :
        status === "failed" ? "bg-red-500/20 text-red-400" :
        "bg-gray-500/20 text-gray-400"
      )}>
        {status === "published" && "Publicado"}
        {status === "scheduled" && "Agendado"}
        {status === "failed" && "Falhou"}
        {status === "draft" && "Aguardando"}
      </span>
      {error && <p className="text-[10px] text-red-400 mt-1 max-w-[150px] truncate">{error}</p>}
    </div>
  );
}
