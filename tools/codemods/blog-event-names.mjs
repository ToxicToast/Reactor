import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import * as prettier from 'prettier';

const ROOT = process.cwd();
const SOURCE_DIRS = ['libs/blog/domain/src', 'libs/blog/application/src'];
const RENAMED = {
  create: 'created',
  update: 'updated',
  delete: 'deleted',
  restore: 'restored',
  publish: 'published',
  archive: 'archived',
  unarchive: 'unarchived',
  ready: 'upload_confirmed',
  approve: 'approved',
  spam: 'marked_as_spam',
  hate: 'marked_as_hate',
  review: 'marked_for_review',
};
const NAME_EXPECTATION = /(e\.event_name\)\)\.toEqual\(\[)([^\]]*)(\])/g;
const QUOTED = /'([a-z_]+)'/g;

const changedFiles = [];

function walk(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) {
      files.push(...walk(path));
    } else if (path.endsWith('.spec.ts')) {
      files.push(path);
    }
  }
  return files;
}

function rename(list) {
  return list.replace(QUOTED, (quoted, name) => {
    const renamed = RENAMED[name];
    if (!renamed) {
      return quoted;
    }
    return `'${renamed}'`;
  });
}

for (const dir of SOURCE_DIRS) {
  for (const path of walk(join(ROOT, dir))) {
    const content = readFileSync(path, 'utf8');
    const rewritten = content.replace(
      NAME_EXPECTATION,
      (_match, start, list, end) => `${start}${rename(list)}${end}`,
    );
    if (rewritten === content) {
      continue;
    }
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
