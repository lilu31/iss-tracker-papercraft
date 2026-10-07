"use client";

import { ArrowUpFromLine, Compass, Gauge, MapPin } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PaperCard } from "@/components/ui/PaperCard";
import {
  formatAltitude,
  formatLatitude,
  formatLongitude,
  formatVelocity,
} from "@/lib/utils";
import type { IssPosition, IssStatus } from "@/types";

interface StatCardProps {
  label: string;
  value: string;
  hint: string;
  icon: LucideIcon;
  iconClassName: string;
}

function StatCard({ label, value, hint, icon: Icon, iconClassName }: StatCardProps) {
  return (
    <PaperCard className="flex items-start gap-3">
      <span
        className={`grid h-11 w-11 shrink-0 -rotate-3 place-items-center rounded-2xl border-2 border-paper-edge shadow-paper ${iconClassName}`}
      >
        <Icon className="h-6 w-6 text-ink" strokeWidth={2.5} aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-bold uppercase tracking-wide text-ink-soft">{label}</p>
        <p className="font-display text-2xl font-extrabold leading-tight text-ink">{value}</p>
        <p className="text-sm font-semibold text-ink-soft">{hint}</p>
      </div>
    </PaperCard>
  );
}

/** Platzhalter in Papieroptik, solange noch keine Werte da sind. */
function StatCardSkeleton() {
  return (
    <PaperCard className="flex items-start gap-3">
      <span className="h-11 w-11 shrink-0 animate-pulse rounded-2xl border-2 border-paper-edge bg-paper-sand" />
      <div className="w-full space-y-2 pt-1">
        <span className="block h-3 w-20 animate-pulse rounded-full bg-paper-sand" />
        <span className="block h-7 w-28 animate-pulse rounded-full bg-paper-sand" />
      </div>
    </PaperCard>
  );
}

export interface StatsGridProps {
  position: IssPosition | null;
  status: IssStatus;
}

/** Die vier Messwerte aus F2: Breite, Länge, Höhe, Geschwindigkeit. */
export function StatsGrid({ position, status }: StatsGridProps) {
  const showSkeleton = status === "loading" && position === null;

  if (showSkeleton || position === null) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <StatCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Breitengrad"
        value={formatLatitude(position.latitude)}
        hint={position.latitude >= 0 ? "nördliche Halbkugel" : "südliche Halbkugel"}
        icon={MapPin}
        iconClassName="bg-accent-red"
      />
      <StatCard
        label="Längengrad"
        value={formatLongitude(position.longitude)}
        hint={position.longitude >= 0 ? "östlich von Greenwich" : "westlich von Greenwich"}
        icon={Compass}
        iconClassName="bg-accent-yellow"
      />
      <StatCard
        label="Höhe"
        value={formatAltitude(position.altitude)}
        hint="über der Erdoberfläche"
        icon={ArrowUpFromLine}
        iconClassName="bg-accent-blue"
      />
      <StatCard
        label="Geschwindigkeit"
        value={formatVelocity(position.velocity)}
        hint="unterwegs pro Stunde"
        icon={Gauge}
        iconClassName="bg-accent-green"
      />
    </div>
  );
}
