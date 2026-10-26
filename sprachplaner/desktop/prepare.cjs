const { cpSync, readFileSync, writeFileSync, rmSync } = require('node:fs');
const path = require('node:path');
const source = path.join(__dirname, '..', 'www');
const target = path.join(__dirname, 'web');
rmSync(target, { recursive: true, force: true });
cpSync(source, target, { recursive: true });
const html = readFileSync(path.join(target, 'index.html'), 'utf8')
  .replace('</head>', '<link rel="stylesheet" href="./desktop.css" /></head>');
writeFileSync(path.join(target, 'index.html'), html);
cpSync(path.join(__dirname, 'desktop.css'), path.join(target, 'desktop.css'));
console.log('Desktop assets ready.');
