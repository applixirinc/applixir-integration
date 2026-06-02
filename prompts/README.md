# AI integration prompts

Copy-paste prompts that tell a coding agent (Claude Code, Codex, Cursor, Copilot) to
integrate AppLixir into **your** codebase. Each prompt bakes in the correct v6.1.0 API
so the agent gets it right on the first try.

| Platform | Prompt |
|---|---|
| HTML5 / Vanilla JS | [`html5.md`](html5.md) |
| React (web) | [`react.md`](react.md) |
| React Native | [`react-native.md`](react-native.md) |
| Phaser 3 | [`phaser.md`](phaser.md) |
| Unity WebGL | [`unity.md`](unity.md) |

## How to use

1. Open the prompt for your platform.
2. Copy the text **inside the code block**.
3. Paste it into your AI coding agent at the root of your repo.
4. Fill in the placeholders (`<YOUR_API_KEY>`, and for React Native `<YOUR_HTTPS_DOMAIN>`).

The same prompt works for any agent — it's plain instructions, not tool-specific.

> Tip: you can also point your agent at this repo's [`CLAUDE.md`](../CLAUDE.md) and
> [`llms.txt`](../llms.txt) for the full reference, then run the platform prompt.

Prefer to read and copy the code yourself? See the working [`examples/`](../examples/).
