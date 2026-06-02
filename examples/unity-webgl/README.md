# Unity WebGL — AppLixir rewarded video

AppLixir runs in the browser, so Unity integrates via a WebGL JS bridge that calls
the SDK and sends the result back to C#.

| File | Place it at | What it is |
|---|---|---|
| `AppLixirBridge.jslib` | `Assets/Plugins/WebGL/AppLixirBridge.jslib` | JS bridge that calls the SDK |
| `AppLixirManager.cs` | A GameObject in your scene | C# manager that triggers ads + handles the result |

## Setup

1. Add both files to your project at the paths above.
2. Load the SDK in your WebGL template's `index.html` `<head>`:
   ```html
   <script type="text/javascript" src="https://cdn.applixir.com/applixir.app.v6.1.0.js"></script>
   ```
3. Put your API key in `AppLixirBridge.jslib` (`apiKey`).
4. Attach `AppLixirManager.cs` to a GameObject named **`AppLixirManager`** (the name
   must match the string passed to `PlayRewardedAd`). Call `ShowRewardedAd()` from
   your game logic on a user action.

## How the result reaches C#

The SDK's `adStatusCallbackFn` receives a status **object** `{ type, ad?, error? }`.
Unity's `SendMessage` only accepts a string, so the bridge forwards **`status.type`**.
`AppLixirManager.OnAdStatusReceived` then grants the reward only on `"complete"`.

| Value received in C# | Action |
|---|---|
| `complete` | ✅ Grant reward |
| `allAdsCompleted` | Ad ended or no ad available — clean up, no reward |
| `skipped` / `manuallyEnded` | No reward |
| `consentDeclined` | No reward |
| `error` / `sdk-not-loaded` | Bridge-internal error sentinels |

For fraud-proof rewards, also use the server-side web callback as the source of truth.

Full docs: https://support.applixir.com
