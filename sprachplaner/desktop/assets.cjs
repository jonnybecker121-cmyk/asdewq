const TYPES = {
  'index.html': 'text/html; charset=utf-8',
  'app.js': 'text/javascript; charset=utf-8',
  'install.js': 'text/javascript; charset=utf-8',
  'style.css': 'text/css; charset=utf-8',
  'desktop.css': 'text/css; charset=utf-8',
  'manifest.webmanifest': 'application/manifest+json',
  'icons/icon-192.png': 'image/png',
  'icons/icon-512.png': 'image/png',
};

// Only packaged assets are addressable; never expose arbitrary local files.
function resolveAsset(rawURL, method = 'GET') {
  try {
    const url = new URL(rawURL);
    if (method !== 'GET' || url.protocol !== 'sprachplaner:' || url.host !== 'app' || url.username || url.password) return null;
    const name = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname).slice(1);
    return Object.hasOwn(TYPES, name) ? { name, type: TYPES[name] } : null;
  } catch {
    return null;
  }
}

const CSP = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'none'; object-src 'none'; base-uri 'none'; frame-src 'none'; frame-ancestors 'none'; form-action 'none'; worker-src 'none'";
module.exports = { resolveAsset, CSP };
