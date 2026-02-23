const { execFileSync } = require('node:child_process');

function runGit(args) {
  return execFileSync('git', args, { encoding: 'utf8' });
}

function getDiff() {
  const staged = runGit(['diff', '--cached', '--no-color']);
  if (staged.trim()) {
    return { source: 'staged', text: staged };
  }

  const working = runGit(['diff', '--no-color']);
  if (working.trim()) {
    return { source: 'working', text: working };
  }

  return { source: 'none', text: '' };
}

function commitWithMessage(message) {
  return runGit(['commit', '-m', message]);
}

module.exports = {
  commitWithMessage,
  getDiff
};
