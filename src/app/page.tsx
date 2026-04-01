"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { brandStore, scriptStore, postStore } from "@/lib/store";
import { Brand, Script, Post } from "@/lib/types";
import {
  formatRelative,
  formatNumber,
  getWeekDays,
  isSameDay,
  platformIcons,
  statusLabels,
  statusColors,
  cn,
} from "@/lib/utils";

export default function Dashboard() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [scripts, setScripts] = useState<Script[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    setBrands(brandStore.getAll());
    setScripts(scriptStore.getAll());
    setPosts(postStore.getAll());
  }, []);

  const today = new Date();
  const todayPosts = posts.filter(
    (p) => p.scheduledAt && isSameDay(new Date(p.scheduledAt), today)
  );
  const queuedPosts = posts.filter((p) => p.status === "scheduled");
  const pendingScripts = scripts.filter((s) => s.status === "draft" || s.status === "review");
  const approvedScripts = scripts.filter((s) => s.status === "approved" || s.status === "produced");
  const approvalRate =
    scripts.length > 0
      ? Math.round((approvedScripts.length / scripts.length) * 100)
      : 0;

  const weekDays = getWeekDays();
  const dayNames = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted text-sm mt-1">Visao geral da producao de conteudo</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/generate"
            className="px-4 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition-colors"
          >
            Gerar Roteiros
          </Link>
          <Link
            href="/queue"
            className="px-4 py-2.5 bg-surface hover:bg-surface-hover border border-border rounded-lg text-sm font-medium transition-colors"
          >
            Revisar Fila
          </Link>
          <Link
            href="/calendar"
            className="px-4 py-2.5 bg-surface hover:bg-surface-hover border border-border rounded-lg text-sm font-medium transition-colors"
          >
            Calendario
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Posts Hoje", value: todayPosts.length, icon: "📬", color: "text-purple-400" },
          { label: "Posts na Fila", value: queuedPosts.length, icon: "📋", color: "text-blue-400" },
          { label: "Taxa de Aprovacao", value: `${approvalRate}%`, icon: "✅", color: "text-green-400" },
          { label: "Roteiros Pendentes", value: pendingScripts.length, icon: "✏️", color: "text-yellow-400" },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="bg-surface border border-border rounded-xl p-5 hover:border-border-hover transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{kpi.icon}</span>
              <span className={cn("text-2xl font-bold", kpi.color)}>{kpi.value}</span>
            </div>
            <p className="text-sm text-muted">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Content Calendar Week View */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-lg">Calendario da Semana</h2>
          <Link href="/calendar" className="text-accent text-sm hover:underline">
            Ver mes completo
          </Link>
        </div>
        <div className="grid grid-cols-7 gap-3">
          {weekDays.map((day, i) => {
            const dayPosts = posts.filter(
              (p) => p.scheduledAt && isSameDay(new Date(p.scheduledAt), day)
            );
            const isToday = isSameDay(day, today);
            return (
              <div
                key={i}
                className={cn(
                  "rounded-lg p-3 min-h-[140px] border transition-colors",
                  isToday
                    ? "border-accent/50 bg-accent/5"
                    : "border-border/50 bg-background/50"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted">{dayNames[i]}</span>
                  <span
                    className={cn(
                      "text-sm font-medium",
                      isToday ? "text-accent" : "text-foreground"
                    )}
                  >
                    {day.getDate()}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {dayPosts.slice(0, 4).map((post) => {
                    const brand = brands.find((b) => b.id === post.brandId);
                    return (
                      <div
                        key={post.id}
                        className="flex items-center gap-1.5 text-[11px] px-1.5 py-1 rounded"
                        style={{
                          backgroundColor: brand
                            ? `${brand.colors.primary}20`
                            : undefined,
                        }}
                      >
                        <span>{brand?.logoEmoji}</span>
                        <span style={{ color: brand?.colors.primary }}>
                          {platformIcons[post.platform]}
                        </span>
                      </div>
                    );
                  })}
                  {dayPosts.length > 4 && (
                    <p className="text-[10px] text-muted">+{dayPosts.length - 4} mais</p>
                  )}
                  {dayPosts.length === 0 && (
                    <p className="text-[10px] text-muted/50 italic">Vazio</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <h2 className="font-semibold text-lg mb-4">Atividade Recente</h2>
          <div className="space-y-3">
            {scripts
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .slice(0, 6)
              .map((script) => {
                const brand = brands.find((b) => b.id === script.brandId);
                return (
                  <div
                    key={script.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-background/50 hover:bg-background transition-colors"
                  >
                    <span className="text-xl">{brand?.logoEmoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{script.title}</p>
                      <p className="text-xs text-muted">{brand?.name}</p>
                    </div>
                    <div className="text-right">
                      <span
                        className={cn(
                          "text-[10px] px-2 py-0.5 rounded-full",
                          statusColors[script.status],
                          "text-white"
                        )}
                      >
                        {statusLabels[script.status]}
                      </span>
                      <p className="text-[10px] text-muted mt-1">
                        {formatRelative(script.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Brand Performance */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <h2 className="font-semibold text-lg mb-4">Performance por Marca</h2>
          <div className="space-y-3">
            {brands.map((brand) => {
              const brandPosts = posts.filter((p) => p.brandId === brand.id);
              const published = brandPosts.filter((p) => p.status === "published");
              const totalViews = published.reduce(
                (acc, p) => acc + (p.metrics?.views ?? 0),
                0
              );
              const brandScripts = scripts.filter((s) => s.brandId === brand.id);
              return (
                <Link
                  key={brand.id}
                  href={`/brands`}
                  className="flex items-center gap-3 p-3 rounded-lg bg-background/50 hover:bg-background transition-colors"
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                    style={{ backgroundColor: `${brand.colors.primary}20` }}
                  >
                    {brand.logoEmoji}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{brand.name}</p>
                    <p className="text-xs text-muted">
                      {brandScripts.length} roteiros &middot; {brandPosts.length} posts
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium" style={{ color: brand.colors.primary }}>
                      {formatNumber(totalViews)}
                    </p>
                    <p className="text-[10px] text-muted">views</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
