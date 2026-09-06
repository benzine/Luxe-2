/**
 * sourceZip.ts - Creates a ZIP file of the entire project source
 * for download by the user. Uses JSZip library.
 */

import JSZip from 'jszip';

export async function buildSourceZip(): Promise<Blob> {
  const zip = new JSZip();
  
  // Add all source files
  const files = [
    { path: 'package.json', content: await fetch('/package.json').then(r => r.text()) },
    { path: 'vite.config.js', content: await fetch('/vite.config.js').then(r => r.text()) },
    { path: 'tsconfig.json', content: await fetch('/tsconfig.json').then(r => r.text()) },
    { path: 'index.html', content: await fetch('/index.html').then(r => r.text()) },
  ];
  
  files.forEach(file => {
    zip.file(file.path, file.content);
  });
  
  // Add src folder
  const srcFiles = ['main.tsx', 'App.tsx', 'index.css', 'vite-env.d.ts'];
  for (const f of srcFiles) {
    try {
      const content = await fetch(`/src/${f}`).then(r => r.text());
      zip.file(`src/${f}`, content);
    } catch (e) {
      console.warn(`Could not load src/${f}`);
    }
  }
  
  return await zip.generateAsync({ type: 'blob' });
}
