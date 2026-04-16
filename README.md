# AppLixir Integration

Official integration examples and reference for [AppLixir](https://www.applixir.com) — the web-first rewarded video ad platform for HTML5 games and web apps.

**$4–15 CPM. One script tag. No backend changes required.**

---

## Quick Start (Under 15 Minutes)

### 1. Sign up and get your API key
→ https://client.applixir.com/register

### 2. Add to your HTML

```html
<!-- 1. Load the SDK -->
<script type="text/javascript" src="https://cdn.applixir.com/applixir.app.v6.0.1.js"></script>

<!-- 2. Add the player container -->
<div id="applixir-ad-container"></div>

<!-- 3. Show an ad on user action -->
<script>
const options = {
  apiKey: "YOUR-API-KEY-HERE",
  injectionElementId: "applixir-ad-container",
  adStatusCallbackFn: (status) => {
    if (status === "ad-watched") {
      grantReward(); // Give the user their reward
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
| Vanilla JS | `/examples/html5-basic/` | Minimal working example |
| Vanilla JS | `/examples/html5-with-rewards/` | Full reward + error handling |
| Phaser 3 | `/examples/phaser3/` | Integration inside a Phaser Scene |
| React | `/examples/react/` | `useRewardedAd` hook |
| Unity WebGL | `/examples/unity-webgl/` | Unity package + jslib bridge |

---

## Key Concepts

**adStatusCallbackFn statuses:**

| Status | Meaning | Grant Reward? |
|---|---|---|
| `ad-watched` | Full video completed | ✅ Yes |
| `ad-skipped` | User skipped | ❌ No |
| `no-ad` | No fill right now | ❌ No |
| `ad-started` | Playback began | — |
| `ad-loading` | Fetching ad | — |
| `ad-error` | Playback error | ❌ No |

**Only grant rewards on `"ad-watched"`.**

---

## AI Coding Assistant

If you're using Claude Code, GitHub Copilot, Cursor, or another AI tool:
the `CLAUDE.md` file in this repo root contains a complete, AI-optimized reference.
Your AI assistant will use it automatically to generate correct integration code.

---

## Requirements

- Any modern browser (Chrome, Firefox, Safari, Edge)
- Works with: HTML5, Phaser, PixiJS, Unity WebGL, Cocos, React, Vue, vanilla JS
- No backend changes required for basic integration
- `ads.txt` required for full fill rates (add entries from your AppLixir dashboard)

---

## Links

- **Sign up:** https://client.applixir.com/register
- **Dashboard:** https://client.applixir.com
- **Full docs:** https://support.applixir.com
- **Website:** https://www.applixir.com
- **Support:** support@applixir.com
