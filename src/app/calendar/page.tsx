"use client";

import { useEffect, useState, useCallback } from "react";
import { brandStore, scriptStore, postStore } from "@/lib/store";
import { Brand, Script, Post } from "@/lib/types";
import {
  cn,
  getMonthDays,
  isSameDay,
  platformIcons,
  formatDateTime,
  statusLabels,
  statusColors,
} from "@/lib/utils";

const monthNames = [
  "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];
const dayNames = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"];

export default function CalendarPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [scripts, setScripts] = useState<Script[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const reload = useCallback(() => {
    setBrands(brandStore.getAll());
    setScripts(scriptStore.getAll());
    setPosts(postStore.getAll());
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const days = getMonthDays(year, month);
  const today = new Date();

  const getPostsForDay = (day: Date) =>
    posts.filter((p) => p.scheduledAt && isSameDay(new Date(p.scheduledAt), day));

  const prevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
    setSelectedDay(null);
  };

  const nextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
    setSelectedDay(null);
  };

  const selectedDayPosts = selectedDay ? getPostsForDay(selectedDay) : [];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Calendario</h1>
          <p className="text-muted text-sm mt-1">Visualize e organize seus posts</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={prevMonth}
            className="w-8 h-8 flex items-center justify-center bg-surface border border-border rounded-lg hover:bg-surface-hover"
          >
            ‹
          </button>
          <span className="text-lg font-semibold min-w-[200px] text-center">
            {monthNames[month]} {year}
          </span>
          <button
            onClick={nextMonth}
            className="w-8 h-8 flex items-center justify-center bg-surface border border-border rounded-lg hover:bg-surface-hover"
          >
            ›
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Calendar Grid */}
        <div className="flex-1">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {dayNames.map((d) => (
              <div key={d} className="text-center text-xs text-muted py-2">
                {d}
              </div>
            ))}
          </div>
          {/* Days */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, i) => {
              if (!day) {
                return <div key={`empty-${i}`} className="aspect-square" />;
              }
              const dayPosts = getPostsForDay(day);
              const isToday = isSameDay(day, today);
              const isSelected = selectedDay && isSameDay(day, selectedDay);
              const hasLowContent = dayPosts.length > 0 && dayPosts.length < 2;

              // Group posts by brand for color dots
              const brandGroups = new Map<string, number>();
              dayPosts.forEach((p) => {
                brandGroups.set(p.brandId, (brandGroups.get(p.brandId) || 0) + 1);
              });

              return (
                <button
                  key={i}
                  onClick={() => setSelectedDay(day)}
                  className={cn(
                    "aspect-square rounded-lg border p-1.5 text-left transition-all hover:border-border-hover relative",
                    isSelected
                      ? "border-accent bg-accent/5 ring-1 ring-accent/30"
                      : isToday
                        ? "border-accent/40 bg-accent/5"
                        : "border-border/30 bg-surface/30",
                    hasLowContent && "ring-1 ring-yellow-500/30"
                  )}
                >
                  <span
                    className={cn(
                      "text-xs font-medium",
                      isToday ? "text-accent" : "text-foreground"
                    )}
                  >
                    {day.getDate()}
                  </span>
                  <div className="flex flex-wrap gap-0.5 mt-1">
                    {Array.from(brandGroups.entries()).map(([brandId, count]) => {
                      const brand = brands.find((b) => b.id === brandId);
                      return (
                        <div
                          key={brandId}
                          className="flex items-center gap-0.5"
                        >
                          {Array.from({ length: Math.min(count, 3) }).map((_, j) => (
                            <div
                              key={j}
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: brand?.colors.primary }}
                            />
                          ))}
                        </div>
                      );
                    })}
                  </div>
                  {dayPosts.length > 0 && (
                    <span className="absolute bottom-1 right-1.5 text-[9px] text-muted">
                      {dayPosts.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Brand Legend */}
          <div className="flex flex-wrap gap-3 mt-4">
            {brands.map((brand) => (
              <div key={brand.id} className="flex items-center gap-1.5">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: brand.colors.primary }}
                />
                <span className="text-xs text-muted">{brand.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Side Panel: Day Detail */}
        <div className="w-80 shrink-0">
          <div className="bg-surface border border-border rounded-xl p-5 sticky top-8">
            {selectedDay ? (
              <>
                <h3 className="font-semibold mb-1">
                  {selectedDay.getDate()} de {monthNames[selectedDay.getMonth()]}
                </h3>
                <p className="text-sm text-muted mb-4">
                  {selectedDayPosts.length} post{selectedDayPosts.length !== 1 ? "s" : ""} agendado{selectedDayPosts.length !== 1 ? "s" : ""}
                </p>

                {selectedDayPosts.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted text-sm">Nenhum post neste dia</p>
                    <a
                      href="/generate"
                      className="inline-block mt-3 text-accent text-sm hover:underline"
                    >
                      Gerar conteudo
                    </a>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedDayPosts.map((post) => {
                      const brand = brands.find((b) => b.id === post.brandId);
                      const script = scripts.find((s) => s.id === post.scriptId);
                      return (
                        <div
                          key={post.id}
                          className="bg-background rounded-lg p-3 border border-border/50"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span
                              className="w-6 h-6 rounded flex items-center justify-center text-xs"
                              style={{ backgroundColor: `${brand?.colors.primary}20` }}
                            >
                              {brand?.logoEmoji}
                            </span>
                            <span className="text-xs font-medium" style={{ color: brand?.colors.primary }}>
                              {brand?.name}
                            </span>
                            <span className="text-xs">{platformIcons[post.platform]}</span>
                            <span
                              className={cn(
                                "ml-auto text-[10px] px-1.5 py-0.5 rounded-full text-white",
                                statusColors[post.status]
                              )}
                            >
                              {statusLabels[post.status]}
                            </span>
                          </div>
                          {script && (
                            <p className="text-xs line-clamp-2 mb-1">{script.hook}</p>
                          )}
                          <p className="text-[10px] text-muted">
                            {post.scheduledAt && formatDateTime(post.scheduledAt)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}

                {selectedDayPosts.length > 0 && selectedDayPosts.length < 6 && (
                  <div className="mt-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                    <p className="text-xs text-yellow-400">
                      Menos de 6 posts neste dia. Considere gerar mais conteudo.
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted text-sm">Selecione um dia para ver detalhes</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
