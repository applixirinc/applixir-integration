# Phaser 3 — AppLixir rewarded video

AppLixir is a DOM overlay, so it works alongside a Phaser canvas with no special
integration — you just trigger it from a Scene's input handler.

| File | What it is |
|---|---|
| `game.js` | A Phaser Scene with a "Watch Ad" button wired to the SDK |

## Setup

1. Load the SDK and add the anchor div in your HTML, **before** your Phaser script:
   ```html
   <script src="https://cdn.applixir.com/applixir.app.v6.1.0.js"></script>
   <div id="applixir-ad-container" style="position:absolute;top:0;left:0;width:100%;height:100%;z-index:9999;display:none;"></div>
   ```
2. Trigger the ad from a Scene input handler (see `game.js`):
   ```js
   button.on("pointerdown", () => this.showRewardedAd());
   ```
3. In the callback, grant the reward only on `status.type === "complete"`:
   ```js
   adStatusCallbackFn: (status) => {
     if (status.type === "complete") this.grantExtraLife();
     else if (status.type === "allAdsCompleted") this.hideAdContainer();
   }
   ```

Tip: pause the Scene (`this.scene.pause()`) before showing the ad and resume it
after, so the game loop doesn't run behind the overlay.

`adStatusCallbackFn` receives a status **object**. See the
[status reference and reward rules](../../README.md#key-concepts) in the repo root.

Full docs: https://support.applixir.com
