// GameScreen.jsx
// Example component using the useRewardedAd hook.

import React, { useState } from "react";
import { useRewardedAd } from "./useRewardedAd";

export function GameScreen() {
  const [lives, setLives] = useState(3);
  const { ready, showAd } = useRewardedAd("YOUR-API-KEY-HERE");

  const handleWatchAd = async () => {
    const watched = await showAd();
    if (watched) {
      // Optimistic UI. The persistent reward should be granted by your
      // server-side web callback (configure it in client.applixir.com).
      setLives((l) => l + 3);
    }
  };

  return (
    <div>
      {/* The player injects itself here. Keep this div mounted. */}
      <div id="applixir-ad-container" />

      <p>Lives: {lives}</p>
      <button onClick={handleWatchAd} disabled={!ready}>
        {ready ? "Watch Ad for +3 Lives" : "Loading…"}
      </button>
    </div>
  );
}
