# AppLixir Integration

Official integration examples and reference for [AppLixir](https://www.applixir.com) — the web-first rewarded video ad platform for HTML5 games and web apps.

**$4–15 CPM. One script tag. No backend changes required.**

---

## Quick Start (Under 15 Minutes)

### 1. Sign up and get your API key
→ https://client.applixir.com/register

### 2. Add to your HTML

```html
<!-- 1. Load the SDK (pin to a specific version for production) -->
<script type="text/javascript" src="https://cdn.applixir.com/applixir.app.v6.1.0.js"></script>

<!-- 2. Add the player container -->
<div id="applixir-ad-container"></div>

<!-- 3. Show an ad on user action -->
<script>
const options = {
  apiKey: "YOUR-API-KEY-HERE",
  injectionElementId: "applixir-ad-container",
  // adStatusCallbackFn receives a STATUS OBJECT: { type, ad?, error? }
  adStatusCallbackFn: (status) => {
    if (status.type === "complete") {
      grantReward(); // user watched it through — grant the reward
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
```

That's it. [Full documentation →](https://support.applixir.com)

---

## Examples in This Repo

| Platform | Location | Description |
|---|---|---|
| Vanilla JS | [`/examples/html5/`](examples/html5/) | Minimal working example with reward + error handling |
| Phaser 3 | [`/examples/phaser3/`](examples/phaser3/) | Integration inside a Phaser Scene |
| React (web) | [`/examples/react/`](examples/react/) | `useRewardedAd` hook (JS + TS) + component |
| React Native | [`/examples/react-native/`](examples/react-native/) | WebView integration (hosted page + RN screen) |
| Unity WebGL | [`/examples/unity-webgl/`](examples/unity-webgl/) | Unity manager + jslib bridge |

---

## Key Concepts

`adStatusCallbackFn` receives a **status object** — `{ type, ad?, error? }` — on
every ad lifecycle event. `type` is one of:

```
"loaded" | "started" | "firstQuartile" | "midpoint" | "thirdQuartile"
| "complete" | "allAdsCompleted" | "click" | "paused" | "skipped"
| "manuallyEnded" | "consentDeclined"
```

| `status.type` | Meaning | Grant Reward? |
|---|---|---|
| `complete` | User watched the full video | ✅ Yes |
| `skipped` | User skipped | ❌ No |
| `manuallyEnded` | User closed the ad early | ❌ No |
| `allAdsCompleted` | Ad finished **or** no ad was available | ❌ No (use to clean up) |
| `loaded` / `started` / quartiles | Playback progress | — |
| `consentDeclined` | User declined personalized-ads consent | ❌ No |

**Grant rewards only on `status.type === "complete"`.** `allAdsCompleted` fires
at the end of *any* ad and when there was no ad to show, so it is not a reward
signal. For fraud-proof rewards, use the server-side web callback as the source
of truth (see [full docs](https://support.applixir.com)).

---

## AI Coding Assistant

If you're using Claude Code, GitHub Copilot, Cursor, or another AI tool:
the [`CLAUDE.md`](CLAUDE.md) and [`llms.txt`](llms.txt) files in this repo root
contain a complete, AI-optimized reference. Your AI assistant will use them to
generate correct integration code.

---

## Requirements

- Any modern browser (Chrome, Firefox, Safari, Edge)
- Works with: HTML5, Phaser, PixiJS, Unity WebGL, Cocos, React, Vue, vanilla JS
- React Native: supported via a WebView pointed at a real `https://` URL (see [`/examples/react-native/`](examples/react-native/))
- No backend changes required for basic integration
- `ads.txt` required for full fill rates (add entries from your AppLixir dashboard)

---

## Links

- **Sign up:** https://client.applixir.com/register
- **Dashboard:** https://client.applixir.com
- **Full docs:** https://support.applixir.com
- **Website:** https://www.applixir.com
- **Support:** support@applixir.com
