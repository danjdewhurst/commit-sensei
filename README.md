# commit-sensei

`commit-sensei` is an offline Node.js CLI that generates deterministic conventional commit messages from your git diff.

## Features

- Uses **staged diff** first, falls back to working-tree diff.
- Applies deterministic heuristics (no API calls).
- Supports conventional commit overrides: `--type`, `--scope`.
- Can run in suggestion mode with `--dry-run`.

## Install / Run

### Local project usage (npm)

```bash
npm install
npm run sensei -- --dry-run
```

### Local project usage (Bun)

```bash
bun install
bun run sensei:bun:dry
```

### As a CLI binary

```bash
npm link
commit-sensei --help
```

### One-off via bunx

```bash
bunx commit-sensei --help
```

## Usage

```bash
commit-sensei [options]
```

Options:

- `--help` show usage.
- `--type <type>` override inferred commit type.
- `--scope <scope>` override inferred scope.
- `--dry-run` print message only; do not commit.

## Examples

```bash
# Generate from staged changes and commit automatically
commit-sensei

# Suggest message only
commit-sensei --dry-run

# Force type and scope
commit-sensei --type fix --scope parser --dry-run
```

## Heuristics (deterministic)

- docs-only changes => `docs`
- test-only changes => `test`
- CI-only changes => `ci`
- build/config-only changes => `chore`
- fix-like keywords in diff => `fix`
- large net additions => `feat`
- small changes => `refactor`
- fallback => `chore`

## Development

```bash
npm test
```
