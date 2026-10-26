const test = require('node:test');
const assert = require('node:assert/strict');
const { resolveAsset, CSP } = require('../assets.cjs');

test('Local app origin serves only explicitly packaged assets', () => {
  assert.equal(resolveAsset('sprachplaner://app/').name, 'index.html');
  assert.equal(resolveAsset('sprachplaner://app/app.js?cache=1').type, 'text/javascript; charset=utf-8');
  for (const url of [
    'https://app/app.js', 'sprachplaner://evil/app.js',
    'sprachplaner://app/main.cjs', 'sprachplaner://app/%2e%2e%2fmain.cjs',
    'sprachplaner://app/icons/%2e%2e%5cmain.cjs', 'sprachplaner://app/%',
    'sprachplaner://user@ app/app.js', 'file:///etc/passwd',
  ]) assert.equal(resolveAsset(url), null, url);
  assert.equal(resolveAsset('sprachplaner://app/app.js', 'POST'), null);
});

test('Renderer policy blocks remote connections and executable embedding', () => {
  for (const directive of ["connect-src 'none'", "object-src 'none'", "frame-src 'none'", "script-src 'self'", "worker-src 'self'"]) {
    assert.ok(CSP.includes(directive));
  }
});
