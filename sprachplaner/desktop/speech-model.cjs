const { createHash } = require('node:crypto');
const { createReadStream, createWriteStream } = require('node:fs');
const { mkdir, access, rm, rename, copyFile, readFile, writeFile } = require('node:fs/promises');
const { Readable } = require('node:stream');
const { pipeline } = require('node:stream/promises');
const path = require('node:path');
const { unzipSync } = require('fflate');
const tar = require('tar');
const MODEL = 'vosk-model-small-de-0.15';
const SHA256 = 'b7e53c90b1f0a38456f4cd62b366ecd58803cd97cd42b06438e2c131713d5e43';
async function hashFile(file) {
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(file)) hash.update(chunk);
  return hash.digest('hex');
}
async function prepareModel(target) {
  const cache = path.join(__dirname, '.cache');
  const zip = path.join(cache, `${MODEL}.zip`);
  const archive = path.join(cache, `${MODEL}-${SHA256.slice(0, 12)}.tar.gz`);
  await mkdir(cache, { recursive: true });
  let valid = false;
  try { valid = await hashFile(zip) === SHA256; } catch { /* First build. */ }
  if (!valid) {
    console.log('Downloading the German offline speech model (45 MB)...');
    const pending = `${zip}.partial`;
    try {
      const response = await fetch(`https://alphacephei.com/vosk/models/${MODEL}.zip`, { signal: AbortSignal.timeout(180000) });
      if (!response.ok) throw new Error(`Model download failed: ${response.status}`);
      await pipeline(Readable.fromWeb(response.body), createWriteStream(pending));
      if (await hashFile(pending) !== SHA256) throw new Error('Speech model checksum mismatch');
      await rename(pending, zip);
    } finally { await rm(pending, { force: true }); }
  }
  try { await access(archive); }
  catch {
    const unpacked = path.join(cache, 'unpacked');
    await rm(unpacked, { recursive: true, force: true });
    const entries = unzipSync(await readFile(zip));
    for (const [name, data] of Object.entries(entries)) {
      if (!name.startsWith(`${MODEL}/`) || name.includes('\\') || name.split('/').includes('..')) throw new Error('Unexpected model archive entry');
      const file = path.join(unpacked, 'model', name.slice(MODEL.length + 1));
      if (name.endsWith('/')) await mkdir(file, { recursive: true });
      else { await mkdir(path.dirname(file), { recursive: true }); await writeFile(file, data); }
    }
    const pending = `${archive}.partial`;
    await tar.c({ gzip: true, portable: true, cwd: unpacked, file: pending }, ['model']);
    await rename(pending, archive);
    await rm(unpacked, { recursive: true, force: true });
  }
  await copyFile(archive, path.join(target, 'model-de.tar.gz'));
}
module.exports = { prepareModel };
