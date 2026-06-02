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

Full docs: https://support.applixir.com
