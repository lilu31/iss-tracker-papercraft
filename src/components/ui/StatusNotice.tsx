"use client";

import { RefreshCw, Satellite, TriangleAlert } from "lucide-react";
import { PaperCard } from "@/components/ui/PaperCard";
import type { IssStatus } from "@/types";

export interface StatusNoticeProps {
  status: IssStatus;
  message: string | null;
  onRetry: () => void;
}

function RetryButton({ onRetry }: { onRetry: () => void }) {
  return (
    <button
      type="button"
      onClick={onRetry}
      className="inline-flex shrink-0 items-center gap-2 rounded-2xl border-2 border-paper-edge bg-accent-yellow px-4 py-2 font-display font-extrabold text-ink shadow-paper transition active:translate-y-0.5 active:shadow-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-blue"
    >
      <RefreshCw className="h-5 w-5" strokeWidth={3} aria-hidden />
      Nochmal versuchen
    </button>
  );
}

/**
 * Der "fail gracefully"-Teil (F4): statt einer leeren Seite erklaert die App,
 * was los ist - und laesst die zuletzt bekannten Werte stehen, wenn sie schon
 * einmal da waren.
 */
export function StatusNotice({ status, message, onRetry }: StatusNoticeProps) {
  if (status === "live") return null;

  if (status === "loading") {
    return (
      <PaperCard tone="sand" className="flex items-center gap-3">
        <Satellite className="h-6 w-6 shrink-0 animate-bob text-accent-blue" strokeWidth={2.5} aria-hidden />
        <p role="status" className="font-bold text-ink">
          Wir suchen die ISS am Himmel …
        </p>
      </PaperCard>
    );
  }

  // "stale": wir haben alte Werte, nur der letzte Abruf hing.
  const title = status === "stale" ? "Die ISS meldet sich gerade nicht." : "Da ist etwas schiefgelaufen.";

  return (
    <PaperCard tone="sand" className="flex flex-wrap items-center gap-3">
      <TriangleAlert className="h-6 w-6 shrink-0 text-accent-red" strokeWidth={2.5} aria-hidden />
      <div className="min-w-0 flex-1">
        <p role="alert" className="font-display font-extrabold text-ink">
          {title}
        </p>
        <p className="text-sm font-semibold text-ink-soft">
          {message ?? "Gleich nochmal probieren!"}
          {status === "stale" && " Die letzten Werte bleiben so lange stehen."}
        </p>
      </div>
      <RetryButton onRetry={onRetry} />
    </PaperCard>
  );
}
