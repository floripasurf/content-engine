"use client";

import { useEffect, useState } from "react";
import { initializeStore } from "@/lib/store";

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initializeStore();
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center mx-auto mb-4 glow-pulse">
            <span className="text-2xl">✨</span>
          </div>
          <p className="text-muted text-sm">Carregando Content Engine...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
