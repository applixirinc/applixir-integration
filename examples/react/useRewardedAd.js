// useRewardedAd.js
// AppLixir rewarded video hook for React (web) apps.
//
// The SDK's adStatusCallbackFn receives a STATUS OBJECT — { type, ad?, error? } —
// not a string. The "watched it through" signal is status.type === "complete".
// showAd() returns a promise that resolves true only on a real completion.
//
// Usage: see GameScreen.jsx in this folder.

import { useEffect, useRef, useCallback, useState } from "react";

const SDK_URL = "https://cdn.applixir.com/applixir.app.v6.1.0.js";

function loadSdk() {
  if (typeof window !== "undefined" && window.initializeAndOpenPlayer) {
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${SDK_URL}"]`);
    if (existing) {
      existing.addEventListener("load", resolve);
      existing.addEventListener("error", reject);
      return;
    }
    const script = document.createElement("script");
    script.src = SDK_URL;
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

/**
 * useRewardedAd — AppLixir rewarded video hook.
 *
 * @param {string} apiKey - Your AppLixir API key from the dashboard.
 * @param {string} containerId - ID of the div the player injects into.
 * @returns {{ ready: boolean, showAd: () => Promise<boolean>, lastStatus: string|null }}
 */
export function useRewardedAd(apiKey, containerId = "applixir-ad-container") {
  const [ready, setReady] = useState(false);
  const [lastStatus, setLastStatus] = useState(null);
  const settle = useRef(null);

  // Load the SDK once on mount.
  useEffect(() => {
    let alive = true;
    loadSdk().then(() => alive && setReady(true)).catch(console.error);
    return () => { alive = false; };
  }, []);

  const finish = (value) => {
    if (settle.current) { settle.current(value); settle.current = null; }
  };

  /**
   * showAd — call on a user action (button click, etc.).
   * Resolves true when the ad was watched through (status.type === "complete"),
   * false on skip / no-ad / dismissal / error.
   */
  const showAd = useCallback(() => {
    if (!ready || typeof window.initializeAndOpenPlayer !== "function") {
      console.warn("AppLixir SDK not loaded yet");
      return Promise.resolve(false);
    }
    return new Promise((resolve) => {
      settle.current = resolve;
      window.initializeAndOpenPlayer({
        apiKey,
        injectionElementId: containerId,

        adStatusCallbackFn: (status) => {
          setLastStatus(status?.type ?? null);
          // "complete" = watched through → optimistic true.
          if (status?.type === "complete") finish(true);
          // terminal no-reward states → false. (allAdsCompleted also fires after
          // a real completion, but finish() only resolves once, so complete wins.)
          else if (["skipped", "manuallyEnded", "allAdsCompleted", "consentDeclined"]
                     .includes(status?.type)) finish(false);
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
