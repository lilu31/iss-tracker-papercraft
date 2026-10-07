import { Satellite } from "lucide-react";

/** Kopfzeile: gross, rund und einladend - wie der Titel eines Kinderbuchs. */
export function Header() {
  return (
    <header className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 pb-8 pt-10 text-center">
      <div className="flex items-center gap-3">
        <span className="grid h-14 w-14 shrink-0 -rotate-6 place-items-center rounded-2xl border-2 border-paper-edge bg-accent-yellow shadow-paper">
          <Satellite className="h-8 w-8 text-ink" strokeWidth={2.5} aria-hidden />
        </span>
        <h1 className="font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
          ISS Live-Tracker
        </h1>
      </div>

      <p className="max-w-xl text-balance text-lg font-semibold text-ink-soft">
        Schau zu, wie die Raumstation über unsere Erde fliegt – live und in
        Echtzeit!
      </p>
    </header>
  );
}
