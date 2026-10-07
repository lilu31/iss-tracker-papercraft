"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import { Rocket } from "lucide-react";
import { Header } from "@/components/ui/Header";
import { IssOverlay } from "@/components/ui/IssOverlay";
import { StatsGrid } from "@/components/ui/StatsGrid";
import { StatusNotice } from "@/components/ui/StatusNotice";
import { useIssPosition } from "@/hooks/useIssPosition";

/**
 * Leaflet greift beim Import auf `window` zu und vertraegt deshalb kein
 * Server-Rendering. `ssr: false` laedt die Karte erst im Browser - dafuer muss
 * diese Seite eine Client-Komponente sein.
 */
const WorldMap = dynamic(() => import("@/components/map/WorldMap"), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

function MapSkeleton() {
  return (
    <div
      role="status"
      aria-label="Karte wird geladen"
      className="grid h-full w-full place-items-center bg-ocean"
    >
      <div className="h-16 w-16 animate-pulse rounded-full border-4 border-paper-white/70 bg-paper-white/40" />
    </div>
  );
}

export default function Page() {
  const { status, position, message, refresh } = useIssPosition();
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  const toggleOverlay = useCallback(() => setIsOverlayOpen((open) => !open), []);
  const closeOverlay = useCallback(() => setIsOverlayOpen(false), []);
  const toggleFollowing = useCallback(() => setIsFollowing((on) => !on), []);

  return (
    <>
      <Header />

      <main className="mx-auto flex max-w-6xl flex-col gap-5 px-4 pb-16">
        <StatusNotice status={status} message={message} onRetry={refresh} />

        <section className="relative">
          {/*
            `isolate` kapselt die z-index-Ebenen von Leaflet (Panels bis 700).
            Ohne das koennte das Infofenster von Kartenebenen ueberdeckt werden.
          */}
          <div className="isolate h-[clamp(20rem,52vh,34rem)] overflow-hidden rounded-4xl border-4 border-paper-white shadow-paper-xl">
            <WorldMap
              position={position}
              overlayOpen={isOverlayOpen}
              follow={isFollowing}
              onToggleOverlay={toggleOverlay}
            />
          </div>

          {/*
            Auf der ganzen Weltkarte wandert die ISS pro zehn Sekunden nur
            wenige Pixel - die Bewegung ist erst beim Heranzoomen zu sehen.
            Der Schalter loest genau das und laesst die Karte mitfliegen.
          */}
          <button
            type="button"
            onClick={toggleFollowing}
            aria-pressed={isFollowing}
            className={`absolute right-4 top-4 z-10 inline-flex items-center gap-2 rounded-2xl border-2 border-paper-edge px-4 py-2 font-display font-extrabold shadow-paper-lg transition active:translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-blue ${
              isFollowing ? "bg-accent-red text-paper-white" : "bg-paper-white text-ink"
            }`}
          >
            <Rocket className="h-5 w-5" strokeWidth={2.5} aria-hidden />
            {isFollowing ? "Mitfliegen beenden" : "Mitfliegen"}
          </button>

          {position && (
            <IssOverlay
              position={position}
              open={isOverlayOpen}
              onClose={closeOverlay}
            />
          )}

          <p className="mt-3 text-center text-sm font-semibold text-ink-soft">
            Tippe auf die ISS, um mehr über sie zu erfahren!
          </p>
        </section>

        <StatsGrid position={position} status={status} />
      </main>
    </>
  );
}
