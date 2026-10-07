"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Moon, Sun, X } from "lucide-react";
import { IssIcon } from "@/components/map/ISSIcon";
import { PaperCard } from "@/components/ui/PaperCard";
import { formatAltitude, formatSpeedComparison, formatVelocity } from "@/lib/utils";
import type { IssPosition } from "@/types";

export interface IssOverlayProps {
  position: IssPosition;
  open: boolean;
  onClose: () => void;
}

/**
 * Infofenster zur ISS.
 *
 * Es "ploppt" wie eine aufgeklappte Papierkarte auf: federt von klein nach
 * gross und behaelt eine leichte Schraeglage, damit es handgemacht wirkt.
 */
export function IssOverlay({ position, open, onClose }: IssOverlayProps) {
  const isDaylight = position.visibility === "daylight";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="pointer-events-none absolute bottom-4 left-4 right-4 z-[500] sm:right-auto sm:w-80"
          initial={{ opacity: 0, scale: 0.85, y: 24, rotate: 3 }}
          animate={{ opacity: 1, scale: 1, y: 0, rotate: -1 }}
          exit={{ opacity: 0, scale: 0.9, y: 16, rotate: 2 }}
          transition={{ type: "spring", stiffness: 320, damping: 24 }}
        >
          <PaperCard tone="cream" elevation="xl" className="pointer-events-auto relative">
            <button
              type="button"
              onClick={onClose}
              aria-label="Infofenster schließen"
              className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full border-2 border-paper-edge bg-paper-white text-ink-soft shadow-paper transition hover:text-accent-red focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-blue"
            >
              <X className="h-4 w-4" strokeWidth={3} aria-hidden />
            </button>

            <div className="flex items-center gap-3">
              <IssIcon className="h-10 w-10 shrink-0 animate-drift" />
              <p className="font-display text-xl font-extrabold leading-tight text-ink">
                Hier fliegt die ISS!
              </p>
            </div>

            <dl className="mt-4 space-y-3">
              <div className="rounded-2xl border-2 border-paper-edge bg-paper-white px-4 py-3 shadow-paper">
                <dt className="text-sm font-bold uppercase tracking-wide text-ink-soft">
                  Geschwindigkeit
                </dt>
                <dd className="font-display text-3xl font-extrabold text-accent-red">
                  {formatVelocity(position.velocity)}
                </dd>
                <p className="mt-1 text-sm font-semibold text-ink-soft">
                  {formatSpeedComparison(position.velocity)}
                </p>
              </div>

              <div className="rounded-2xl border-2 border-paper-edge bg-paper-white px-4 py-3 shadow-paper">
                <dt className="text-sm font-bold uppercase tracking-wide text-ink-soft">
                  Höhe über der Erde
                </dt>
                <dd className="font-display text-3xl font-extrabold text-accent-blue">
                  {formatAltitude(position.altitude)}
                </dd>
              </div>

              <div className="flex items-center gap-2 rounded-2xl border-2 border-paper-edge bg-paper-sand px-4 py-3 shadow-paper">
                {isDaylight ? (
                  <Sun className="h-6 w-6 shrink-0 text-accent-yellow" strokeWidth={2.5} aria-hidden />
                ) : (
                  <Moon className="h-6 w-6 shrink-0 text-accent-blue" strokeWidth={2.5} aria-hidden />
                )}
                <p className="text-sm font-bold text-ink">
                  {isDaylight
                    ? "Gerade fliegt sie durch den Sonnenschein."
                    : "Gerade fliegt sie durch den Erdschatten."}
                </p>
              </div>
            </dl>
          </PaperCard>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
