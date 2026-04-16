// useRewardedAd.js
// AppLixir rewarded video hook for React apps
// Usage: see example at the bottom of this file

import { useEffect, useRef, useCallback, useState } from "react";

const SDK_URL = "https://cdn.applixir.com/applixir.app.v6.0.1.js";

/**
 * useRewardedAd — AppLixir rewarded video hook
 *
 * @param {string} apiKey - Your AppLixir API key from the dashboard
 * @param {string} containerId - ID of the div element for the player
 * @returns {{ showAd, isLoading, lastStatus }}
 */
export function useRewardedAd(apiKey, containerId = "applixir-ad-container") {
  const [isLoading, setIsLoading] = useState(false);
  const [lastStatus, setLastStatus] = useState(null);
  const sdkLoaded = useRef(false);

  // Load the SDK script once on mount
  useEffect(() => {
    if (sdkLoaded.current || document.querySelector(`script[src="${SDK_URL}"]`)) {
      sdkLoaded.current = true;
      return;
    }
    const script = document.createElement("script");
    script.src = SDK_URL;
    script.type = "text/javascript";
    script.onload = () => { sdkLoaded.current = true; };
    document.head.appendChild(script);
  }, []);

  /**
   * showAd — call this on a user action (button click, etc.)
   * @param {function} onRewarded - called when status === "ad-watched"
   * @param {function} onDismissed - called when ad closes without reward
   */
  const showAd = useCallback((onRewarded, onDismissed) => {
    if (!sdkLoaded.current || typeof window.initializeAndOpenPlayer !== "function") {
      console.warn("AppLixir SDK not loaded yet");
      return;
    }

    setIsLoading(true);

    const options = {
      apiKey,
      injectionElementId: containerId,

      adStatusCallbackFn: (status) => {
        setLastStatus(status);
        if (status === "ad-watched") {
          setIsLoading(false);
          onRewarded?.();
        } else if (status === "ad-skipped" || status === "no-ad" || status === "ad-error") {
          setIsLoading(false);
          onDismissed?.(status);
        } else if (status === "ad-loading") {
          setIsLoading(true);
        }
      },

      adErrorCallbackFn: (error) => {
        console.error("AppLixir error:", error.getError().data);
        setIsLoading(false);
        onDismissed?.("ad-error");
      },
    };

    window.initializeAndOpenPlayer(options);
  }, [apiKey, containerId]);

  return { showAd, isLoading, lastStatus };
}


// ─── Example Usage ───────────────────────────────────────────────────────────

/*
import React, { useState } from "react";
import { useRewardedAd } from "./useRewardedAd";

export function GameScreen() {
  const [lives, setLives] = useState(3);
  const { showAd, isLoading } = useRewardedAd("YOUR-API-KEY-HERE");

  const handleWatchAd = () => {
    showAd(
      () => setLives((l) => l + 3),          // onRewarded
      (status) => console.log("No reward:", status) // onDismissed
    );
  };

  return (
    <div>
      // IMPORTANT: This div must be in your JSX for the player to inject into
      <div id="applixir-ad-container" />

      <p>Lives: {lives}</p>
      <button onClick={handleWatchAd} disabled={isLoading}>
        {isLoading ? "Loading ad..." : "Watch Ad for +3 Lives"}
      </button>
    </div>
  );
}
*/
