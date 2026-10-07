import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PaperTone = "cream" | "white" | "sand";
type PaperElevation = "md" | "lg" | "xl";

const TONES: Record<PaperTone, string> = {
  cream: "bg-paper-cream",
  white: "bg-paper-white",
  sand: "bg-paper-sand",
};

const ELEVATIONS: Record<PaperElevation, string> = {
  md: "shadow-paper",
  lg: "shadow-paper-lg",
  xl: "shadow-paper-xl",
};

export interface PaperCardProps {
  children: ReactNode;
  className?: string;
  tone?: PaperTone;
  elevation?: PaperElevation;
  /** Leichte Drehung, damit die Karte nicht "perfekt" klebt. */
  tilt?: boolean;
}

/**
 * Eine Lage Bastelpapier.
 *
 * Der Charakter kommt aus drei Dingen: harter versetzter Schatten (Kante der
 * darunterliegenden Lage), cremefarbene Flaechen und grosszuegige Rundungen,
 * die die digitale Perfektion bewusst brechen.
 */
export function PaperCard({
  children,
  className,
  tone = "white",
  elevation = "lg",
  tilt = false,
}: PaperCardProps) {
  return (
    <div
      className={cn(
        "rounded-3xl border-2 border-paper-edge p-5",
        TONES[tone],
        ELEVATIONS[elevation],
        tilt && "-rotate-1",
        className,
      )}
    >
      {children}
    </div>
  );
}
