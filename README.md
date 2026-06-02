# AppLixir Integration

Official integration examples and reference for [AppLixir](https://www.applixir.com) — the web-first rewarded video ad platform for HTML5 games and web apps.

**$4–15 CPM. One script tag. No backend changes required.**

---

## Choose your platform

Each folder below is a **self-contained guide** with its own README, setup steps,
and ready-to-copy code. Jump to yours:

| Platform | Guide | What's inside |
|---|---|---|
| **HTML5 / Vanilla JS** | [`examples/html5/`](examples/html5/) | The base integration — one script tag |
| **React (web)** | [`examples/react/`](examples/react/) | `useRewardedAd` hook (JS + TS) + component |
| **React Native** | [`examples/react-native/`](examples/react-native/) | WebView integration (hosted page + RN screen) |
| **Phaser 3** | [`examples/phaser3/`](examples/phaser3/) | Trigger from a Phaser Scene |
| **Unity WebGL** | [`examples/unity-webgl/`](examples/unity-webgl/) | C# manager + jslib bridge |

All platforms use the **same SDK and the same callback contract** — they differ
only in how you load the script and wire the trigger. The shared rules
([Key Concepts](#key-concepts)) apply everywhere.

---

## The core pattern (same in every framework)

### 1. Sign up and get your API key
→ https://client.applixir.com/register

### 2. Load the SDK and show an ad

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

That's it — and it's the same callback contract in React, Unity, and the rest.
Pick your platform above for framework-specific setup. [Full documentation →](https://support.applixir.com)

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

If you're using Claude Code, Codex, GitHub Copilot, Cursor, or another AI tool:

- **Ready-made prompts** — copy a [`prompts/`](prompts/) file for your platform
  ([HTML5](prompts/html5.md) · [React](prompts/react.md) · [React Native](prompts/react-native.md) · [Phaser](prompts/phaser.md) · [Unity](prompts/unity.md)),
  paste it into your agent, fill in your API key, and it implements the integration.
- **Full reference** — [`CLAUDE.md`](CLAUDE.md) and [`llms.txt`](llms.txt) in this repo
  root give your agent the complete, AI-optimized API so it generates correct code.

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
