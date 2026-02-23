const test = require('node:test');
const assert = require('node:assert/strict');

const {
  countLineChanges,
  generateMessage,
  inferScope,
  inferSubject,
  inferType,
  parseChangedFiles,
  sanitizeSubject
} = require('../src/heuristics');

test('parseChangedFiles extracts changed paths and deduplicates', () => {
  const diff = [
    'diff --git a/src/a.js b/src/a.js',
    '--- a/src/a.js',
    '+++ b/src/a.js',
    '+++ b/src/a.js',
    'diff --git a/README.md b/README.md',
    '--- a/README.md',
    '+++ b/README.md',
    '+++ b//dev/null'
  ].join('\n');

  assert.deepEqual(parseChangedFiles(diff), ['src/a.js', 'README.md']);
});

test('countLineChanges ignores headers and counts +/- lines', () => {
  const diff = ['--- a/x', '+++ b/x', '+a', '+b', '-c', ' context'].join('\n');
  assert.deepEqual(countLineChanges(diff), { additions: 2, deletions: 1 });
});

test('inferType classification branches', () => {
  assert.equal(inferType(['README.md'], '+++ b/README.md\n+docs'), 'docs');
  assert.equal(inferType(['test/cli.test.js'], '+++ b/test/cli.test.js\n+case'), 'test');
  assert.equal(inferType(['.github/workflows/tests.yml'], '+++ b/.github/workflows/tests.yml\n+name: Tests'), 'test');
  assert.equal(inferType(['.github/workflows/deploy.yml'], '+++ b/.github/workflows/deploy.yml\n+name: Deploy'), 'ci');
  assert.equal(inferType(['package.json'], '+++ b/package.json\n+{}'), 'chore');
  assert.equal(inferType(['src/a.js'], '+++ b/src/a.js\n+fix bug here'), 'fix');
  assert.equal(inferType(['src/a.js'], '+++ b/src/a.js\n+a\n+b\n+c\n+d\n+e\n+f\n+g\n+h\n+i'), 'feat');
  assert.equal(inferType(['src/a.js'], '+++ b/src/a.js\n+a\n-b'), 'refactor');
  assert.equal(inferType(['src/a.js', 'lib/b.js', 'docs/c.md'], 'misc changes'), 'chore');
});

test('inferScope handles top-level detection', () => {
  assert.equal(inferScope([]), '');
  assert.equal(inferScope(['README.md']), '');
  assert.equal(inferScope(['src/a.js', 'src/b.js']), 'src');
  assert.equal(inferScope(['src/a.js', 'lib/b.js']), '');
});

test('inferSubject branches', () => {
  assert.equal(inferSubject([], 'chore'), 'update project files');
  assert.equal(inferSubject(['README.md'], 'docs'), 'update README.md documentation');
  assert.equal(inferSubject(['test/cli.test.js'], 'test'), 'update cli.test.js coverage');
  assert.equal(inferSubject(['src/index.js'], 'chore'), 'update index.js');
  assert.equal(inferSubject(['src/a.js', 'src/b.js'], 'docs'), 'update src documentation');
  assert.equal(inferSubject(['src/a.js', 'src/b.js'], 'test'), 'improve src test coverage');
  assert.equal(inferSubject(['src/a.js', 'src/b.js'], 'chore'), 'update src changes');
  assert.equal(inferSubject(['src/a.js', 'lib/b.js'], 'docs'), 'update documentation');
  assert.equal(inferSubject(['src/a.js', 'lib/b.js'], 'test'), 'improve test coverage');
});

test('sanitizeSubject and generateMessage behavior', () => {
  assert.equal(sanitizeSubject('  Hello World... '), 'hello World');

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
