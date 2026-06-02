# AppLixir — Unity WebGL integration prompt

Paste everything in the code block below into your coding agent (Claude Code, Codex,
Cursor, Copilot) at the root of your Unity project. Fill in the one placeholder.

````text
You are integrating AppLixir rewarded video ads into this Unity project for a WebGL
build. AppLixir is a browser-based rewarded-video SDK; Unity calls it through a WebGL
JS bridge (.jslib) and gets the result back via SendMessage.

## What to build
1. A .jslib bridge (Assets/Plugins/WebGL/AppLixirBridge.jslib) that calls the SDK and
   forwards the ad status string back to a C# GameObject.
2. A C# manager (a MonoBehaviour on a GameObject) that triggers the ad and grants the
   reward when the ad completes.
3. The SDK <script> tag in the WebGL template's index.html.

## Inputs (fill these in)
- AppLixir API key: <YOUR_API_KEY>
- SDK version to pin: 6.1.0
- The SDK script: https://cdn.applixir.com/applixir.app.v6.1.0.js

## Steps
1. Inspect the project: find the WebGL template (Assets/WebGLTemplates/...) and where a
   rewarded ad should be offered, and how rewards are currently granted.
2. Add the SDK to the WebGL template index.html <head>:
   <script type="text/javascript" src="https://cdn.applixir.com/applixir.app.v6.1.0.js"></script>
3. Create AppLixirBridge.jslib with a PlayRewardedAd(objectNamePtr, methodNamePtr) function that:
   - ensures a <div id="applixir-ad-container"> exists,
   - calls initializeAndOpenPlayer({ apiKey, injectionElementId, adStatusCallbackFn, adErrorCallbackFn }),
   - in adStatusCallbackFn (which receives a STATUS OBJECT { type, ad?, error? }), forwards
     status.type back to Unity: SendMessage(objectName, methodName, status.type).
     (SendMessage only accepts a string — never pass the whole status object.)
4. Create the C# manager:
   - [DllImport("__Internal")] private static extern void PlayRewardedAd(string obj, string method);
   - ShowRewardedAd() calls PlayRewardedAd(gameObjectName, "OnAdStatusReceived") under
     UNITY_WEBGL && !UNITY_EDITOR (simulate with "complete" in the editor).
   - OnAdStatusReceived(string status) switches on the value and grants the reward ONLY
     on "complete".

## Hard rules
- The JS adStatusCallbackFn receives an OBJECT. Forward status.type (a string) via
  SendMessage. NEVER pass the object, and NEVER use old strings like "ad-watched"/"no-ad".
- The real status values are: loaded, started, firstQuartile, midpoint, thirdQuartile,
  complete, allAdsCompleted, click, paused, skipped, manuallyEnded, consentDeclined.
- Grant the reward ONLY on "complete". "allAdsCompleted" fires at the end of any ad AND
  when no ad was available — it is not a reward signal.
- Treat client-side "complete" as OPTIMISTIC UI. The source of truth for persistent
  rewards is AppLixir's server-side web callback.
- Pin the SDK to v6.1.0.

## Acceptance criteria
- In a WebGL build, triggering the ad opens it and C# OnAdStatusReceived receives the
  lifecycle ending in "complete" (NOT "[object Object]").
- The reward is granted only on "complete".

Reference (read if unsure):
https://support.applixir.com
Working example: https://github.com/applixirinc/applixir-integration/tree/main/examples/unity-webgl

Start by inspecting the project and proposing a short plan before writing code.
````
