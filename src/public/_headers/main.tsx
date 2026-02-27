# Cloudflare Pages HTTP Headers

# Security & Caching für alle Seiten
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  X-XSS-Protection: 1; mode=block

# Statische Assets lange cachen (Vite hashed filenames)
/assets/*
  Cache-Control: public, max-age=31536000, immutable

# HTML niemals cachen (immer aktuell)
/*.html
  Cache-Control: no-cache, no-store, must-revalidate

# Root HTML
/
  Cache-Control: no-cache, no-store, must-revalidate
