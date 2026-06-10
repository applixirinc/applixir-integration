# AppLixir — HTML5 / Vanilla JS integration prompt

Paste everything in the code block below into your coding agent (Claude Code, Codex,
Cursor, Copilot) at the root of your web game / site repo. Fill in the one placeholder.

````text
You are integrating AppLixir rewarded video ads into this HTML5 / vanilla-JS game or
site. AppLixir is a browser-based rewarded-video SDK loaded from a single CDN script —
no npm package, no build step.

## What to build
A rewarded-ad trigger: load the SDK, add the player anchor, and on a user action open
the player and grant the reward when the ad completes.

## Inputs (fill these in)
- AppLixir API key: <YOUR_API_KEY>
- SDK version to pin: 6.1.0
- The SDK script: https://cdn.applixir.com/applixir.app.v6.1.0.js

## Steps
1. Inspect the repo: find the main HTML entry point and where a rewarded ad should be
   offered (a button, level-complete, out-of-lives, etc.) and how rewards are granted.
2. Add the SDK script to <head>:
   <script type="text/javascript" src="https://cdn.applixir.com/applixir.app.v6.1.0.js"></script>
3. Add the player anchor where the overlay should appear:
   <div id="applixir-ad-container"></div>
4. On a user action, call:
   initializeAndOpenPlayer({
     apiKey: "<YOUR_API_KEY>",
     injectionElementId: "applixir-ad-container",
     adStatusCallbackFn: (status) => {
       if (status.type === "complete") { /* grant reward (optimistic) */ }
       else if (status.type === "allAdsCompleted") { /* clean up / re-enable UI */ }
     },
     adErrorCallbackFn: (error) => { console.error(error.getError().data); },
   });

5. RECOMMENDED for production — preload so the click reveals an already-loaded ad
   (~100-300ms instead of ~1.5-3.5s). preloadAd() takes the SAME options object and
   returns a handle { show }. Trigger it on a high-intent signal (reward modal mount,
   level-complete, out-of-lives) — NOT on page load — and keep the on-click fallback:
     let adHandle = null;
     async function loadAd() {
       try { adHandle = await preloadAd(options); }  // runs the auction + video request now
       catch (e) { adHandle = null; }                // no-fill/error -> fall back on click
     }
     // inside the user-gesture (click/tap) handler:
     if (adHandle) { await adHandle.show(); adHandle = null; loadAd(); }  // reveal + re-preload
     else initializeAndOpenPlayer(options);          // fallback when no preload is ready

## Hard rules
- Prefer preloadAd() for production (Step 5). Each handle is single-use — re-preload after
  show(); bids expire ~5 min so refresh if the preload->click gap is long; ALWAYS keep the
  initializeAndOpenPlayer on-click fallback (some preloads no-fill, and Incognito / blocked
  3rd-party cookies can fail silently). Call show() INSIDE the click handler to preserve the
  iOS/Safari user-gesture chain.
- adStatusCallbackFn receives a STATUS OBJECT { type, ad?, error? }. Read status.type.
  NEVER compare status to a string like "ad-watched" — that is an old API and never matches.
- Grant the reward ONLY on status.type === "complete". "allAdsCompleted" fires at the
  end of any ad AND when no ad was available, so it is not a reward signal.
- The ad must be triggered by a user gesture (click/tap) — browsers block autoplay.
- Call initializeAndOpenPlayer only after the SDK script has loaded.
- Treat client-side "complete" as OPTIMISTIC UI. The source of truth for persistent
  rewards is AppLixir's server-side web callback — if there's a backend, note where to verify.
- Pin the SDK to v6.1.0. Do NOT use deprecated v2 patterns (invokeApplixirVideoUnit,
  zoneId/devId/gameId).

## Acceptance criteria
- Clicking the trigger opens the ad; the console shows
  loaded -> started -> firstQuartile -> midpoint -> thirdQuartile -> complete.
- The reward fires only on "complete", and the page registered domain matches the one
  configured in the AppLixir dashboard (not localhost).

Reference (read if unsure):
https://support.applixir.com
Working example: https://github.com/applixirinc/applixir-integration/tree/main/examples/html5

Start by inspecting the repo and proposing a short plan before writing code.
````
