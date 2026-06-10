# AppLixir — React (web) integration prompt

Paste everything in the code block below into your coding agent (Claude Code, Codex,
Cursor, Copilot) at the root of your React web repo. Fill in the one placeholder.

````text
You are integrating AppLixir rewarded video ads into this React (web) app. AppLixir
is a browser-based rewarded-video SDK loaded from a single CDN script — there is no
npm package.

## What to build
1. A useRewardedAd hook that loads the SDK once, exposes a `ready` flag, and returns
   a showAd() promise that resolves true only when the user watched the ad through.
2. Wire it into the existing place a rewarded ad should be offered, and grant the
   reward when showAd() resolves true.

## Inputs (fill these in)
- AppLixir API key: <YOUR_API_KEY>
- SDK version to pin: 6.1.0
- The SDK script: https://cdn.applixir.com/applixir.app.v6.1.0.js

## Steps
1. Inspect the repo: detect the framework (Vite / Next.js / CRA), where the API key /
   env vars live (VITE_*, NEXT_PUBLIC_*, REACT_APP_*), and where rewarded ads should
   trigger and how rewards are currently granted.
2. Load the SDK once — either add the <script> to index.html / public/index.html (or
   next/script in a client component), or inject it in the hook via a useEffect that
   checks window.initializeAndOpenPlayer / an existing <script> first (Strict Mode
   double-invokes effects).
3. Implement useRewardedAd(apiKey, containerId = "applixir-ad-container"):
   - call window.initializeAndOpenPlayer({ apiKey, injectionElementId, adStatusCallbackFn,
     adErrorCallbackFn }) inside showAd().
   - adStatusCallbackFn receives a STATUS OBJECT { type, ad?, error? }. Resolve the
     showAd() promise true on status.type === "complete"; resolve false on "skipped",
     "manuallyEnded", "allAdsCompleted", "consentDeclined", or any error. Use a ref so
     the promise resolves exactly once (complete fires before allAdsCompleted).
4. Render the anchor <div id="applixir-ad-container" /> once and keep it mounted.
   Trigger showAd() from a user click; await it and grant the reward when it's true.

## Faster reveal (recommended for production)
window.preloadAd(options) runs the auction + video request AHEAD of the click and returns a
handle { show } — reveal in ~100-300ms instead of ~1.5-3.5s. In the hook, expose a preload()
(call it on a high-intent signal: reward modal mount, level-complete) and have showAd() call
the preloaded handle's show() when one exists, else fall back to initializeAndOpenPlayer().
Re-preload after each show (handles are single-use), refresh if the preload->click gap may
exceed ~5 min (bids expire), and ALWAYS keep the on-click fallback (some preloads no-fill;
Incognito / blocked 3rd-party cookies can fail silently). Call show() inside the user gesture.

## Hard rules
- adStatusCallbackFn receives an OBJECT. Read status.type. NEVER compare status to a
  string like "ad-watched" — that is an old API and will never match.
- Grant the reward ONLY on status.type === "complete". "allAdsCompleted" fires at the
  end of any ad AND when no ad was available, so it is not a reward signal.
- The ad must be triggered by a user gesture (click) — no autoplay.
- Next.js / SSR: the SDK is browser-only. Only call showAd() from a client component;
  guard with typeof window !== "undefined".
- Treat showAd() === true as OPTIMISTIC UI. The source of truth for persistent rewards
  is AppLixir's server-side web callback — if this app has a backend, note where that
  should be verified.
- Pin the SDK to v6.1.0; do not npm-install an AppLixir package (there isn't one).

## Acceptance criteria
- Clicking the trigger opens the ad; the console shows
  loaded -> started -> firstQuartile -> midpoint -> thirdQuartile -> complete.
- showAd() resolves true exactly once, only on a real completion.
- No duplicate <script> tags injected (verify in the DOM / Network tab).

Reference (read if unsure):
https://support.applixir.com/applixir-integration/react-integration/
Working example: https://github.com/applixirinc/applixir-integration/tree/main/examples/react

Start by inspecting the repo and proposing a short plan before writing code.
````
