(() => {
  const status = document.getElementById('connectionStatus');
  const update = () => {
    if (status) status.hidden = navigator.onLine;
  };
  window.addEventListener('online', update);
  window.addEventListener('offline', update);
  window.addEventListener('healthbridge:offline-data', () => { if (status) status.hidden = false; });
  update();
  if ('serviceWorker' in navigator && window.isSecureContext) {
    window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
  }
  // Only aggregate measurements: no URLs, identifiers, prompts, or error messages.
  // Respect browser privacy preferences even though this is first-party telemetry.
  if (navigator.doNotTrack === '1' || navigator.globalPrivacyControl) return;
  const send = (payload) => fetch('/api/telemetry', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload), keepalive: true,
  }).catch(() => {});
  if (window.webVitals) {
    const report = ({ name, value }) => send({ name, value: Math.round(value * 1000) / 1000 });
    window.webVitals.onLCP(report);
    window.webVitals.onINP(report);
    window.webVitals.onCLS(report);
  }
  let errorsSent = 0;
  const reportError = () => { if (errorsSent++ < 3) send({ name: 'JS_ERROR', value: 1 }); };
  window.addEventListener('error', reportError);
  window.addEventListener('unhandledrejection', reportError);
})();
