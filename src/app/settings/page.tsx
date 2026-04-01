"use client";

import { useEffect, useState, useCallback } from "react";
import { settingsStore, AppSettings } from "@/lib/store";

const days = [
  { key: "monday", label: "Segunda" },
  { key: "tuesday", label: "Terca" },
  { key: "wednesday", label: "Quarta" },
  { key: "thursday", label: "Quinta" },
  { key: "friday", label: "Sexta" },
  { key: "saturday", label: "Sabado" },
  { key: "sunday", label: "Domingo" },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSettings(settingsStore.get());
  }, []);

  const save = useCallback(() => {
    if (!settings) return;
    settingsStore.update(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [settings]);

  if (!settings) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Configuracoes</h1>
          <p className="text-muted text-sm mt-1">API keys, horarios e preferencias</p>
        </div>
        {saved && (
          <span className="text-green-400 text-sm font-medium px-3 py-1 bg-green-500/10 rounded-lg">
            Salvo!
          </span>
        )}
      </div>

      {/* API Keys */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <h2 className="font-semibold text-lg mb-4">API Keys</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Claude API Key (Anthropic)</label>
            <p className="text-xs text-muted mb-2">Para geracao de roteiros com IA</p>
            <input
              type="password"
              value={settings.claudeApiKey}
              onChange={(e) => setSettings({ ...settings, claudeApiKey: e.target.value })}
              placeholder="sk-ant-..."
              className="w-full bg-background border border-border rounded-lg p-2.5 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Meta Graph API Key</label>
            <p className="text-xs text-muted mb-2">Para publicacao no Instagram</p>
            <input
              type="password"
              value={settings.metaApiKey}
              onChange={(e) => setSettings({ ...settings, metaApiKey: e.target.value })}
              placeholder="EAA..."
              className="w-full bg-background border border-border rounded-lg p-2.5 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">TikTok API Key</label>
            <p className="text-xs text-muted mb-2">Para publicacao no TikTok</p>
            <input
              type="password"
              value={settings.tiktokApiKey}
              onChange={(e) => setSettings({ ...settings, tiktokApiKey: e.target.value })}
              placeholder="..."
              className="w-full bg-background border border-border rounded-lg p-2.5 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent"
            />
          </div>
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
