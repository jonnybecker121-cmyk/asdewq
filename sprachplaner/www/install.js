// Native Android bundles the same assets and does not need a service worker.
if (/^https?:$/.test(window.location.protocol) && 'serviceWorker' in navigator && !window.Capacitor?.isNativePlatform()) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(error => console.warn('Offline-Installation fehlgeschlagen', error));
  });
}
