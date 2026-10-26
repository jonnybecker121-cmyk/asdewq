const { cpSync, readFileSync, writeFileSync, rmSync } = require('node:fs');
const path = require('node:path');
const { prepareModel } = require('./speech-model.cjs');
const source = path.join(__dirname, '..', 'www');
const target = path.join(__dirname, 'web');
rmSync(target, { recursive: true, force: true });
cpSync(source, target, { recursive: true });
const html = readFileSync(path.join(target, 'index.html'), 'utf8')
  .replace('<script type="module" src="./app.js"></script>', '<script src="./vosk.js"></script><script src="./speech.js"></script><script type="module" src="./app.js"></script>')
  .replace('</head>', '<link rel="stylesheet" href="./desktop.css" /></head>');
writeFileSync(path.join(target, 'index.html'), html);
cpSync(path.join(__dirname, 'desktop.css'), path.join(target, 'desktop.css'));
// Extract the pinned library's embedded worker so its WASM-specific CSP is
// separate from the UI, which keeps JavaScript eval and connections blocked.
const vosk = readFileSync(require.resolve('vosk-browser'), 'utf8');
const embedded = /var WorkerFactory = createBase64WorkerFactory\('([A-Za-z0-9+/=]+)', null, false\);/.exec(vosk);
if (!embedded) throw new Error('Unexpected Vosk worker bundle format');
writeFileSync(path.join(target, 'vosk-worker.js'), Buffer.from(embedded[1], 'base64'));
writeFileSync(path.join(target, 'vosk.js'), vosk.replace(embedded[0], "var WorkerFactory = function () { return new Worker(new URL('./vosk-worker.js', window.location.href)); };"));
cpSync(path.join(__dirname, 'speech.js'), path.join(target, 'speech.js'));
cpSync(path.join(__dirname, 'THIRD_PARTY_NOTICES.txt'), path.join(target, 'THIRD_PARTY_NOTICES.txt'));
prepareModel(target).then(() => console.log('Desktop assets and German speech model ready.')).catch(error => { console.error(error); process.exitCode = 1; });
