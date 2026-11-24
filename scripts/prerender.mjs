import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const entryPath = pathToFileURL(resolve('.ssr/entry-server.js')).href;
const { render } = await import(entryPath);
const pages = [
  { path: 'index.html', url: '/' },
  { path: 'mentek.html', url: '/mentek.html' },
  { path: 'founding-circle.html', url: '/founding-circle.html' },
];

for (const page of pages) {
  const outputPath = resolve('dist', page.path);
  const template = await readFile(outputPath, 'utf8');
  const renderedApplication = render(page.url);
  const renderedPage = template.replace('<div id="root"></div>', `<div id="root">${renderedApplication}</div>`);
  if (renderedPage === template) throw new Error(`Unable to locate the application root for ${page.path}.`);
  await writeFile(outputPath, renderedPage);
}
