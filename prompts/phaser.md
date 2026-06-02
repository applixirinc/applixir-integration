# AppLixir — Phaser 3 integration prompt

Paste everything in the code block below into your coding agent (Claude Code, Codex,
Cursor, Copilot) at the root of your Phaser game repo. Fill in the one placeholder.

````text
You are integrating AppLixir rewarded video ads into this Phaser 3 game. AppLixir is a
browser-based rewarded-video SDK loaded from a single CDN script — no npm package. It
renders as a full-screen DOM overlay above the Phaser canvas, so there is no special
Phaser plugin; you trigger it from a Scene and pause/resume the game around it.

## What to build
A rewarded-ad trigger inside a Phaser Scene: pause the scene, open the AppLixir player
on a user tap, grant the reward on completion, then resume the scene.

## Inputs (fill these in)
- AppLixir API key: <YOUR_API_KEY>
- SDK version to pin: 6.1.0
- The SDK script: https://cdn.applixir.com/applixir.app.v6.1.0.js

## Steps
1. Inspect the repo: find the HTML entry point and the Scene(s) where a rewarded ad
   should be offered (out-of-lives, level-complete, a shop button) and how rewards are
   currently granted.
2. In the HTML, BEFORE the Phaser bundle, add the SDK and the anchor div (the anchor
   must live in the DOM, OUTSIDE the Phaser canvas):
   <script src="https://cdn.applixir.com/applixir.app.v6.1.0.js"></script>
   <div id="applixir-ad-container" style="position:absolute;top:0;left:0;width:100%;height:100%;z-index:9999;display:none;"></div>
3. In the Scene, on a button's "pointerdown", show the container, pause the scene, and
   call initializeAndOpenPlayer({ apiKey, injectionElementId, adStatusCallbackFn, adErrorCallbackFn }):
   - adStatusCallbackFn receives a STATUS OBJECT { type, ad?, error? }. On
     status.type === "complete", grant the reward; on "allAdsCompleted" (also fires when
     no ad was available), hide the container and resume the scene; on "skipped" /
     "manuallyEnded", hide + resume without a reward.
   - adErrorCallbackFn: log error.getError().data, hide the container, resume the scene.

## Hard rules
- adStatusCallbackFn receives an OBJECT. Read status.type. NEVER compare status to a
  string like "ad-watched" — that is an old API and will never match.
- Grant the reward ONLY on status.type === "complete". "allAdsCompleted" fires at the
  end of any ad AND when no ad was available, so it is not a reward signal.
- Trigger from a user gesture (pointerdown/tap) — browsers block autoplay.
- Pause the scene (this.scene.pause()) before the ad and resume it after, so the game
  loop doesn't run behind the overlay; always resume on every terminal path.
- Keep the anchor div OUTSIDE the Phaser canvas, and toggle its display rather than
  removing it from the DOM.
- Treat client-side "complete" as OPTIMISTIC UI. The source of truth for persistent
  rewards is AppLixir's server-side web callback.
- Pin the SDK to v6.1.0; don't npm-install an AppLixir package (there isn't one).

## Acceptance criteria
- Tapping the in-game button pauses the scene and opens the ad; the console shows
  loaded -> started -> firstQuartile -> midpoint -> thirdQuartile -> complete.
- The reward fires only on "complete", and the scene resumes on every path (complete,
  no-ad, skip, error).

Reference (read if unsure):
https://support.applixir.com
Working example: https://github.com/applixirinc/applixir-integration/tree/main/examples/phaser3

Start by inspecting the repo and proposing a short plan before writing code.
````
