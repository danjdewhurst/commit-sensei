const test = require('node:test');
const assert = require('node:assert/strict');

const { parseArgs } = require('../src/cli');

test('parseArgs handles flags and values', () => {
  const parsed = parseArgs(['--type', 'feat', '--scope=api', '--dry-run']);
  assert.deepEqual(parsed, {
    dryRun: true,
    type: 'feat',
    scope: 'api'
  });
});

test('parseArgs handles help', () => {
  const parsed = parseArgs(['--help']);
  assert.equal(parsed.help, true);
});

test('parseArgs rejects unknown args', () => {
  assert.throws(() => parseArgs(['--wat']), /Unknown argument/);
});
