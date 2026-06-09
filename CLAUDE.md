# AppLixir — AI Integration Context (CLAUDE.md)

> This file is optimized for AI coding assistants (Claude Code, Copilot, Cursor, etc.).
> It contains everything needed to generate correct AppLixir integration code on the first try.

## What AppLixir Is

AppLixir is a **web-first rewarded video ad platform** for HTML5 games and web apps.
Publishers earn $4–15 CPM. Users watch a short video in exchange for an in-game reward.
It is a **browser** SDK. It runs anywhere a browser context exists — including inside
a React Native WebView, with one rule (see React Native below).

Sign up at: https://client.applixir.com/register
Documentation: https://support.applixir.com

---

## Current SDK Version

**v6.1.0** — always load from the CDN:

```html
<script type="text/javascript" src="https://cdn.applixir.com/applixir.app.v6.1.0.js"></script>
```

> ⚠️ DEPRECATED: Do NOT use older patterns like `invokeApplixirVideoUnit()`, `zoneId/devId/gameId`,
> or `applixir.sdk2.1m.js`. These are v2 and no longer current.

---

## Step-by-Step Integration (HTML5 / Vanilla JS)

### Step 1 — Register and get your API key

1. Sign up at https://client.applixir.com/register
2. Add your site/game under "Sites" — choose platform = **Web**
3. Copy your **API Key** (format: `xxxx-xxxx-xxxx-xxxx`)

### Step 2 — Add the anchor div

Place this div where you want the video player to appear (typically a full-screen overlay):

```html
<div id="applixir-ad-container"></div>
```

### Step 3 — Load the SDK script

In your `<head>` or before `</body>`:

```html
<script type="text/javascript" src="https://cdn.applixir.com/applixir.app.v6.1.0.js"></script>
```

### Step 4 — Initialize and show an ad

**Simple approach** — use `initializeAndOpenPlayer()`:

```javascript
const options = {
  apiKey: "xxxx-xxxx-xxxx-xxxx",         // REQUIRED: your API key from the dashboard
  injectionElementId: "applixir-ad-container", // REQUIRED: ID of the div from Step 2

  // REQUIRED: handle ad lifecycle events.
  // status is an OBJECT: { type, ad?, error? }. Always read status.type.
  adStatusCallbackFn: (status) => {
    console.log("Ad status:", status.type);
    if (status.type === "complete") {
      grantReward(); // ✅ User watched the full ad — give the reward
    } else if (status.type === "allAdsCompleted") {
      // End of any ad, or no ad was available — clean up / re-enable the button.
      // NOT a reward signal.
    } else if (status.type === "skipped" || status.type === "manuallyEnded") {
      // User skipped or closed early — do NOT grant reward
    }
  },

  adErrorCallbackFn: (error) => {         // OPTIONAL but recommended
    console.error("Ad error:", error.getError().data);
  },
};

// Trigger on user action (button click, level complete, etc.)
document.getElementById("watch-ad-btn").addEventListener("click", () => {
  initializeAndOpenPlayer(options);
});
```

**Faster reveal** — use `preloadAd()` to cut click-to-reveal from ~1.5–3.5s to ~100–300ms (see "Faster Ad Loading" below).

**Advanced approach** — use the `Application` class for more lifecycle control:

```javascript
const options = {
  apiKey: "xxxx-xxxx-xxxx-xxxx",
  injectionElementId: "applixir-ad-container",
  adStatusCallbackFn: (status) => { /* same as above — read status.type */ },
  adErrorCallbackFn: (error) => { /* same as above */ },
};

const app = new Application(options);

// IMPORTANT: Must initialize after window.onload — DOM must be ready
window.onload = () => {
  app.initialize();
  // Now safe to call app.openPlayer() on user action
};

document.getElementById("watch-ad-btn").addEventListener("click", () => {
  app.openPlayer();
});
```

---

## Faster Ad Loading — `preloadAd()` (optional, fast reveal)

`initializeAndOpenPlayer()` runs the ad auction, requests the video, and buffers the
creative **after** the click — so the user waits ~1.5–3.5s on a spinner. `preloadAd()`
splits that work: it runs the auction + video request **ahead of the click** (on a
high-intent signal), and the click only reveals an already-loaded ad in ~100–300ms.
It is a third `window` global and takes the **same options object** as
`initializeAndOpenPlayer()`.

```javascript
let adHandle = null;

// 1. Preload on a HIGH-INTENT signal (reward modal mount, level complete,
//    "out of coins" overlay) — NOT on page load. preloadAd() is async and
//    returns a handle { show }.
async function loadAd() {
  try {
    adHandle = await preloadAd(options);   // runs auction + video request now
  } catch (e) {
    adHandle = null;                        // no-fill / network error — fall back on click
  }
}

// 2. On click, just reveal. Call show() inside the click handler so the
//    user-gesture chain is preserved (required on iOS/Safari).
document.getElementById("watch-ad-btn").addEventListener("click", async () => {
  if (adHandle) {
    await adHandle.show();                   // ~100–300ms
    adHandle = null;                         // each handle is single-use
    loadAd();                                // preload the next one
  } else {
    initializeAndOpenPlayer(options);        // fallback: standard (slower) path
  }
});
```

**Rules:**
1. **Preload on intent, not on page load** — page-load preload wastes ad requests on visitors who never click.
2. **Always keep an on-click fallback** — ~10–30% of preloads no-fill, and Incognito / blocked 3rd-party cookies can fail silently. Never call `show()` on a failed/absent handle; fall through to `initializeAndOpenPlayer()`.
3. **Re-preload after each show** — each handle is single-use.
4. **Bids expire (~5 min)** — if the gap between `preloadAd()` and `show()` may exceed that, refresh on a timer or re-preload on the next intent signal.

**Always-visible "Watch Ad" button** (no single intent moment — the button is the intent):
keep an ad loaded with `preloadAd()` when it first renders, refresh every ~4 min, and
refresh on `visibilitychange → visible` (skip refreshes while the tab is backgrounded —
Chrome throttles network and bids arrive stale). Full pattern:
https://support.applixir.com/applixir-integration/integration-for-html5-sites-apps/advanced-faster-ad-loading-preload

---

## `adStatusCallbackFn` — the status is an OBJECT, not a string

The callback receives an **object** `{ type, ad?, error? }`. Always read
`status.type`. Comparing `status` to a string (e.g. `status === "ad-watched"`)
is **wrong** and will never match — that was an older API and is not how the SDK
behaves.

| `status.type` | Meaning | Grant Reward? |
|---|---|---|
| `"loaded"` | Ad data is available | — |
| `"started"` | Ad playback began | — |
| `"firstQuartile"` / `"midpoint"` / `"thirdQuartile"` | Playback progress (25/50/75%) | — |
| `"complete"` | User watched the full video | ✅ YES |
| `"allAdsCompleted"` | Fires at the end of **any** ad AND when **no ad** was available | ❌ NO (clean up) |
| `"click"` | The ad was clicked | — |
| `"paused"` | The ad is paused | — |
| `"skipped"` | User skipped the ad | ❌ NO |
| `"manuallyEnded"` | User closed the ad early | ❌ NO |
| `"consentDeclined"` | User declined consent for personalized ads | ❌ NO |

> ⚠️ Only grant in-game rewards when `status.type === "complete"`. `allAdsCompleted`
> fires at the end of every ad and also when there was no ad to show, so it is NOT
> a reward signal.

---

## `adErrorCallbackFn` — Error Handling

```javascript
adErrorCallbackFn: (error) => {
  const errorData = error.getError().data; // { type, errorCode, errorMessage, ... }
  console.error("AppLixir error:", errorData);
  // Gracefully show user a message — don't crash the game
}
```

---

## Full Working Example (Vanilla JS)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My Game</title>
  <script type="text/javascript" src="https://cdn.applixir.com/applixir.app.v6.1.0.js"></script>
</head>
<body>
  <div id="applixir-ad-container"></div>

  <button id="watch-ad-btn">Watch Ad for +3 Lives</button>
  <div id="reward-message" style="display:none">🎉 Reward granted!</div>

  <script>
    const options = {
      apiKey: "YOUR-API-KEY-HERE",
      injectionElementId: "applixir-ad-container",

      adStatusCallbackFn: (status) => {
        if (status.type === "complete") {
          document.getElementById("reward-message").style.display = "block";
          // TODO: Add your reward logic here
        } else if (status.type === "allAdsCompleted") {
          // ad finished or none available — nothing to reward here
        }
      },

      adErrorCallbackFn: (error) => {
        console.error("Ad error:", error.getError().data);
      },
    };

    document.getElementById("watch-ad-btn").addEventListener("click", () => {
      initializeAndOpenPlayer(options);
    });
  </script>
</body>
</html>
```

---

## ads.txt — Required for Revenue

Add these lines to your domain's `/ads.txt` file (e.g. `https://yourdomain.com/ads.txt`).
Without this, fill rates and CPMs will be significantly lower.

Get your current ads.txt entries from the AppLixir dashboard → Settings → Ads.txt.

---

## Server-Side Reward Callback (Optional but Recommended)

For fraud-proof reward delivery, AppLixir can POST to your server when a reward is earned.

Configure in: AppLixir Dashboard → Callbacks → enter your endpoint URL + secret.

AppLixir sends a signed HTTPS POST to your server after each verified ad completion.
This is the source of truth for granting persistent rewards; treat the client-side
`status.type === "complete"` as optimistic UI only.

---

## Platform-Specific Notes

### React (web)
Create a `useRewardedAd` hook — see `/examples/react/` in this repo (JS + TS + a
component). Load the SDK script via the hook or add it to `public/index.html`.
The callback still receives the status **object**; reward on `status.type === "complete"`.
For Vite / Next.js / CRA specifics: https://support.applixir.com/applixir-integration/react-integration/

### React Native (read this — it's where integrations fail)
There is no native module. Run the HTML5 SDK inside `react-native-webview`.
The WebView **must load a real `https://` URL** on your registered domain via
`source={{ uri }}`. **Never** use `source={{ html: ... }}` or a `file://` URL: that
gives the page origin `"null"`, which breaks the consent `postMessage` handshake
(`Invalid target origin 'null'`) and makes the ad server return `AdError 303: No Ads`
because it cannot match your registered domain. Host an ad page (loads the SDK +
a `postMessage` bridge) on your domain and point the WebView at it.
See `/examples/react-native/` and
https://support.applixir.com/applixir-integration/react-integration/step-4-react-native

### Phaser 3
Call `initializeAndOpenPlayer(options)` inside a Phaser Scene's button handler.
Ensure the div `#applixir-ad-container` exists in your HTML, outside the Phaser canvas.
See `/examples/phaser3/`.

### Unity WebGL
Use the Unity package from AppLixir — see `/examples/unity-webgl/` in this repo.
Call `ApplixirWebGL.PlayVideo(callback)`. The only positive result is `PlayVideoResult.ADWatched`.

### WordPress
Install the AppLixir WordPress plugin — no manual code required.
Available in the WordPress plugin directory or via support.applixir.com.

---

## Common Mistakes

1. **Treating `status` as a string** — it's an object. Use `status.type === "complete"`, never `status === "ad-watched"`.
2. **Granting rewards on `allAdsCompleted`** — it fires for skipped, completed, AND no-ad. Only `complete` means watched.
3. **Calling `initializeAndOpenPlayer` before the SDK loads** — wait for `window.onload` (or the React hook's `ready` flag).
4. **Missing `ads.txt`** — significantly reduces fill rates. Add it to your domain root.
5. **Using the v2 SDK** — `invokeApplixirVideoUnit` / `zoneId` / `devId` / `gameId` are deprecated. Use v6.1.0 with `apiKey`.
6. **Triggering ads without user interaction** — browsers block autoplay. Must be triggered by a click or tap.
7. **Testing on localhost with a real API key** — register your site URL in the dashboard. Localhost won't match.
8. **React Native with `source={{ html }}` / `file://`** — origin `"null"` → no consent and `AdError 303`. Load a real https URL.

---

## Testing

1. Register your site URL in the AppLixir dashboard (exact domain match required)
2. Deploy to that domain (not localhost)
3. Open browser DevTools → Console
4. Click your ad trigger button
5. You should see the lifecycle in order: `loaded` → `started` → `firstQuartile` → `midpoint` → `thirdQuartile` → `complete`

No test/sandbox API key is required — use your real API key from the start.

---

## Support

- Documentation: https://support.applixir.com
- Email: support@applixir.com
- Sign up: https://client.applixir.com/register
