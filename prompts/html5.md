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

## Hard rules
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
