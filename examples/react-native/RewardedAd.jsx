// RewardedAd.jsx
// React Native rewarded video via react-native-webview.
//
// IMPORTANT: the WebView MUST load a real https:// URL on the domain you
// registered with AppLixir — NOT inline HTML (source={{ html }}) and NOT a
// file:// URL. An inline/local source gives the page the origin "null", which
// breaks the consent handshake (postMessage "Invalid target origin 'null'") and
// makes the ad server return "AdError 303: No Ads" because it can't match your
// registered domain. Host rewarded.html (in this folder) on your domain and
// point the WebView at it.

import React from "react";
import { WebView } from "react-native-webview";

export function RewardedAd({ onReward, onClosed }) {
  return (
    <WebView
      // ✅ A real https origin — consent and demand both work.
      source={{ uri: "https://YOUR-DOMAIN.com/rewarded" }}
      // ❌ Never: source={{ html: "<html>…</html>" }}  → origin "null" → no fill.

      javaScriptEnabled
      domStorageEnabled
      thirdPartyCookiesEnabled            // Android: needed for consent + ad serving
      sharedCookiesEnabled                // iOS: share the app cookie store
      allowsInlineMediaPlayback           // iOS: play the video inline
      mediaPlaybackRequiresUserAction={false}
      originWhitelist={["https://*"]}
      mixedContentMode="always"           // Android
      onMessage={(event) => {
        let msg;
        try { msg = JSON.parse(event.nativeEvent.data); } catch { return; }
        if (msg.type === "reward") onReward?.();          // optimistic UI
        else if (msg.type === "closed") onClosed?.(msg.reason);
        else if (msg.type === "error") console.warn("AppLixir error:", msg.data);
      }}
    />
  );
}
