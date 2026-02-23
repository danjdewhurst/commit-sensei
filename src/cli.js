const { commitWithMessage, getDiff } = require('./git');
const { generateMessage } = require('./heuristics');

function printHelp() {
  const text = `commit-sensei

Generate deterministic conventional commit messages from git changes.

Usage:
  commit-sensei [options]

Options:
  --help           Show this help output
  --type <type>    Override inferred conventional commit type
  --scope <scope>  Override inferred scope
  --dry-run        Print suggested message without committing

Behavior:
  1. Uses staged diff when available.
  2. Falls back to working-tree diff when nothing is staged.
  3. Commits automatically unless --dry-run is set or only working-tree changes exist.
`;
  process.stdout.write(text);
}

function parseArgs(argv) {
  const options = {
    dryRun: false
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--type') {
      options.type = argv[i + 1];
      i += 1;
    } else if (arg.startsWith('--type=')) {
      options.type = arg.slice('--type='.length);
    } else if (arg === '--scope') {
      options.scope = argv[i + 1];
      i += 1;
    } else if (arg.startsWith('--scope=')) {
      options.scope = arg.slice('--scope='.length);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (options.type === '') {
    throw new Error('Argument --type cannot be empty.');
  }

  if (options.scope === '') {
    throw new Error('Argument --scope cannot be empty.');
  }

  return options;
}

function run(argv = process.argv.slice(2)) {
  const options = parseArgs(argv);

  if (options.help) {
    printHelp();
    return 0;
  }

  const diff = getDiff();
  if (!diff.text.trim()) {
    throw new Error('No git changes found (staged or working tree).');
  }

  const message = generateMessage(diff.text, {
    type: options.type,
    scope: options.scope
  });

  if (options.dryRun || diff.source !== 'staged') {
    process.stdout.write(`${message}\n`);
    if (diff.source === 'working' && !options.dryRun) {
      process.stdout.write('Note: no staged changes found. Suggested message only.\n');
    }
    return 0;
  }

  const commitOutput = commitWithMessage(message);
  process.stdout.write(commitOutput);
  return 0;
}

module.exports = {
  parseArgs,
  printHelp,
  run
};
