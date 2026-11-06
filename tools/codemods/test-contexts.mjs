import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import * as prettier from 'prettier';

const ROOT = process.cwd();
const SOURCE_DIRS = ['libs', 'apps'];
const SKIPPED_DIRS = new Set([
  'node_modules',
  'dist',
  'out-tsc',
  '.nx',
  '.git',
]);
const OLD_SOURCE = '@toxictoast/shared-application/testing';
const NEW_SOURCE = '@toxictoast/shared-kernel/testing';
const MOVED_NAMES = new Set([
  'createCountingTestContext',
  'createUuidTestContext',
]);

const FIXED_CONTEXT =
  /const ctx: DomainContext = \{\s*id: \{ generate: \(\) => '([^']+)' as never \},\s*date: \{ now: \(\) => (.+?) \},\s*\};/g;
const COUNTING_CONTEXT =
  /let counter = 0;\s*const ctx: DomainContext = \{\s*id: \{ generate: \(\) => `id-\$\{\+\+counter\}` as never \},\s*date: \{ now: \(\) => (\w+) \},\s*\};/g;
const NAMED_IMPORT = /import\s+(type\s+)?\{([^}]*)\}\s*from\s*'([^']+)';\n?/g;
const LAST_IMPORT = /^import[\s\S]*?from\s*'[^']+';\n/gm;

const changedFiles = [];

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

function specifierName(specifier) {
  return specifier
    .replace(/^type\s+/, '')
    .split(/\s+as\s+/)[0]
    .trim();
}

function replaceContexts(content, needed) {
  return content
    .replace(COUNTING_CONTEXT, (_match, clock) => {
      needed.add('createCountingTestContext');
      return `const ctx = createCountingTestContext(${clock});`;
    })
    .replace(FIXED_CONTEXT, (_match, id, clock) => {
      needed.add('createFixedTestContext');
      return `const ctx = createFixedTestContext('${id}', () => ${clock});`;
    });
}

function rewriteImports(content, needed) {
  const domainContextUsed =
    (content.match(/\bDomainContext\b/g) ?? []).length > 1;
  return content.replace(
    NAMED_IMPORT,
    (statement, typeKeyword, list, source) => {
      const specifiers = list
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      let kept = specifiers;
      if (source === OLD_SOURCE) {
        for (const specifier of specifiers) {
          if (MOVED_NAMES.has(specifierName(specifier))) {
            needed.add(specifierName(specifier));
          }
        }
        kept = specifiers.filter((s) => !MOVED_NAMES.has(specifierName(s)));
      }
      if (source === '@toxictoast/shared-kernel' && !domainContextUsed) {
        kept = kept.filter((s) => specifierName(s) !== 'DomainContext');
      }
      if (kept.length === specifiers.length) {
        return statement;
      }
      if (kept.length === 0) {
        return '';
      }
      return `import ${typeKeyword ?? ''}{ ${kept.join(', ')} } from '${source}';\n`;
    },
  );
}

function addKernelTestingImport(content, needed) {
  const statement = `import { ${[...needed].sort().join(', ')} } from '${NEW_SOURCE}';\n`;
  const imports = [...content.matchAll(LAST_IMPORT)];
  const last = imports[imports.length - 1];
  const position = last.index + last[0].length;
  return content.slice(0, position) + statement + content.slice(position);
}

for (const dir of SOURCE_DIRS) {
  for (const path of walk(join(ROOT, dir))) {
    const content = readFileSync(path, 'utf8');
    const needed = new Set();
    let rewritten = replaceContexts(content, needed);
    rewritten = rewriteImports(rewritten, needed);
    if (needed.size === 0) {
      continue;
    }
    rewritten = addKernelTestingImport(rewritten, needed);
    const options = await prettier.resolveConfig(path);
    writeFileSync(
      path,
      await prettier.format(rewritten, { ...options, filepath: path }),
    );
    changedFiles.push(path);
  }
}

for (const path of changedFiles.sort()) {
  console.log(relative(ROOT, path));
}
console.log(`${changedFiles.length} Dateien geändert`);
