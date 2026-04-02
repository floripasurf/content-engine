"use client";

import { useEffect, useState, useCallback } from "react";
import { settingsStore } from "@/lib/store";
import type { AppSettings } from "@/lib/types";
import { cn, platformIcons, platformNames, platformColors } from "@/lib/utils";

const days = [
  { key: "monday", label: "Segunda" },
  { key: "tuesday", label: "Terca" },
  { key: "wednesday", label: "Quarta" },
  { key: "thursday", label: "Quinta" },
  { key: "friday", label: "Sexta" },
  { key: "saturday", label: "Sabado" },
  { key: "sunday", label: "Domingo" },
];

const allPlatforms = ["instagram", "tiktok", "youtube", "linkedin"];

const defaultOptimizedTimes: Record<string, string[]> = {
  instagram: ["09:00", "12:00", "18:00", "21:00"],
  tiktok: ["07:00", "12:00", "17:00", "21:00", "23:00"],
  youtube: ["14:00", "17:00"],
  linkedin: ["08:00", "12:00", "17:00"],
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [saved, setSaved] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, "loading" | "success" | "error">>({});

  useEffect(() => {
    setSettings(settingsStore.get());
  }, []);

  const save = useCallback(() => {
    if (!settings) return;
    settingsStore.update(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [settings]);

  const handleTestConnection = async (platform: string) => {
    if (!settings) return;
    setTestResults((prev) => ({ ...prev, [platform]: "loading" }));
    try {
      const res = await fetch("/api/publish/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, settings }),
      });
      const data = await res.json();
      setTestResults((prev) => ({ ...prev, [platform]: data.connected ? "success" : "error" }));
    } catch {
      setTestResults((prev) => ({ ...prev, [platform]: "error" }));
    }
    setTimeout(() => setTestResults((prev) => ({ ...prev, [platform]: undefined as unknown as "loading" })), 3000);
  };

  if (!settings) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Configuracoes</h1>
          <p className="text-muted text-sm mt-1">API keys, publicacao, horarios e preferencias</p>
        </div>
        {saved && (
          <span className="text-green-400 text-sm font-medium px-3 py-1 bg-green-500/10 rounded-lg">
            Salvo!
          </span>
        )}
      </div>

      {/* AI Generation */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <h2 className="font-semibold text-lg mb-4">Geração de Conteúdo com IA</h2>
        <div className="flex items-center gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
          <span className="text-2xl">🖥️</span>
          <div>
            <p className="font-medium text-green-400">Claude CLI Local — Custo Zero</p>
            <p className="text-sm text-muted">
              Os roteiros são gerados usando o Claude Code instalado no seu Mac.
              Sem custo de API — usa sua assinatura existente.
              O comando <code className="bg-background px-1.5 py-0.5 rounded text-xs font-mono">claude -p</code> é chamado automaticamente.
            </p>
          </div>
        </div>
      </div>

      {/* Publish Mode */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <h2 className="font-semibold text-lg mb-4">Modo de Publicacao</h2>
        <div className="space-y-3">
          {([
            { value: "buffer" as const, label: "Buffer API", desc: "Uma integracao, todas as redes (recomendado)" },
            { value: "direct" as const, label: "APIs Diretas", desc: "Meta Graph + TikTok + YouTube APIs" },
            { value: "manual" as const, label: "Manual", desc: "Apenas gera conteudo, nao posta automaticamente" },
          ]).map((mode) => (
            <label
              key={mode.value}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg cursor-pointer border transition-colors",
                settings.publishMode === mode.value
                  ? "border-accent bg-accent/5"
                  : "border-border bg-background hover:border-border/80"
              )}
            >
              <input
                type="radio"
                name="publishMode"
                value={mode.value}
                checked={settings.publishMode === mode.value}
                onChange={() => setSettings({ ...settings, publishMode: mode.value })}
                className="accent-accent"
              />
              <div>
                <p className="text-sm font-medium">{mode.label}</p>
                <p className="text-xs text-muted">{mode.desc}</p>
              </div>
            </label>
          ))}
        </div>

        {/* Dry Run Toggle */}
        <div className="flex items-center justify-between mt-4 p-3 bg-background rounded-lg border border-border">
          <div>
            <p className="text-sm font-medium">Modo teste (dry run)</p>
            <p className="text-xs text-muted">Simula publicacao sem postar de verdade</p>
          </div>
          <button
            onClick={() => setSettings({ ...settings, dryRun: !settings.dryRun })}
            className={cn(
              "w-12 h-6 rounded-full transition-colors relative",
              settings.dryRun ? "bg-yellow-500" : "bg-border"
            )}
          >
            <div className={cn(
              "w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform",
              settings.dryRun ? "translate-x-6" : "translate-x-0.5"
            )} />
          </button>
        </div>
        {settings.dryRun && (
          <p className="text-xs text-yellow-400 mt-2 px-3">
            Modo teste ativo — nenhuma publicacao sera feita de verdade
          </p>
        )}
      </div>

      {/* Platform Connections */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <h2 className="font-semibold text-lg mb-4">Conexoes de Plataforma</h2>

        {settings.publishMode === "buffer" ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Buffer API Key</label>
              <p className="text-xs text-muted mb-2">Obtenha em buffer.com/developers</p>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={settings.bufferApiKey || ""}
                  onChange={(e) => setSettings({ ...settings, bufferApiKey: e.target.value })}
                  placeholder="Buffer access token..."
                  className="flex-1 bg-background border border-border rounded-lg p-2.5 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent"
                />
                <button
                  onClick={() => handleTestConnection("buffer")}
                  className="px-4 py-2 bg-accent/20 text-accent rounded-lg text-sm hover:bg-accent/30 transition-colors"
                >
                  {testResults["buffer"] === "loading" ? "..." : testResults["buffer"] === "success" ? "Conectado!" : testResults["buffer"] === "error" ? "Falhou" : "Testar"}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Profile IDs por plataforma</label>
              {allPlatforms.map((platform) => (
                <div key={platform} className="flex items-center gap-2 mb-2">
                  <span className={cn("w-6 h-6 rounded flex items-center justify-center text-xs bg-gradient-to-br text-white", platformColors[platform])}>
                    {platformIcons[platform]}
                  </span>
                  <span className="text-sm w-24">{platformNames[platform]}</span>
                  <input
                    type="text"
                    value={settings.bufferProfileIds?.[platform] || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        bufferProfileIds: {
                          ...(settings.bufferProfileIds || {}),
                          [platform]: e.target.value,
                        },
                      })
                    }
                    placeholder="Profile ID..."
                    className="flex-1 bg-background border border-border rounded p-1.5 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent"
                  />
                </div>
              ))}
            </div>
          </div>
        ) : settings.publishMode === "direct" ? (
          <div className="space-y-6">
            {/* Meta / Instagram */}
            <div className="p-4 bg-background rounded-lg border border-border">
              <div className="flex items-center gap-2 mb-3">
                <span className={cn("w-7 h-7 rounded-lg flex items-center justify-center text-sm bg-gradient-to-br text-white", platformColors.instagram)}>
                  {platformIcons.instagram}
                </span>
                <span className="text-sm font-semibold">Meta (Instagram / Facebook)</span>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-muted mb-1">Access Token</label>
                  <input
                    type="password"
                    value={settings.metaApiKey}
                    onChange={(e) => setSettings({ ...settings, metaApiKey: e.target.value })}
                    placeholder="EAA..."
                    className="w-full bg-surface border border-border rounded p-2 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-muted mb-1">Page ID</label>
                    <input
                      type="text"
                      value={settings.metaPageId || ""}
                      onChange={(e) => setSettings({ ...settings, metaPageId: e.target.value })}
                      placeholder="Page ID..."
                      className="w-full bg-surface border border-border rounded p-2 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted mb-1">IG User ID</label>
                    <input
                      type="text"
                      value={settings.metaIgUserId || ""}
                      onChange={(e) => setSettings({ ...settings, metaIgUserId: e.target.value })}
                      placeholder="IG User ID..."
                      className="w-full bg-surface border border-border rounded p-2 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>
                <button
                  onClick={() => handleTestConnection("instagram")}
                  className="px-3 py-1.5 bg-accent/20 text-accent rounded text-xs hover:bg-accent/30 transition-colors"
                >
                  {testResults["instagram"] === "loading" ? "Testando..." : testResults["instagram"] === "success" ? "Conectado!" : testResults["instagram"] === "error" ? "Falhou" : "Testar conexao"}
                </button>
              </div>
            </div>

            {/* TikTok */}
            <div className="p-4 bg-background rounded-lg border border-border">
              <div className="flex items-center gap-2 mb-3">
                <span className={cn("w-7 h-7 rounded-lg flex items-center justify-center text-sm bg-gradient-to-br text-white", platformColors.tiktok)}>
                  {platformIcons.tiktok}
                </span>
                <span className="text-sm font-semibold">TikTok</span>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-muted mb-1">Access Token</label>
                  <input
                    type="password"
                    value={settings.tiktokApiKey}
                    onChange={(e) => setSettings({ ...settings, tiktokApiKey: e.target.value })}
                    placeholder="TikTok access token..."
                    className="w-full bg-surface border border-border rounded p-2 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted mb-1">Open ID</label>
                  <input
                    type="text"
                    value={settings.tiktokOpenId || ""}
                    onChange={(e) => setSettings({ ...settings, tiktokOpenId: e.target.value })}
                    placeholder="Open ID..."
                    className="w-full bg-surface border border-border rounded p-2 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent"
                  />
                </div>
                <button
                  onClick={() => handleTestConnection("tiktok")}
                  className="px-3 py-1.5 bg-accent/20 text-accent rounded text-xs hover:bg-accent/30 transition-colors"
                >
                  {testResults["tiktok"] === "loading" ? "Testando..." : testResults["tiktok"] === "success" ? "Conectado!" : testResults["tiktok"] === "error" ? "Falhou" : "Testar conexao"}
                </button>
              </div>
            </div>

            {/* YouTube */}
            <div className="p-4 bg-background rounded-lg border border-border">
              <div className="flex items-center gap-2 mb-3">
                <span className={cn("w-7 h-7 rounded-lg flex items-center justify-center text-sm bg-gradient-to-br text-white", platformColors.youtube)}>
                  {platformIcons.youtube}
                </span>
                <span className="text-sm font-semibold">YouTube</span>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-muted mb-1">API Key</label>
                  <input
                    type="password"
                    value={settings.youtubeApiKey || ""}
                    onChange={(e) => setSettings({ ...settings, youtubeApiKey: e.target.value })}
                    placeholder="YouTube API key..."
                    className="w-full bg-surface border border-border rounded p-2 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted mb-1">Channel ID</label>
                  <input
                    type="text"
                    value={settings.youtubeChannelId || ""}
                    onChange={(e) => setSettings({ ...settings, youtubeChannelId: e.target.value })}
                    placeholder="UC..."
                    className="w-full bg-surface border border-border rounded p-2 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent"
                  />
                </div>
                <button
                  onClick={() => handleTestConnection("youtube")}
                  className="px-3 py-1.5 bg-accent/20 text-accent rounded text-xs hover:bg-accent/30 transition-colors"
                >
                  {testResults["youtube"] === "loading" ? "Testando..." : testResults["youtube"] === "success" ? "Conectado!" : testResults["youtube"] === "error" ? "Falhou" : "Testar conexao"}
                </button>
              </div>
            </div>

            {/* LinkedIn */}
            <div className="p-4 bg-background rounded-lg border border-border">
              <div className="flex items-center gap-2 mb-3">
                <span className={cn("w-7 h-7 rounded-lg flex items-center justify-center text-sm bg-gradient-to-br text-white", platformColors.linkedin)}>
                  {platformIcons.linkedin}
                </span>
                <span className="text-sm font-semibold">LinkedIn</span>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-muted mb-1">Access Token</label>
                  <input
                    type="password"
                    value={settings.linkedinApiKey || ""}
                    onChange={(e) => setSettings({ ...settings, linkedinApiKey: e.target.value })}
                    placeholder="LinkedIn access token..."
                    className="w-full bg-surface border border-border rounded p-2 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent"
                  />
                </div>
                <button
                  onClick={() => handleTestConnection("linkedin")}
                  className="px-3 py-1.5 bg-accent/20 text-accent rounded text-xs hover:bg-accent/30 transition-colors"
                >
                  {testResults["linkedin"] === "loading" ? "Testando..." : testResults["linkedin"] === "success" ? "Conectado!" : testResults["linkedin"] === "error" ? "Falhou" : "Testar conexao"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-background rounded-lg p-4 text-center">
            <p className="text-muted text-sm">Modo manual selecionado — nenhuma conexao necessaria</p>
          </div>
        )}
      </div>

      {/* Optimized Times */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <h2 className="font-semibold text-lg mb-4">Horarios Otimizados</h2>
        <p className="text-xs text-muted mb-4">Horarios ideais de publicacao por plataforma (separados por virgula)</p>
        <div className="space-y-3">
          {allPlatforms.map((platform) => {
            const times = settings.optimizedTimes?.[platform] || defaultOptimizedTimes[platform] || [];
            return (
              <div key={platform} className="flex items-center gap-3 p-3 bg-background rounded-lg">
                <span className={cn("w-7 h-7 rounded-lg flex items-center justify-center text-sm bg-gradient-to-br text-white", platformColors[platform])}>
                  {platformIcons[platform]}
                </span>
                <span className="text-sm font-medium w-24">{platformNames[platform]}</span>
                <input
                  value={times.join(", ")}
                  onChange={(e) => {
                    const newTimes = e.target.value.split(",").map((t) => t.trim()).filter(Boolean);
                    setSettings({
                      ...settings,
                      optimizedTimes: {
                        ...(settings.optimizedTimes || defaultOptimizedTimes),
                        [platform]: newTimes,
                      },
                    });
                  }}
                  placeholder="09:00, 12:00, 18:00"
                  className="flex-1 bg-surface border border-border rounded p-1.5 text-sm text-foreground focus:outline-none focus:border-accent"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Posting Schedule */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <h2 className="font-semibold text-lg mb-4">Horarios de Publicacao</h2>
        <p className="text-xs text-muted mb-4">
          Defina os melhores horarios por dia da semana
        </p>
        <div className="space-y-3">
          {days.map((day) => {
            const schedule = settings.postingSchedule[day.key] || {
              times: [],
              platforms: [],
            };
            return (
              <div
                key={day.key}
                className="flex items-center gap-4 p-3 bg-background rounded-lg"
              >
                <span className="text-sm font-medium w-24">{day.label}</span>
                <input
                  value={schedule.times.join(", ")}
                  onChange={(e) => {
                    const times = e.target.value.split(",").map((t) => t.trim()).filter(Boolean);
                    setSettings({
                      ...settings,
                      postingSchedule: {
                        ...settings.postingSchedule,
                        [day.key]: { ...schedule, times },
                      },
                    });
                  }}
                  placeholder="09:00, 13:00, 19:00"
                  className="flex-1 bg-surface border border-border rounded p-1.5 text-sm text-foreground focus:outline-none focus:border-accent"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Team Members Placeholder */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <h2 className="font-semibold text-lg mb-2">Equipe</h2>
        <p className="text-sm text-muted mb-4">
          Adicione revisores e editores (em breve)
        </p>
        <div className="bg-background rounded-lg p-4 text-center">
          <p className="text-muted text-sm">Funcionalidade disponivel em breve</p>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <h2 className="font-semibold text-lg mb-4">Dados</h2>
        <div className="flex gap-3">
          <button
            onClick={() => {
              if (confirm("Isso vai resetar TODOS os dados. Tem certeza?")) {
                localStorage.clear();
                window.location.reload();
              }
            }}
            className="px-4 py-2 bg-red-600/20 text-red-400 rounded-lg text-sm hover:bg-red-600/30 transition-colors"
          >
            Resetar todos os dados
          </button>
          <button
            onClick={() => {
              const data = {
                brands: localStorage.getItem("ce_brands"),
                scripts: localStorage.getItem("ce_scripts"),
                posts: localStorage.getItem("ce_posts"),
                templates: localStorage.getItem("ce_templates"),
                pillars: localStorage.getItem("ce_pillars"),
              };
              const blob = new Blob([JSON.stringify(data, null, 2)], {
                type: "application/json",
              });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "content-engine-backup.json";
              a.click();
            }}
            className="px-4 py-2 bg-accent/20 text-accent rounded-lg text-sm hover:bg-accent/30 transition-colors"
          >
            Exportar dados
          </button>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={save}
        className="w-full py-3 bg-accent hover:bg-accent-hover text-white rounded-xl font-medium transition-colors"
      >
        Salvar Configuracoes
      </button>
    </div>
  );
}
