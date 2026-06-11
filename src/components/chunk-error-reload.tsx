"use client";

import { useEffect } from "react";

/**
 * Auto-recovers from `ChunkLoadError`.
 *
 * When a new build/deploy changes chunk hashes, a browser tab opened on the old
 * version requests JS chunks that no longer exist → "Loading chunk … failed".
 * This listens for that error and reloads the page once (throttled, so it can
 * never loop) to pull the fresh chunks. Harmless no-op when nothing breaks.
 */
export function ChunkErrorReload() {
  useEffect(() => {
    const KEY = "cb:chunk-reload-at";

    const isChunkError = (v: unknown): boolean => {
      const s =
        typeof v === "string"
          ? v
          : v && typeof v === "object"
            ? `${(v as { name?: string }).name ?? ""} ${(v as { message?: string }).message ?? ""}`
            : "";
      return /ChunkLoadError|Loading chunk [\w/.-]+ failed|Loading CSS chunk/i.test(s);
    };

    const reloadOnce = () => {
      const last = Number(sessionStorage.getItem(KEY) ?? 0);
      if (Date.now() - last < 15000) return; // never loop
      sessionStorage.setItem(KEY, String(Date.now()));
      window.location.reload();
    };

    const onError = (e: ErrorEvent) => {
      if (isChunkError(e.error) || isChunkError(e.message)) reloadOnce();
    };
    const onRejection = (e: PromiseRejectionEvent) => {
      if (isChunkError(e.reason)) reloadOnce();
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  return null;
}
