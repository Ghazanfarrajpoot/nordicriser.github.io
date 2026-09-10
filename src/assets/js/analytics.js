// Inert event instrumentation. This does NOT send data anywhere — no network
// request, no third-party script, no cookies. It only logs to the console in
// local dev so the event names/wiring can be verified before a real,
// privacy-respecting analytics vendor is chosen and wired up here.
const isLocalDev = ['localhost', '127.0.0.1'].includes(window.location.hostname);

function logAnalyticsEvent(name, detail) {
  if (isLocalDev) {
    console.debug('[analytics]', name, detail || '');
  }
}

document.addEventListener('click', function (e) {
  const target = e.target.closest('[data-analytics-event]');
  if (target && target.tagName !== 'FORM') {
    logAnalyticsEvent(target.dataset.analyticsEvent);
  }
});

document.addEventListener('submit', function (e) {
  const form = e.target.closest('[data-analytics-event]');
  if (form) {
    logAnalyticsEvent(form.dataset.analyticsEvent);
  }
});
