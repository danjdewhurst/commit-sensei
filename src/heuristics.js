const path = require('node:path');

const DOC_PATH = /(^|\/)(docs?|readme|changelog)(\/|\.|$)/i;
const TEST_PATH = /(^|\/)(__tests__|tests?|specs?)(\/|\.|$)|\.(test|spec)\.[^.]+$/i;
const CI_PATH = /(^|\/)(\.github\/workflows|\.gitlab-ci|circleci|azure-pipelines|Jenkinsfile)/i;
const BUILD_PATH = /(^|\/)(package(-lock)?\.json|pnpm-lock\.yaml|yarn\.lock|Makefile|Dockerfile|\.nvmrc|\.editorconfig|\.eslintrc|\.prettierrc)/i;

function parseChangedFiles(diffText) {
  const files = [];
  const seen = new Set();

  for (const line of diffText.split('\n')) {
    if (!line.startsWith('+++ b/')) {
      continue;
    }

    const file = line.slice('+++ b/'.length).trim();
    if (file === '/dev/null' || seen.has(file)) {
      continue;
    }

    seen.add(file);
    files.push(file);
  }

  return files;
}

function countLineChanges(diffText) {
  let additions = 0;
  let deletions = 0;

  for (const line of diffText.split('\n')) {
    if (line.startsWith('+++') || line.startsWith('---')) {
      continue;
    }
    if (line.startsWith('+')) {
      additions += 1;
    } else if (line.startsWith('-')) {
      deletions += 1;
    }
  }

  return { additions, deletions };
}

function inferType(files, diffText) {
  if (!files.length) {
    return 'chore';
  }

  const allDocs = files.every((f) => DOC_PATH.test(f) || f.endsWith('.md'));
  if (allDocs) {
    return 'docs';
  }

  const allTests = files.every((f) => TEST_PATH.test(f));
  if (allTests) {
    return 'test';
  }

  const allCi = files.every((f) => CI_PATH.test(f));
  if (allCi) {
    return 'ci';
  }

  const allBuild = files.every((f) => BUILD_PATH.test(f));
  if (allBuild) {
    return 'chore';
  }

  const normalized = diffText.toLowerCase();
  if (/\b(fix|bug|error|regress|hotfix|resolve)\b/.test(normalized)) {
    return 'fix';
  }

  const { additions, deletions } = countLineChanges(diffText);
  if (additions > deletions * 2 && additions >= 8) {
    return 'feat';
  }

  if (additions <= 3 && deletions <= 3 && files.length <= 2) {
    return 'refactor';
  }

  return 'chore';
}

function inferScope(files) {
  if (!files.length) {
    return '';
  }

  const first = files[0].split('/')[0];
  if (!first || first.includes('.')) {
    return '';
  }

  const sameTopLevel = files.every((file) => file.startsWith(`${first}/`));
  return sameTopLevel ? first : '';
}

function inferSubject(files, type) {
  if (!files.length) {
    return 'update project files';
  }

  if (files.length === 1) {
    const file = files[0];
    const base = path.basename(file);

    if (type === 'docs') {
      return `update ${base} documentation`;
    }
    if (type === 'test') {
      return `update ${base} coverage`;
    }

    return `update ${base}`;
  }

  const scope = inferScope(files);
  if (scope) {
    if (type === 'docs') {
      return `update ${scope} documentation`;
    }
    if (type === 'test') {
      return `improve ${scope} test coverage`;
    }

    return `update ${scope} changes`;
  }

  if (type === 'docs') {
    return 'update documentation';
  }
  if (type === 'test') {
    return 'improve test coverage';
  }

  return 'update project files';
}

function sanitizeSubject(subject) {
  const trimmed = subject.trim().replace(/\.+$/, '');
  return trimmed.charAt(0).toLowerCase() + trimmed.slice(1);
}

function generateMessage(diffText, options = {}) {
  if (!diffText || !diffText.trim()) {
    throw new Error('No diff content provided.');
  }

  const files = parseChangedFiles(diffText);
  const type = options.type || inferType(files, diffText);
  const scope = options.scope || inferScope(files);
  const subject = options.subject || inferSubject(files, type);

  const header = scope ? `${type}(${scope}):` : `${type}:`;
  return `${header} ${sanitizeSubject(subject)}`;
}

module.exports = {
  countLineChanges,
  generateMessage,
  inferScope,
  inferSubject,
  inferType,
  parseChangedFiles,
  sanitizeSubject
};
