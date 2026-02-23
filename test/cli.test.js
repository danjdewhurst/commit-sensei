const test = require('node:test');
const assert = require('node:assert/strict');

const { createRunner, parseArgs } = require('../src/cli');

test('parseArgs handles flags and values', () => {
  const parsed = parseArgs(['--type', 'feat', '--scope=api', '--dry-run']);
  assert.deepEqual(parsed, {
    dryRun: true,
    type: 'feat',
    scope: 'api'
  });
});

test('parseArgs handles help aliases', () => {
  assert.equal(parseArgs(['--help']).help, true);
  assert.equal(parseArgs(['-h']).help, true);
});

test('parseArgs rejects unknown args', () => {
  assert.throws(() => parseArgs(['--wat']), /Unknown argument/);
});

test('parseArgs rejects empty values', () => {
  assert.throws(() => parseArgs(['--type=']), /--type cannot be empty/);
  assert.throws(() => parseArgs(['--scope=']), /--scope cannot be empty/);
});

test('runner commits when staged diff exists', () => {
  const writes = [];
  let committed = null;

  const run = createRunner({
    getDiff: () => ({ source: 'staged', text: 'diff --git a/x b/x\n+++ b/x\n+ok' }),
    generateMessage: () => 'feat: add x',
    commitWithMessage: (msg) => {
      committed = msg;
      return '[commit output]\n';
    },
    write: (t) => writes.push(t)
  });

  const code = run([]);
  assert.equal(code, 0);
  assert.equal(committed, 'feat: add x');
  assert.equal(writes.join(''), '[commit output]\n');
});

test('runner prints suggestion for working tree and does not commit', () => {
  const writes = [];
  let commitCalled = false;

  const run = createRunner({
    getDiff: () => ({ source: 'working', text: 'diff --git a/x b/x\n+++ b/x\n+ok' }),
    generateMessage: () => 'chore: update x',
    commitWithMessage: () => {
      commitCalled = true;
      return '';
    },
    write: (t) => writes.push(t)
  });

  run([]);

  assert.equal(commitCalled, false);
  assert.match(writes.join(''), /chore: update x/);
  assert.match(writes.join(''), /Suggested message only/);
});

test('runner throws when no diff content exists', () => {
  const run = createRunner({
    getDiff: () => ({ source: 'none', text: '   ' }),
    generateMessage: () => 'chore: x'
  });

  assert.throws(() => run([]), /No git changes found/);
});
