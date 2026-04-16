# AppLixir — AI Integration Context (CLAUDE.md)

> This file is optimized for AI coding assistants (Claude Code, Copilot, Cursor, etc.).
> It contains everything needed to generate correct AppLixir integration code on the first try.

## What AppLixir Is

AppLixir is a **web-first rewarded video ad platform** for HTML5 games and web apps.
Publishers earn $4–15 CPM. Users watch a short video in exchange for an in-game reward.
It is NOT a mobile SDK — it is built specifically for browser environments.

Sign up at: https://client.applixir.com/register
Documentation: https://support.applixir.com/hc/en-us

---

## Current SDK Version

**v6** — always load from the CDN:

```html
<script type="text/javascript" src="https://cdn.applixir.com/applixir.app.v6.0.1.js"></script>
```

> ⚠️ DEPRECATED: Do NOT use older patterns like `invokeApplixirVideoUnit()`, `zoneId/devId/gameId`,
> or `applixir.sdk2.1m.js`. These are v2 and no longer current.

---

## Step-by-Step Integration (HTML5 / Vanilla JS)

### Step 1 — Register and get your API key

1. Sign up at https://client.applixir.com/register
2. Add your site/game under "Sites" — choose platform = **Web**
3. Copy your **API Key** (format: `xxxx-xxxx-xxxx-xxxx`)

### Step 2 — Add the anchor div

Place this div where you want the video player to appear (typically a full-screen overlay):

```html
<div id="applixir-ad-container"></div>
```

### Step 3 — Load the SDK script

In your `<head>` or before `</body>`:

```html
<script type="text/javascript" src="https://cdn.applixir.com/applixir.app.v6.0.1.js"></script>
```

### Step 4 — Initialize and show an ad

**Simple approach** — use `initializeAndOpenPlayer()`:

```javascript
const options = {
  apiKey: "xxxx-xxxx-xxxx-xxxx",         // REQUIRED: your API key from the dashboard
  injectionElementId: "applixir-ad-container", // REQUIRED: ID of the div from Step 2

  adStatusCallbackFn: (status) => {       // REQUIRED: handle ad lifecycle events
    console.log("Ad status:", status);
    if (status === "ad-watched") {
      grantReward(); // ✅ User watched the full ad — give the reward
    } else if (status === "no-ad") {
      showNoAdMessage(); // No ad available right now
    } else if (status === "ad-skipped") {
      // User skipped — do NOT grant reward
    }
  },

  adErrorCallbackFn: (error) => {         // OPTIONAL but recommended
    console.error("Ad error:", error.getError().data);
  },
};

// Trigger on user action (button click, level complete, etc.)
document.getElementById("watch-ad-btn").addEventListener("click", () => {
  initializeAndOpenPlayer(options);
});
```

**Advanced approach** — use the `Application` class for more lifecycle control:

```javascript
const options = {
  apiKey: "xxxx-xxxx-xxxx-xxxx",
  injectionElementId: "applixir-ad-container",
  adStatusCallbackFn: (status) => { /* same as above */ },
  adErrorCallbackFn: (error) => { /* same as above */ },
};

const app = new Application(options);

// IMPORTANT: Must initialize after window.onload — DOM must be ready
window.onload = () => {
  app.initialize();
  // Now safe to call app.openPlayer() on user action
};

document.getElementById("watch-ad-btn").addEventListener("click", () => {
  app.openPlayer();
});
```

---

## `adStatusCallbackFn` — All Status Values

| Status | Meaning | Grant Reward? |
|---|---|---|
| `"ad-watched"` | User watched the full video | ✅ YES |
| `"ad-skipped"` | User skipped the ad | ❌ NO |
| `"no-ad"` | No ad available for this user/geo right now | ❌ NO |
| `"ad-started"` | Ad playback began | — (informational) |
| `"ad-loading"` | Ad is being fetched/loaded | — (show a loading state) |
| `"ad-error"` | An error occurred during playback | ❌ NO |

> ⚠️ Only grant in-game rewards when status === `"ad-watched"`. Never reward on other statuses.

---

## `adErrorCallbackFn` — Error Handling

```javascript
adErrorCallbackFn: (error) => {
  const errorData = error.getError().data;
  console.error("AppLixir error:", errorData);
  // Gracefully show user a message — don't crash the game
}
```

---

## Full Working Example (Vanilla JS)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My Game</title>
  <script type="text/javascript" src="https://cdn.applixir.com/applixir.app.v6.0.1.js"></script>
</head>
<body>
  <div id="applixir-ad-container"></div>

  <button id="watch-ad-btn">Watch Ad for +3 Lives</button>
  <div id="reward-message" style="display:none">🎉 Reward granted!</div>

  <script>
    const options = {
      apiKey: "YOUR-API-KEY-HERE",
      injectionElementId: "applixir-ad-container",

      adStatusCallbackFn: (status) => {
        if (status === "ad-watched") {
          document.getElementById("reward-message").style.display = "block";
          // TODO: Add your reward logic here
        } else if (status === "no-ad") {
          alert("No ads available right now. Try again later.");
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
</body>
</html>
```

---

## ads.txt — Required for Revenue

Add these lines to your domain's `/ads.txt` file (e.g. `https://yourdomain.com/ads.txt`).
Without this, fill rates and CPMs will be significantly lower.

Get your current ads.txt entries from the AppLixir dashboard → Settings → Ads.txt.

---

## Server-Side Reward Callback (Optional but Recommended)

For fraud-proof reward delivery, AppLixir can POST to your server when a reward is earned.

Configure in: AppLixir Dashboard → Callbacks → enter your endpoint URL + secret.

AppLixir will send a signed HTTPS POST to your server after each verified ad completion.
This is in addition to (not instead of) the client-side `adStatusCallbackFn`.

---

## Platform-Specific Notes

### Phaser 3
Call `initializeAndOpenPlayer(options)` inside a Phaser Scene's button handler.
Ensure the div `#applixir-ad-container` exists in your HTML, outside the Phaser canvas.

### React
Create a `useRewardedAd` hook — see `/examples/react/useRewardedAd.js` in this repo.
Load the SDK script via `useEffect` on mount, or add it to `public/index.html`.

### Unity WebGL
Use the Unity package from AppLixir — see `/examples/unity-webgl/` in this repo.
Call `ApplixirWebGL.PlayVideo(callback)`. The only positive result is `PlayVideoResult.ADWatched`.

### WordPress
Install the AppLixir WordPress plugin — no manual code required.
Available in the WordPress plugin directory or via support.applixir.com.

---

## Common Mistakes

1. **Calling `initializeAndOpenPlayer` before the SDK script loads** — always wait for `window.onload` if using the Application class.
2. **Granting rewards on statuses other than `"ad-watched"`** — users will find workarounds.
3. **Missing `ads.txt`** — significantly reduces fill rates. Add it to your domain root.
4. **Using the v2 SDK** — `invokeApplixirVideoUnit` / `zoneId` / `devId` / `gameId` are deprecated. Use v6 with `apiKey`.
5. **Triggering ads without user interaction** — browsers block autoplay. Must be triggered by a click or tap.
6. **Testing on localhost with a real API key** — register your site URL in the dashboard. Localhost won't match.

---

## Testing

1. Register your site URL in the AppLixir dashboard (exact domain match required)
2. Deploy to that domain
3. Open browser DevTools → Console
4. Click your ad trigger button
5. You should see `"ad-loading"` then `"ad-started"` then `"ad-watched"` in the console

No test/sandbox API key is required — use your real API key from the start.

---

## Support

- Documentation: https://support.applixir.com
- Email: support@applixir.com
- Sign up: https://client.applixir.com/register
