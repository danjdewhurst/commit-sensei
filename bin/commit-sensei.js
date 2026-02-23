#!/usr/bin/env node

const { run } = require('../src/cli');

try {
  const exitCode = run();
  process.exitCode = exitCode;
} catch (error) {
  process.stderr.write(`commit-sensei: ${error.message}\n`);
  process.exitCode = 1;
}
