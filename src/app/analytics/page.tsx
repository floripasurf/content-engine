"use client";

import { useEffect, useState } from "react";
import { brandStore, scriptStore, postStore } from "@/lib/store";
import { Brand, Post, Script } from "@/lib/types";
import { formatNumber, cn } from "@/lib/utils";

export default function AnalyticsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [scripts, setScripts] = useState<Script[]>([]);

  useEffect(() => {
    setBrands(brandStore.getAll());
    setPosts(postStore.getAll());
    setScripts(scriptStore.getAll());
  }, []);

  const published = posts.filter((p) => p.status === "published");
  const thisWeek = posts.filter((p) => {
    if (!p.scheduledAt) return false;
    const d = new Date(p.scheduledAt);
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 86400000);
    return d >= weekAgo && d <= now;
  });

  const totalViews = published.reduce((acc, p) => acc + (p.metrics?.views ?? 0), 0);
  const totalLikes = published.reduce((acc, p) => acc + (p.metrics?.likes ?? 0), 0);
  const totalShares = published.reduce((acc, p) => acc + (p.metrics?.shares ?? 0), 0);
  const avgEngagement =
    totalViews > 0
      ? (((totalLikes + totalShares) / totalViews) * 100).toFixed(1)
      : "0";

  // Best brand by views
  const brandViews = brands.map((b) => {
    const bPosts = published.filter((p) => p.brandId === b.id);
    const views = bPosts.reduce((acc, p) => acc + (p.metrics?.views ?? 0), 0);
    return { brand: b, views };
  });
  const bestBrand = brandViews.sort((a, b) => b.views - a.views)[0];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted text-sm mt-1">Metricas de performance do conteudo</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Posts esta semana", value: thisWeek.length, color: "text-purple-400" },
          { label: "Engajamento medio", value: `${avgEngagement}%`, color: "text-green-400" },
          { label: "Melhor marca", value: bestBrand?.brand.name ?? "—", color: "text-blue-400" },
          { label: "Views totais", value: formatNumber(totalViews), color: "text-yellow-400" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-surface border border-border rounded-xl p-5">
            <p className={cn("text-2xl font-bold", kpi.color)}>{kpi.value}</p>
            <p className="text-sm text-muted mt-1">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Chart Placeholders */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-surface border border-border rounded-xl p-6">
          <h3 className="font-semibold mb-4">Views por Marca</h3>
          <div className="space-y-3">
            {brandViews
              .sort((a, b) => b.views - a.views)
              .map(({ brand, views }) => {
                const maxViews = brandViews[0]?.views || 1;
                const pct = (views / maxViews) * 100;
                return (
                  <div key={brand.id}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm flex items-center gap-2">
                        <span>{brand.logoEmoji}</span>
                        {brand.name}
                      </span>
                      <span className="text-sm text-muted">{formatNumber(views)}</span>
                    </div>
                    <div className="h-2 bg-background rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: brand.colors.primary,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-6">
          <h3 className="font-semibold mb-4">Engajamento por Plataforma</h3>
          <div className="flex items-center justify-center h-48">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">📊</span>
              </div>
              <p className="text-sm text-muted">
                Conecte suas redes sociais para ver metricas reais
              </p>
              <a href="/settings" className="text-accent text-sm hover:underline mt-2 inline-block">
                Configurar APIs
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* More placeholders */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-surface border border-border rounded-xl p-6">
          <h3 className="font-semibold mb-2">Melhor Horario</h3>
          <p className="text-3xl font-bold text-accent">19:00</p>
          <p className="text-xs text-muted mt-1">Baseado em dados simulados</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-6">
          <h3 className="font-semibold mb-2">Top Pilar</h3>
          <p className="text-3xl font-bold text-red-400">DOR</p>
          <p className="text-xs text-muted mt-1">Maior engajamento medio</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-6">
          <h3 className="font-semibold mb-2">Taxa de Producao</h3>
          <p className="text-3xl font-bold text-green-400">{scripts.length}</p>
          <p className="text-xs text-muted mt-1">Roteiros criados total</p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-accent/5 border border-accent/20 rounded-xl p-4 text-center">
        <p className="text-sm text-muted">
          Dados demonstrativos. Configure as APIs de redes sociais nas{" "}
          <a href="/settings" className="text-accent hover:underline">configuracoes</a>{" "}
          para metricas reais.
        </p>
      </div>
    </div>
  );
}
