"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { IssApiError, POLL_INTERVAL_MS, fetchIssPosition } from "@/lib/api";
import type { IssPosition, IssStatus } from "@/types";

export interface UseIssPositionResult {
  status: IssStatus;
  position: IssPosition | null;
  /** Kindgerechte Meldung, wenn etwas schiefgeht. */
  message: string | null;
  /** Sofort neu laden, ohne auf das Intervall zu warten. */
  refresh: () => void;
}

function toFriendlyMessage(error: unknown): string {
  if (error instanceof IssApiError) return error.message;
  return "Die ISS antwortet gerade nicht. Gleich nochmal probieren!";
}

/**
 * Pollt die ISS-Position im festen Takt (Anforderung F3).
 *
 * Bewusst `setTimeout` in Kette statt `setInterval`: so kann sich kein zweiter
 * Request aufstapeln, wenn das Netz langsam ist.
 */
export function useIssPosition(): UseIssPositionResult {
  const [position, setPosition] = useState<IssPosition | null>(null);
  const [status, setStatus] = useState<IssStatus>("loading");
  const [message, setMessage] = useState<string | null>(null);

  // Unterscheidet "noch nie Daten bekommen" (error) von "kurz weg" (stale).
  const hasData = useRef(false);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    /** Wartezeit bis zur naechsten Abfrage - bei Drosselung laenger. */
    let delay = POLL_INTERVAL_MS;

    const load = async () => {
      try {
        const next = await fetchIssPosition(controller.signal);
        if (cancelled) return;
        hasData.current = true;
        setPosition(next);
        setStatus("live");
        setMessage(null);
        delay = POLL_INTERVAL_MS;
      } catch (error) {
        // Abbruch beim Unmount ist kein Fehler, den man anzeigen muesste.
        if (cancelled || controller.signal.aborted) return;
        setStatus(hasData.current ? "stale" : "error");
        setMessage(toFriendlyMessage(error));
        // Bittet der Server um Ruhe, halten wir uns daran - sonst laufen wir
        // immer tiefer in die Drosselung hinein statt herauszukommen.
        delay = error instanceof IssApiError && error.retryAfterMs
          ? error.retryAfterMs
          : POLL_INTERVAL_MS;
      }
    };

    const tick = async () => {
      await load();
      if (cancelled) return;
      timer = setTimeout(tick, delay);
    };

    void tick();

    return () => {
      cancelled = true;
      controller.abort();
      if (timer) clearTimeout(timer);
    };
  }, [reloadToken]);

  const refresh = useCallback(() => {
    setStatus("loading");
    setMessage(null);
    setReloadToken((token) => token + 1);
  }, []);

  return { status, position, message, refresh };
}
