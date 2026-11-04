# AI tooling (Claude Code)

All of it is free. Project settings live in `.claude/` and `.mcp.json`.

## Included

| Item                       | Kind         | What it is for                                                                  | When to use                            |
| -------------------------- | ------------ | ------------------------------------------------------------------------------- | -------------------------------------- |
| `CLAUDE.md`                | Rules        | Conventions, reporting format, checkpoint workflow                              | Always loaded                          |
| `skills/rn-responsive-ui`  | Skill        | Phones, tablets and foldables, safe areas, window classes, split view           | Any screen or navigation work          |
| `skills/ui-design-quality` | Skill        | Brief-first process, tokens, colour, type, anti-"AI look" checklist             | Any UI work                            |
| `hooks/format-lint.js`     | Hook         | Runs ESLint --fix and Prettier on every file Claude edits; reports real errors  | Automatic after Edit/Write             |
| `output-styles/terse.md`   | Output style | One-line status replies and the checkpoint prompt (selected in `settings.json`) | Automatic                              |
| `settings.json`            | Settings     | Denies reading `.env` and editing lint/format config; allows safe commands      | Automatic                              |
| `context7` (`.mcp.json`)   | MCP server   | Current library docs, so Claude does not guess APIs                             | Before using an unfamiliar library API |

Not included: agents, `.claude/commands/`, and the Chrome DevTools MCP (web only; the full-stack boilerplate has it). UI is checked with adb screenshots.

## Optional: Impeccable

A design skill (Apache-2.0) with commands such as `craft`, `critique` and `polish`, plus helper agents. It is not copied because it is large (about 60 files and a bundled binary). Install it per its own instructions if you want deeper design critique, and keep `docs/design-brief.md` as the source of truth.

## Workflow

1. **Plan mode first.** For anything beyond a small fix, start in plan mode: Claude reads the docs and code, proposes numbered checkpoints, and waits for your OK. Nothing is edited in plan mode.
2. **Default mode to build.** After approval, switch to default mode. Claude does one checkpoint, then stops with `Checkpoint X.Y done. Proceed to X.Z (<name>)?`.
3. **Escalate the model only for complex work** (architecture, tricky debugging, large refactors). Routine edits run on the default model.
4. Track progress in `docs/PROGRESS.md`; plan new apps with `docs/PLANNING_TEMPLATE.md`.
5. If docs and code disagree, Claude asks which is right.

## Reminders

- `.env` is never read by Claude (deny rules); only `.env.example`.
- ESLint and Prettier configs are not edited by Claude; ask for changes.
- The `.mcp.json` entry uses `cmd /c npx`, which is Windows-specific. On macOS or Linux use `npx` directly as the command.
