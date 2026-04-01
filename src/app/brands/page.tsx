"use client";

import { useEffect, useState } from "react";
import { brandStore, scriptStore, postStore } from "@/lib/store";
import { Brand, Script, Post } from "@/lib/types";
import { platformIcons, platformNames, formatNumber, cn } from "@/lib/utils";

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [scripts, setScripts] = useState<Script[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [selected, setSelected] = useState<Brand | null>(null);

  useEffect(() => {
    setBrands(brandStore.getAll());
    setScripts(scriptStore.getAll());
    setPosts(postStore.getAll());
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Marcas</h1>
        <p className="text-muted text-sm mt-1">Gerencie suas marcas e veja performance</p>
      </div>

      {/* Brand Grid */}
      <div className="grid grid-cols-3 gap-4">
        {brands.map((brand) => {
          const brandScripts = scripts.filter((s) => s.brandId === brand.id);
          const brandPosts = posts.filter((p) => p.brandId === brand.id);
          const published = brandPosts.filter((p) => p.status === "published");
          const totalViews = published.reduce((acc, p) => acc + (p.metrics?.views ?? 0), 0);

          return (
            <button
              key={brand.id}
              onClick={() => setSelected(selected?.id === brand.id ? null : brand)}
              className={cn(
                "text-left bg-surface border rounded-xl p-5 transition-all hover:border-border-hover",
                selected?.id === brand.id ? "border-accent ring-1 ring-accent/30" : "border-border"
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                  style={{ backgroundColor: `${brand.colors.primary}20` }}
                >
                  {brand.logoEmoji}
                </div>
                <div className="flex gap-1">
                  {brand.platforms.map((p) => (
                    <span
                      key={p}
                      className="text-xs px-2 py-0.5 rounded-full bg-background border border-border"
                      title={platformNames[p]}
                    >
                      {platformIcons[p]}
                    </span>
                  ))}
                </div>
              </div>
              <h3 className="font-semibold text-lg" style={{ color: brand.colors.primary }}>
                {brand.name}
              </h3>
              <p className="text-sm text-muted mt-1 line-clamp-2">{brand.description}</p>
              <div className="flex gap-4 mt-4 text-xs text-muted">
                <span>{brandScripts.length} roteiros</span>
                <span>{brandPosts.length} posts</span>
                <span>{formatNumber(totalViews)} views</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Brand Detail */}
      {selected && (
        <div className="bg-surface border border-border rounded-xl p-6 page-enter">
          <div className="flex items-start gap-5 mb-6">
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl shrink-0"
              style={{ backgroundColor: `${selected.colors.primary}20` }}
            >
              {selected.logoEmoji}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold" style={{ color: selected.colors.primary }}>
                {selected.name}
              </h2>
              <p className="text-sm text-muted mt-1">{selected.description}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-background rounded-lg p-4">
              <h4 className="text-xs text-muted uppercase tracking-wider mb-2">Tom de Voz</h4>
              <p className="text-sm">{selected.tone}</p>
            </div>
            <div className="bg-background rounded-lg p-4">
              <h4 className="text-xs text-muted uppercase tracking-wider mb-2">Publico-Alvo</h4>
              <p className="text-sm">{selected.targetAudience}</p>
            </div>
            <div className="bg-background rounded-lg p-4">
              <h4 className="text-xs text-muted uppercase tracking-wider mb-2">Concorrentes</h4>
              <p className="text-sm">{selected.competitors}</p>
            </div>
            <div className="bg-background rounded-lg p-4">
              <h4 className="text-xs text-muted uppercase tracking-wider mb-2">Dores do Cliente</h4>
              <p className="text-sm">{selected.painPoints}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <h3 className="font-semibold">Cores da Marca</h3>
            <div className="flex gap-2">
              <div
                className="w-8 h-8 rounded-lg border border-border"
                style={{ backgroundColor: selected.colors.primary }}
                title={`Primary: ${selected.colors.primary}`}
              />
              <div
                className="w-8 h-8 rounded-lg border border-border"
                style={{ backgroundColor: selected.colors.secondary }}
                title={`Secondary: ${selected.colors.secondary}`}
              />
            </div>
          </div>

          {/* Recent Scripts for this brand */}
          <h3 className="font-semibold mb-3">Roteiros Recentes</h3>
          <div className="space-y-2">
            {scripts
              .filter((s) => s.brandId === selected.id)
              .slice(0, 5)
              .map((script) => (
                <div
                  key={script.id}
                  className="flex items-center gap-3 p-3 bg-background rounded-lg"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium">{script.title}</p>
                    <p className="text-xs text-muted truncate">{script.hook}</p>
                  </div>
                  <span className="text-xs text-muted">{script.duration}s</span>
                </div>
              ))}
            {scripts.filter((s) => s.brandId === selected.id).length === 0 && (
              <p className="text-sm text-muted">Nenhum roteiro ainda</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
