<div align="center">

# commit-sensei

Offline, deterministic Conventional Commit message generation from your Git diffs.

[![Node.js](https://img.shields.io/badge/node-%3E%3D18-339933?logo=nodedotjs&logoColor=white)](#requirements)
[![Bun](https://img.shields.io/badge/bun-%3E%3D1.0.0-000000?logo=bun&logoColor=white)](#requirements)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

</div>

---

## Why `commit-sensei`?

Writing consistent commit messages is annoying friction, especially when context-switching.
`commit-sensei` removes that friction with fast, offline, deterministic heuristics.

- ✅ No API calls
- ✅ No network dependency
- ✅ Uses staged changes first
- ✅ Falls back to working tree suggestions
- ✅ Conventional Commit friendly (`feat`, `fix`, `docs`, `test`, `ci`, `chore`, etc.)

---

## Features

- Reads your Git diff and generates a Conventional Commit header.
- Supports overrides:
  - `--type <type>`
  - `--scope <scope>`
- Supports suggestion mode:
  - `--dry-run`
- Commits automatically when staged changes exist (unless `--dry-run` is set).
- Works with both Node.js and Bun.

---

## Requirements

- Node.js `>=18` **or** Bun `>=1.0.0`
- Git repository

---

## Installation & Usage

### npm (local project)

```bash
npm install
npm run sensei -- --dry-run
```

### Bun (local project)

```bash
bun install
bun run sensei:bun:dry
```

### Link as global CLI

```bash
npm link
commit-sensei --help
```

### One-off via bunx

```bash
bunx commit-sensei --help
```

---

## CLI

```bash
commit-sensei [options]
```

### Options

- `--help` – show help text
- `--type <type>` – override inferred Conventional Commit type
- `--scope <scope>` – override inferred scope
- `--dry-run` – print suggested message only (no commit)

---

## Examples

```bash
# Auto-commit from staged changes
commit-sensei

# Suggest only
commit-sensei --dry-run

# Force type and scope
commit-sensei --type fix --scope parser --dry-run
```

---

## How inference works (deterministic)

`commit-sensei` applies simple, transparent rules:

- docs-only changes → `docs`
- test-only changes → `test`
- CI-only changes → `ci`
- build/config-only changes → `chore`
- fix-like keywords in diff → `fix`
- large net additions → `feat`
- small/tight changes → `refactor`
- fallback → `chore`

---

## Development

```bash
npm test
bun test
```

---

## License

MIT © Daniel Dewhurst
