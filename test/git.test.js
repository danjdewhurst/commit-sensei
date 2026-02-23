const test = require('node:test');
const assert = require('node:assert/strict');
const childProcess = require('node:child_process');

function withStubbedExec(stub, fn) {
  const original = childProcess.execFileSync;
  childProcess.execFileSync = stub;

  try {
    delete require.cache[require.resolve('../src/git')];
    const git = require('../src/git');
    fn(git);
  } finally {
    childProcess.execFileSync = original;
    delete require.cache[require.resolve('../src/git')];
  }
}

test('getDiff returns staged diff first', () => {
  withStubbedExec((cmd, args) => {
    if (args.includes('--cached')) return '+++ b/src/a.js\n+staged';
    return '+++ b/src/a.js\n+working';
  }, (git) => {
    assert.deepEqual(git.getDiff(), { source: 'staged', text: '+++ b/src/a.js\n+staged' });
  });
});

test('getDiff falls back to working diff', () => {
  withStubbedExec((cmd, args) => {
    if (args.includes('--cached')) return '   ';
    return '+++ b/src/a.js\n+working';
  }, (git) => {
    assert.deepEqual(git.getDiff(), { source: 'working', text: '+++ b/src/a.js\n+working' });
  });
});

test('getDiff returns none when no changes', () => {
  withStubbedExec(() => '   ', (git) => {
    assert.deepEqual(git.getDiff(), { source: 'none', text: '' });
  });
});

test('commitWithMessage sends git commit args', () => {
  let captured;
  withStubbedExec((cmd, args) => {
    captured = { cmd, args };
    return 'ok';
  }, (git) => {
    const out = git.commitWithMessage('feat: add x');
    assert.equal(out, 'ok');
  });

  assert.equal(captured.cmd, 'git');
  assert.deepEqual(captured.args, ['commit', '-m', 'feat: add x']);
});
