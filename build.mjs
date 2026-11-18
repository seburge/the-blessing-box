import { cp, mkdir, readdir, rm, copyFile } from 'node:fs/promises';

await rm('dist', { recursive: true, force: true });
await mkdir('dist');
for (const entry of await readdir('.', { withFileTypes: true })) {
  if (entry.isFile() && /\.(html|css|js)$/.test(entry.name)) {
    await copyFile(entry.name, 'dist/' + entry.name);
  }
}
await cp('assets', 'dist/assets', { recursive: true });
