function toggleLangMenu() {
  const menu = document.getElementById('langMenu');
  const btn = document.querySelector('.nr-lang-btn');
  if (!menu) return;
  const isOpen = menu.classList.toggle('open');
  if (btn) btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
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
