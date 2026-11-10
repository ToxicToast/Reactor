import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import * as prettier from 'prettier';

const ROOT = process.cwd();

const LIBS = {
  '@toxictoast/twitch-bot-application': 'libs/twitch-bot/application',
  '@toxictoast/blog-application': 'libs/blog/application',
  '@toxictoast/audit-application': 'libs/audit/application',
  '@toxictoast/security-application': 'libs/security/application',
  '@toxictoast/twitch-application': 'libs/twitch/application',
  '@toxictoast/twitch-api': 'libs/twitch/api',
  '@toxictoast/shared-grpc': 'libs/shared/grpc',
  '@toxictoast/shared-webhooks-application': 'libs/shared/webhooks/application',
  '@toxictoast/shared-application': 'libs/shared/application',
};

const SOURCE_DIRS = ['libs', 'apps'];
const SKIPPED_DIRS = new Set([
  'node_modules',
  'dist',
  'out-tsc',
  '.nx',
  '.git',
]);
const TESTING_SUBPATH = './testing';
const TESTING_ENTRY = './src/testing/index.ts';
const TESTING_INDEX_LINE = /^export \* from '\.\/testing\/index\.js';\r?\n/m;
const EXPORTED_NAME =
  /export\s+(?:declare\s+)?(?:abstract\s+)?(?:class|function|const|let|interface|type|enum)\s+(\w+)/g;
const NAMED_IMPORT =
  /import\s+(type\s+)?\{([^}]*)\}\s*from\s*'(@toxictoast\/[\w-]+)';/g;

const changedFiles = new Set();

function walk(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    if (SKIPPED_DIRS.has(entry)) {
      continue;
    }
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) {
      files.push(...walk(path));
    } else if (path.endsWith('.ts')) {
      files.push(path);
    }
  }
  return files;
}

function write(path, content) {
  writeFileSync(path, content);
  changedFiles.add(path);
}

function testingNames(libRoot) {
  const names = new Set();
  for (const file of walk(join(ROOT, libRoot, 'src', 'testing'))) {
    for (const match of readFileSync(file, 'utf8').matchAll(EXPORTED_NAME)) {
      names.add(match[1]);
    }
  }
  return names;
}

function addTestingExport(libRoot) {
  const path = join(ROOT, libRoot, 'package.json');
  const manifest = JSON.parse(readFileSync(path, 'utf8'));
  if (manifest.exports[TESTING_SUBPATH]) {
    return;
  }
  const exports = {};
  for (const [key, value] of Object.entries(manifest.exports)) {
    if (key === './package.json') {
      exports[TESTING_SUBPATH] = {
        types: TESTING_ENTRY,
        import: TESTING_ENTRY,
        default: TESTING_ENTRY,
      };
    }
    exports[key] = value;
  }
  manifest.exports = exports;
  write(path, `${JSON.stringify(manifest, null, 2)}\n`);
}

function removeTestingFromIndex(libRoot) {
  const path = join(ROOT, libRoot, 'src', 'index.ts');
  const content = readFileSync(path, 'utf8');
  if (!TESTING_INDEX_LINE.test(content)) {
    return;
  }
  write(path, content.replace(TESTING_INDEX_LINE, ''));
}

function importedName(specifier) {
  return specifier
    .replace(/^type\s+/, '')
    .split(/\s+as\s+/)[0]
    .trim();
}

function importStatement(typePrefix, specifiers, source) {
  return `import ${typePrefix}{ ${specifiers.join(', ')} } from '${source}';`;
}

function splitImports(content, namesByPackage) {
  return content.replace(
    NAMED_IMPORT,
    (statement, typeKeyword, list, source) => {
      const names = namesByPackage.get(source);
      if (!names) {
        return statement;
      }
      const specifiers = list
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const testing = specifiers.filter((s) => names.has(importedName(s)));
      if (testing.length === 0) {
        return statement;
      }
      const regular = specifiers.filter((s) => !names.has(importedName(s)));
      const typePrefix = typeKeyword ?? '';
      const statements = [];
      if (regular.length > 0) {
        statements.push(importStatement(typePrefix, regular, source));
      }
      statements.push(
        importStatement(typePrefix, testing, `${source}/testing`),
      );
      return statements.join('\n');
    },
  );
}

async function rewriteImports(namesByPackage) {
  for (const dir of SOURCE_DIRS) {
    for (const path of walk(join(ROOT, dir))) {
      const content = readFileSync(path, 'utf8');
      const rewritten = splitImports(content, namesByPackage);
      if (rewritten === content) {
        continue;
      }
      const options = await prettier.resolveConfig(path);
      write(
        path,
        await prettier.format(rewritten, { ...options, filepath: path }),
      );
    }
  }
}

const namesByPackage = new Map();
for (const [packageName, libRoot] of Object.entries(LIBS)) {
  namesByPackage.set(packageName, testingNames(libRoot));
  addTestingExport(libRoot);
  removeTestingFromIndex(libRoot);
}
await rewriteImports(namesByPackage);

for (const path of [...changedFiles].sort()) {
  console.log(relative(ROOT, path));
}
console.log(`${changedFiles.size} Dateien geändert`);
