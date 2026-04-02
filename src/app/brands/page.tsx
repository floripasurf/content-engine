"use client";

import { useEffect, useState, useCallback } from "react";
import { brandStore, scriptStore, postStore } from "@/lib/store";
import { Brand, Script, Post } from "@/lib/types";
import { platformIcons, platformNames, formatNumber, cn } from "@/lib/utils";

const allPlatforms = ["instagram", "tiktok", "youtube", "linkedin", "facebook"];

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [scripts, setScripts] = useState<Script[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [selected, setSelected] = useState<Brand | null>(null);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<Brand | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setBrands(brandStore.getAll());
    setScripts(scriptStore.getAll());
    setPosts(postStore.getAll());
  }, []);

  const handleSelect = (brand: Brand) => {
    if (selected?.id === brand.id) {
      setSelected(null);
      setEditing(false);
    } else {
      setSelected(brand);
      setEditData({ ...brand });
      setEditing(false);
    }
  };

  const handleSave = useCallback(() => {
    if (!editData) return;
    brandStore.update(editData.id, editData);
    setBrands(brandStore.getAll());
    setSelected(editData);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [editData]);

  const handleCancel = () => {
    if (selected) setEditData({ ...selected });
    setEditing(false);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Marcas</h1>
          <p className="text-muted text-sm mt-1">
            Gerencie suas marcas — edite dores, concorrentes e tom de voz para gerar roteiros mais precisos
          </p>
        </div>
        {saved && (
          <span className="text-green-400 text-sm font-medium px-3 py-1 bg-green-500/10 rounded-lg">
            Salvo!
          </span>
        )}
      </div>

      {/* Brand Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {brands.map((brand) => {
          const brandScripts = scripts.filter((s) => s.brandId === brand.id);
          const brandPosts = posts.filter((p) => p.brandId === brand.id);
          const published = brandPosts.filter((p) => p.status === "published");
          const totalViews = published.reduce((acc, p) => acc + (p.metrics?.views ?? 0), 0);

          return (
            <button
              key={brand.id}
              onClick={() => handleSelect(brand)}
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

      {/* Selected Brand Detail / Editor */}
      {selected && editData && (
        <div className="bg-surface border border-border rounded-xl p-6 page-enter">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-5">
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl shrink-0"
                style={{ backgroundColor: `${selected.colors.primary}20` }}
              >
                {selected.logoEmoji}
              </div>
              <div>
                <h2 className="text-xl font-bold" style={{ color: selected.colors.primary }}>
                  {selected.name}
                </h2>
                <p className="text-sm text-muted mt-1">{selected.description}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {editing ? (
                <>
                  <button
                    onClick={handleCancel}
                    className="px-3 py-1.5 text-sm rounded-lg border border-border hover:bg-background transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-3 py-1.5 text-sm rounded-lg bg-accent text-white hover:bg-accent/90 transition-colors"
                  >
                    Salvar
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="px-3 py-1.5 text-sm rounded-lg border border-accent text-accent hover:bg-accent/10 transition-colors"
                >
                  ✏️ Editar
                </button>
              )}
            </div>
          </div>

          {/* Editable Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <FieldCard
              label="Descrição"
              value={editData.description}
              editing={editing}
              type="textarea"
              onChange={(v) => setEditData({ ...editData, description: v })}
            />
            <FieldCard
              label="Tom de Voz"
              value={editData.tone}
              editing={editing}
              type="textarea"
              hint="Como a marca fala: humor, indignação, empoderamento..."
              onChange={(v) => setEditData({ ...editData, tone: v })}
            />
            <FieldCard
              label="Público-Alvo"
              value={editData.targetAudience}
              editing={editing}
              type="textarea"
              hint="Quem é o cliente ideal"
              onChange={(v) => setEditData({ ...editData, targetAudience: v })}
            />
            <FieldCard
              label="Concorrentes"
              value={editData.competitors}
              editing={editing}
              type="textarea"
              hint="Quem compete conosco e quais são seus pontos fracos"
              onChange={(v) => setEditData({ ...editData, competitors: v })}
            />
            <FieldCard
              label="Dores do Cliente"
              value={editData.painPoints}
              editing={editing}
              type="textarea"
              className="md:col-span-2"
              hint="Frustrações reais do cliente que o conteúdo viral deve explorar"
              onChange={(v) => setEditData({ ...editData, painPoints: v })}
            />
          </div>

          {/* Platforms */}
          {editing && (
            <div className="mb-6">
              <h4 className="text-xs text-muted uppercase tracking-wider mb-2">Plataformas</h4>
              <div className="flex gap-2">
                {allPlatforms.map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      const current = editData.platforms;
                      const next = current.includes(p)
                        ? current.filter((x) => x !== p)
                        : [...current, p];
                      setEditData({ ...editData, platforms: next });
                    }}
                    className={cn(
                      "px-3 py-1.5 text-sm rounded-lg border transition-colors",
                      editData.platforms.includes(p)
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-border text-muted hover:border-border-hover"
                    )}
                  >
                    {platformIcons[p]} {platformNames[p]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Brand Colors */}
          <div className="flex items-center gap-3 mb-6">
            <h3 className="font-semibold text-sm">Cores</h3>
            {editing ? (
              <div className="flex gap-3">
                <label className="flex items-center gap-2">
                  <input
                    type="color"
                    value={editData.colors.primary}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        colors: { ...editData.colors, primary: e.target.value },
                      })
                    }
                    className="w-8 h-8 rounded cursor-pointer"
                  />
                  <span className="text-xs text-muted">Primária</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="color"
                    value={editData.colors.secondary}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        colors: { ...editData.colors, secondary: e.target.value },
                      })
                    }
                    className="w-8 h-8 rounded cursor-pointer"
                  />
                  <span className="text-xs text-muted">Secundária</span>
                </label>
              </div>
            ) : (
              <div className="flex gap-2">
                <div
                  className="w-8 h-8 rounded-lg border border-border"
                  style={{ backgroundColor: selected.colors.primary }}
                />
                <div
                  className="w-8 h-8 rounded-lg border border-border"
                  style={{ backgroundColor: selected.colors.secondary }}
                />
              </div>
            )}
          </div>

          {/* Recent Scripts */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Roteiros Recentes</h3>
            <a href="/vault" className="text-xs text-accent hover:underline">
              Ver banco completo →
            </a>
          </div>
          <div className="space-y-2">
            {scripts
              .filter((s) => s.brandId === selected.id)
              .slice(0, 5)
              .map((script) => (
                <div key={script.id} className="flex items-center gap-3 p-3 bg-background rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{script.title}</p>
                    <p className="text-xs text-muted truncate">{script.hook}</p>
                  </div>
                  <span
                    className={cn(
                      "text-xs px-2 py-0.5 rounded-full",
                      script.status === "approved"
                        ? "bg-green-500/10 text-green-400"
                        : script.status === "rejected"
                          ? "bg-red-500/10 text-red-400"
                          : "bg-yellow-500/10 text-yellow-400"
                    )}
                  >
                    {script.status}
                  </span>
                  <span className="text-xs text-muted">{script.duration}s</span>
                </div>
              ))}
            {scripts.filter((s) => s.brandId === selected.id).length === 0 && (
              <p className="text-sm text-muted">Nenhum roteiro ainda — vá para Gerar Roteiros</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function FieldCard({
  label,
  value,
  editing,
  onChange,
  type = "text",
  hint,
  className,
}: {
  label: string;
  value: string;
  editing: boolean;
  onChange: (v: string) => void;
  type?: "text" | "textarea";
  hint?: string;
  className?: string;
}) {
  return (
    <div className={cn("bg-background rounded-lg p-4", className)}>
      <h4 className="text-xs text-muted uppercase tracking-wider mb-1">{label}</h4>
      {hint && editing && <p className="text-xs text-muted/60 mb-2">{hint}</p>}
      {editing ? (
        type === "textarea" ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={3}
            className="w-full bg-surface border border-border rounded-lg p-2.5 text-sm text-foreground resize-none focus:outline-none focus:border-accent"
          />
        ) : (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-surface border border-border rounded-lg p-2.5 text-sm text-foreground focus:outline-none focus:border-accent"
          />
        )
      ) : (
        <p className="text-sm">{value}</p>
      )}
    </div>
  );
}
