# AppLixir — React Native integration prompt

Paste everything in the code block below into your coding agent (Claude Code, Codex,
Cursor, Copilot) at the root of your React Native repo. Fill in the two placeholders.

````text
You are integrating AppLixir rewarded video ads into this React Native app. AppLixir
is a browser-based rewarded-video SDK; in React Native it runs inside a WebView.

## Context you must respect (this is where most integrations fail)
AppLixir's SDK needs a real web origin. If the WebView loads inline HTML
(source={{ html: ... }}) or a local/file URL, the page origin becomes "null",
which (1) breaks the TCF consent handshake — you'll see
"postMessage ... Invalid target origin 'null'" — and (2) stops the ad server from
matching the request to the registered domain, returning "AdError 303: No Ads".
=> The WebView MUST load a real https:// URL on the domain registered with AppLixir.

## What to build
1. A small hosted ad page served from our registered https domain
   (<YOUR_HTTPS_DOMAIN>/rewarded). It loads the SDK and bridges events to native.
2. A React Native screen/component that shows that page in a WebView and grants
   the reward when the user finishes the ad.

## Inputs (fill these in)
- AppLixir API key: <YOUR_API_KEY>
- Registered https domain: <YOUR_HTTPS_DOMAIN>   (must serve our ads.txt)
- SDK version to pin: 6.1.0

## Steps
1. Inspect the repo: confirm react-native-webview is installed (add it if not),
   find where rewarded ads should be triggered, and how rewards are currently granted.
2. Create the hosted page (commit it to wherever this app's web assets are served,
   or tell me where to deploy it). It must:
   - load https://cdn.applixir.com/applixir.app.v6.1.0.js
   - have a <div id="applixir-ad-container"></div> anchor
   - on a user tap, call initializeAndOpenPlayer({ apiKey, injectionElementId,
     adStatusCallbackFn, adErrorCallbackFn })
   - adStatusCallbackFn receives a STATUS OBJECT { type, ad?, error? }. When
     status.type === "complete", post { type: "reward" } via
     window.ReactNativeWebView.postMessage(...); on "skipped"/"manuallyEnded"/
     "allAdsCompleted" post { type: "closed" }; in adErrorCallbackFn post
     { type: "error", data: error.getError().data }.
3. Create the RN component using react-native-webview with:
   - source={{ uri: "https://<YOUR_HTTPS_DOMAIN>/rewarded" }}   // NEVER source={{ html }}
   - javaScriptEnabled, domStorageEnabled, thirdPartyCookiesEnabled (Android),
     sharedCookiesEnabled (iOS), allowsInlineMediaPlayback,
     mediaPlaybackRequiresUserAction={false}, originWhitelist={["https://*"]},
     mixedContentMode="always"
   - an onMessage handler that parses the JSON and calls the app's reward function
     on { type: "reward" }.
4. Wire it into the existing reward flow. Trigger the ad from a real user tap.

## Hard rules
- adStatusCallbackFn receives an OBJECT. Read status.type. NEVER compare status to a
  string like "ad-watched" — that is an old API and will never match.
- Grant the reward ONLY on status.type === "complete". "allAdsCompleted" fires at the
  end of any ad AND when no ad was available, so it is not a reward signal.
- Do NOT use source={{ html }} or any file:// / local URL for the WebView.
- Do NOT auto-play the ad on mount — it must be user-initiated.
- Treat the "reward" message as OPTIMISTIC UI only. The source of truth for granting
  persistent rewards is AppLixir's server-side web callback — if this app has a
  backend, note where that should be verified; don't grant currency purely client-side.
- Pin the SDK to v6.1.0; don't npm-install an AppLixir package (there isn't one).

## Acceptance criteria
- Tapping the trigger opens the ad; the console shows
  loaded -> started -> firstQuartile -> midpoint -> thirdQuartile -> complete.
- NO "Invalid target origin 'null'" and NO "AdError 303" in the console.
- The reward is granted exactly once on "complete".

Reference (read if unsure):
https://support.applixir.com/applixir-integration/react-integration/step-4-react-native
Working example: https://github.com/applixirinc/applixir-integration/tree/main/examples/react-native

Start by inspecting the repo and proposing a short plan before writing code.
````
