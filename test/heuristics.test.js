const test = require('node:test');
const assert = require('node:assert/strict');

const {
  generateMessage,
  inferType,
  parseChangedFiles
} = require('../src/heuristics');

test('parseChangedFiles extracts changed paths', () => {
  const diff = [
    'diff --git a/src/a.js b/src/a.js',
    '--- a/src/a.js',
    '+++ b/src/a.js',
    'diff --git a/README.md b/README.md',
    '--- a/README.md',
    '+++ b/README.md'
  ].join('\n');

  assert.deepEqual(parseChangedFiles(diff), ['src/a.js', 'README.md']);
});

test('inferType returns docs for markdown-only diffs', () => {
  const diff = [
    'diff --git a/README.md b/README.md',
    '--- a/README.md',
    '+++ b/README.md',
    '+Add docs'
  ].join('\n');

  const files = parseChangedFiles(diff);
  assert.equal(inferType(files, diff), 'docs');
});

test('generateMessage honors type and scope overrides', () => {
  const diff = [
    'diff --git a/src/a.js b/src/a.js',
    '--- a/src/a.js',
    '+++ b/src/a.js',
    '+const x = 1;'
  ].join('\n');

  const msg = generateMessage(diff, { type: 'fix', scope: 'cli' });
  assert.equal(msg, 'fix(cli): update a.js');
});

test('generateMessage throws on empty diff', () => {
  assert.throws(() => generateMessage(''), /No diff content provided/);
});
