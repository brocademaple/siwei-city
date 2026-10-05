import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const base = new URL(process.argv[2] ?? 'https://brocademaple.github.io/siwei-city/');
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const evidence = [];
for (const path of ['', 'v1/', 'v2/']) {
  const url = new URL(path, base);
  const response = await fetch(url, { signal: AbortSignal.timeout(30000), cache: 'no-store' });
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  const html = await response.text();
  if (!/Siwei City|思维城邦/.test(html)) throw new Error(`${url}: project title missing`);
  evidence.push({ url: url.href, status: response.status });
  if (path === 'v2/') {
    const assetPaths = [...html.matchAll(/(?:src|href)="([^"]+\.(?:js|css))"/g)].map((match) => match[1]);
    if (assetPaths.length < 2) throw new Error('Expected application JavaScript and CSS');
    for (const assetPath of assetPaths) {
      const assetUrl = new URL(assetPath, url);
      const asset = await fetch(assetUrl, { signal: AbortSignal.timeout(30000), cache: 'no-store' });
      if (!asset.ok) throw new Error(`${assetUrl}: HTTP ${asset.status}`);
      const remote = Buffer.from(await asset.arrayBuffer());
      const prefix = base.pathname.replace(/\/$/, '');
      const local = await readFile(`dist${assetUrl.pathname.slice(prefix.length)}`);
      if (hash(remote) !== hash(local)) throw new Error(`${assetUrl}: differs from local Pages build`);
      evidence.push({ url: assetUrl.href, status: asset.status, bytes: remote.length, sha256: hash(remote), matchesLocalBuild: true });
    }
  }
}
const hero = await fetch(new URL('version-assets/pages-home-hero.webp', base), { method: 'HEAD', signal: AbortSignal.timeout(30000) });
if (!hero.ok) throw new Error(`Homepage hero: HTTP ${hero.status}`);
evidence.push({ url: hero.url, status: hero.status, contentType: hero.headers.get('content-type') });
console.log(JSON.stringify({ checkedAt: new Date().toISOString(), evidence, limit: 'HTTP and deployed-build verification; rendered browser behavior requires a separate check.' }, null, 2));
