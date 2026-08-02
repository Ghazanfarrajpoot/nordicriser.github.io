function toggleLangMenu(btn) {
  const switchEl = btn.closest('.nr-lang-switch');
  const menu = switchEl && switchEl.querySelector('.nr-lang-menu');
  if (!menu) return;
  // Two switcher instances exist per page (desktop/mobile); close the other
  // one in case it was left open from before a viewport resize.
  document.querySelectorAll('.nr-lang-menu.open').forEach(m => {
    if (m !== menu) m.classList.remove('open');
  });
  document.querySelectorAll('.nr-lang-btn[aria-expanded="true"]').forEach(b => {
    if (b !== btn) b.setAttribute('aria-expanded', 'false');
  });
  const isOpen = menu.classList.toggle('open');
  btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
}

document.addEventListener('click', function (e) {
  if (!e.target.closest('.nr-lang-switch')) {
    document.querySelectorAll('.nr-lang-menu').forEach(m => m.classList.remove('open'));
    document.querySelectorAll('.nr-lang-btn').forEach(b => b.setAttribute('aria-expanded', 'false'));
  }
});

document.querySelectorAll('.nr-lang-menu a').forEach(link => {
  link.addEventListener('click', function () {
    const lang = this.getAttribute('data-lang');
    if (lang) {
      try { localStorage.setItem('nr_lang', lang); } catch (e) { /* storage unavailable */ }
    }
  });
});

// First-visit language detection: only runs on the unprefixed English homepage,
// and only once (a stored preference — including a deliberate "stay in English" —
// always wins on every later visit, so this can never create a redirect loop).
(function () {
  try {
    if (document.documentElement.lang !== 'en') return;
    if (window.location.pathname !== '/') return;
    if (localStorage.getItem('nr_lang')) return;
    const supported = Array.from(document.querySelectorAll('.nr-lang-menu a'))
      .map(a => a.getAttribute('data-lang'));
    const preferred = (navigator.languages || [navigator.language || 'en'])
      .map(l => l.split('-')[0].toLowerCase());
    const match = preferred.find(l => supported.includes(l) && l !== 'en');
    localStorage.setItem('nr_lang', match || 'en');
    if (match) window.location.href = '/' + match + '/';
  } catch (e) { /* localStorage or navigator unavailable */ }
})();
