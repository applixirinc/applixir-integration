// useRewardedAd.ts
// TypeScript version of the AppLixir rewarded video hook for React (web).
// The SDK's adStatusCallbackFn receives a status OBJECT ({ type, ad?, error? }),
// and the completion signal is status.type === "complete".

import { useCallback, useEffect, useRef, useState } from "react";

type AdStatus = { type: string; ad?: unknown; error?: string };
type AdError = {
  getError: () => { data: { type: string; errorCode: number; errorMessage: string } };
};

interface ApplixirOptions {
  apiKey: string;
  injectionElementId: string;
  adStatusCallbackFn: (status: AdStatus) => void;
  adErrorCallbackFn?: (error: AdError) => void;
}

declare global {
  interface Window {
    initializeAndOpenPlayer?: (options: ApplixirOptions) => void;
  }
}

const SDK_URL = "https://cdn.applixir.com/applixir.app.v6.1.0.js";

function loadSdk(): Promise<void> {
  if (typeof window !== "undefined" && window.initializeAndOpenPlayer) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SDK_URL}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", reject);
      return;
    }
    const script = document.createElement("script");
    script.src = SDK_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export function useRewardedAd(apiKey: string, containerId = "applixir-ad-container") {
  const [ready, setReady] = useState(false);
  const [lastStatus, setLastStatus] = useState<string | null>(null);
  const settle = useRef<((v: boolean) => void) | null>(null);

  useEffect(() => {
    let alive = true;
    loadSdk().then(() => alive && setReady(true)).catch(console.error);
    return () => { alive = false; };
  }, []);

  const finish = (value: boolean) => {
    if (settle.current) { settle.current(value); settle.current = null; }
  };

  const showAd = useCallback((): Promise<boolean> => {
    if (!ready || typeof window.initializeAndOpenPlayer !== "function") {
      console.warn("AppLixir SDK not loaded yet");
      return Promise.resolve(false);
    }
    return new Promise<boolean>((resolve) => {
      settle.current = resolve;
      window.initializeAndOpenPlayer!({
        apiKey,
        injectionElementId: containerId,
        adStatusCallbackFn: (status) => {
          setLastStatus(status?.type ?? null);
          if (status?.type === "complete") finish(true);
          else if (["skipped", "manuallyEnded", "allAdsCompleted", "consentDeclined"].includes(status?.type)) finish(false);
        },
        adErrorCallbackFn: (error) => {
          console.error("AppLixir error:", error.getError().data);
          finish(false);
        },
      });
    });
  }, [ready, apiKey, containerId]);

  return { ready, showAd, lastStatus };
}
