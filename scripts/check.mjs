import { readdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const files = [];
for (const directory of ['js', 'scripts']) {
  for (const entry of await readdir(resolve(root, directory), { withFileTypes: true })) {
    if (entry.isFile() && /\.m?js$/.test(entry.name)) files.push(`${directory}/${entry.name}`);
  }
}

let failures = 0;
for (const file of files.sort()) {
  const result = spawnSync(process.execPath, ['--check', resolve(root, file)], { encoding: 'utf8' });
  if (result.status !== 0) {
    failures++;
    console.error(`${file}\n${result.stderr || result.error?.message || 'Syntax check failed'}`);
  }
}
console.log(`Syntax: ${files.length - failures}/${files.length} files passed.`);
process.exitCode = failures ? 1 : 0;
