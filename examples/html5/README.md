# HTML5 / Vanilla JS — AppLixir rewarded video

The base integration — one script tag, no build step, no dependencies. Every other
platform here is a thin wrapper around this same SDK.

| File | What it is |
|---|---|
| `index.html` | A complete, working page: load SDK → anchor div → show ad on click |

## Setup

1. Load the SDK in your `<head>`:
   ```html
   <script type="text/javascript" src="https://cdn.applixir.com/applixir.app.v6.1.0.js"></script>
   ```
2. Add the anchor the player injects into:
   ```html
   <div id="applixir-ad-container"></div>
   ```
3. Open the player on a user action:
   ```html
   <script>
   document.getElementById("watch-ad-btn").addEventListener("click", () => {
     initializeAndOpenPlayer({
       apiKey: "YOUR-API-KEY-HERE",
       injectionElementId: "applixir-ad-container",
       adStatusCallbackFn: (status) => {
         if (status.type === "complete") grantReward(); // watched through
       },
       adErrorCallbackFn: (error) => console.error(error.getError().data),
     });
   });
   </script>
   ```

`adStatusCallbackFn` receives a status **object** (`{ type, ad?, error? }`); grant
the reward only on `status.type === "complete"`. See the
[status reference and reward rules](../../README.md#key-concepts) in the repo root.

## Faster reveal — `preloadAd()` (optional)

`initializeAndOpenPlayer()` runs the auction and loads the video **after** the click, so
the user waits ~1.5–3.5s. `preloadAd()` does that work **ahead of the click** (on a
high-intent signal) and the click only reveals it, in ~100–300ms. Same options object;
returns a handle `{ show }`.

```js
let adHandle = null;

// Preload on intent (reward modal mount, level complete) — NOT on page load.
async function loadAd() {
  try { adHandle = await preloadAd(options); }  // runs auction + video request now
  catch (e) { adHandle = null; }                // no-fill / error — fall back on click
}

watchBtn.addEventListener("click", async () => {
  if (adHandle) { await adHandle.show(); adHandle = null; loadAd(); } // reveal, then re-preload
  else initializeAndOpenPlayer(options);        // fallback when preload missing/failed
});
```

Keep the on-click fallback (some preloads no-fill; Incognito can fail silently), re-preload
after each `show()` (handles are single-use), and refresh if the preload→click gap may
exceed ~5 min (bids expire). Full guide incl. the always-visible-button pattern:
https://support.applixir.com/applixir-integration/integration-for-html5-sites-apps/advanced-faster-ad-loading-preload

**Using an AI agent?** Copy [`prompts/html5.md`](../../prompts/html5.md) into Claude
Code / Codex / Cursor and it implements this for you.

Full docs: https://support.applixir.com
