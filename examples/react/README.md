# React (web) — AppLixir rewarded video

Drop-in hook + component for React web apps.

| File | What it is |
|---|---|
| `useRewardedAd.js` | The hook (JavaScript) |
| `useRewardedAd.ts` | The hook (TypeScript) |
| `GameScreen.jsx` | Example component using the hook |

## Usage

```jsx
import { useRewardedAd } from "./useRewardedAd";

function WatchAdButton() {
  const { ready, showAd } = useRewardedAd("YOUR-API-KEY");

  const onClick = async () => {
    const watched = await showAd();   // resolves true only on status.type === "complete"
    if (watched) {
      // optimistic UI — grant the persistent reward from your web callback
    }
  };

  return (
    <>
      <div id="applixir-ad-container" />
      <button disabled={!ready} onClick={onClick}>Watch ad</button>
    </>
  );
}
```

## Notes

- The SDK is a single CDN script — there is no npm package. The hook injects it,
  or you can add it to `public/index.html`.
- `adStatusCallbackFn` receives a status **object** (`{ type, ad?, error? }`).
  The completion signal is `status.type === "complete"`.
- Trigger from a user gesture (click) — browsers block non-user-initiated ads.
- **Next.js / Vite / CRA:** same hook; only env-var prefix and where you load the
  script differ. See the full guide:
  https://support.applixir.com/applixir-integration/react-integration/step-3-framework-recipes

**Using an AI agent?** Copy [`prompts/react.md`](../../prompts/react.md) into Claude
Code / Codex / Cursor and it implements this for you.

Full reference: https://support.applixir.com/applixir-integration/react-integration/
