# React Native — AppLixir rewarded video

There is no native AppLixir module for React Native. You run the HTML5 SDK inside
a WebView (`react-native-webview`).

| File | What it is |
|---|---|
| `rewarded.html` | The ad page you host on your registered https domain |
| `RewardedAd.jsx` | The React Native WebView component |

## ⚠️ The one rule: load a real `https://` URL

The single most common reason ads don't fill in React Native is loading the SDK
from inline HTML (`source={{ html: ... }}`) or a local file. That gives the page
the origin `"null"`, which breaks two things:

1. **Consent** — the TCF/GPP manager talks over `postMessage`; a `null` origin
   throws `Invalid target origin 'null'` and no consent string is produced.
2. **Demand** — the ad server matches the request to your **registered domain**
   by referrer; a `null` origin matches nothing → `AdError 303: No Ads`.

**Fix:** host `rewarded.html` on the https domain you registered with AppLixir
(the one carrying your `ads.txt`) and point the WebView at it with
`source={{ uri }}`.

## Setup

1. Host `rewarded.html` at e.g. `https://yourgame.com/rewarded`. Put your API key
   in it and make sure your `ads.txt` is live on that domain.
2. Install the WebView: `npm install react-native-webview` (+ `pod install` on iOS).
3. Set `source={{ uri }}` in `RewardedAd.jsx` to your hosted URL.
4. Render `<RewardedAd onReward={grantReward} />` and trigger from a user tap.

## Checklist

- [ ] WebView uses `source={{ uri }}` with your registered https domain — not inline HTML / `file://`.
- [ ] `ads.txt` is live on that domain.
- [ ] JavaScript, DOM storage, and cookies enabled (see the props in `RewardedAd.jsx`).
- [ ] Reward granted server-side via the web callback; the `reward` message is optimistic UI.

**Using an AI agent?** Copy [`prompts/react-native.md`](../../prompts/react-native.md)
into Claude Code / Codex / Cursor and it implements this for you.

Full walkthrough: https://support.applixir.com/applixir-integration/react-integration/step-4-react-native
