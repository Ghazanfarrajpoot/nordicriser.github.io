/**
 * NR-BOS interactive overview — launcher card + tabbed modal.
 *
 * Vanilla JS, no build step (this site has no bundler). Event-delegated and
 * data-attribute driven so more than one product launcher can exist on a
 * page without extra wiring — each widget is identified by a slug shared
 * between the launcher button (data-nrb2-open) and its overlay
 * (data-nrb2-overlay).
 *
 * Deep-linking contract: ?product=<slug>&view=<panel> opens the matching
 * launcher directly to that panel on load. Opening pushes a history entry;
 * switching tabs replaces it; browser back pops the entry and closes the
 * modal without leaving the page.
 */
(function () {
  'use strict';

  var FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function qsa(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  function trapFocus(e, modal) {
    if (e.key !== 'Tab') return;
    var focusable = qsa(FOCUSABLE, modal).filter(function (el) { return el.offsetParent !== null; });
    if (!focusable.length) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  }

  function Widget(overlay) {
    this.overlay = overlay;
    this.product = overlay.getAttribute('data-nrb2-overlay');
    this.modal = overlay.querySelector('[data-nrb2-modal]');
    this.tabs = qsa('[data-nrb2-tab]', overlay);
    this.panels = qsa('[data-nrb2-panel]', overlay);
    this.closeBtn = overlay.querySelector('[data-nrb2-close]');
    this.launcher = document.querySelector('[data-nrb2-open="' + this.product + '"]');
    this.lastFocused = null;
    this.prefetched = false;

    this._onKeydown = this._onKeydown.bind(this);
    this._onOverlayClick = this._onOverlayClick.bind(this);

    if (this.launcher) {
      this.launcher.addEventListener('click', this._open.bind(this, null, true));
      this.launcher.addEventListener('pointerenter', this.prefetchFirstPanel.bind(this));
      this.launcher.addEventListener('focus', this.prefetchFirstPanel.bind(this));
    }
    if (this.closeBtn) this.closeBtn.addEventListener('click', this._requestClose.bind(this));
    this.overlay.addEventListener('mousedown', this._onOverlayClick);

    this.tabs.forEach(function (tab, i) {
      tab.addEventListener('click', this._activateTab.bind(this, tab, true));
      tab.addEventListener('keydown', this._onTabKeydown.bind(this, i));
    }, this);
  }

  Widget.prototype.prefetchFirstPanel = function () {
    if (this.prefetched) return;
    this.prefetched = true;
    var active = this.panels.filter(function (p) { return p.classList.contains('is-active'); })[0] || this.panels[0];
    if (!active) return;
    qsa('img[loading="lazy"]', active).forEach(function (img) {
      img.loading = 'eager';
      img.setAttribute('fetchpriority', 'high');
    });
  };

  Widget.prototype.viewFromTab = function (tab) { return tab.getAttribute('data-nrb2-tab'); };

  Widget.prototype._activateTab = function (tab, userInitiated) {
    var view = this.viewFromTab(tab);
    this.tabs.forEach(function (t) {
      var selected = t === tab;
      t.setAttribute('aria-selected', selected ? 'true' : 'false');
      t.tabIndex = selected ? 0 : -1;
    });
    this.panels.forEach(function (p) {
      p.classList.toggle('is-active', p.getAttribute('data-nrb2-panel') === view);
    });
    var activePanel = this.panels.filter(function (p) { return p.classList.contains('is-active'); })[0];
    if (activePanel) {
      qsa('img[loading="lazy"]', activePanel).forEach(function (img) { img.loading = 'eager'; });
    }
    if (userInitiated && this.isOpen()) this._syncUrl(view, 'replace');
  };

  Widget.prototype._onTabKeydown = function (index, e) {
    var count = this.tabs.length;
    var next = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (index + 1) % count;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (index - 1 + count) % count;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = count - 1;
    else return;
    e.preventDefault();
    var tab = this.tabs[next];
    tab.focus();
    this._activateTab(tab, true);
  };

  Widget.prototype.isOpen = function () { return !this.overlay.hasAttribute('hidden'); };

  Widget.prototype._open = function (view, userInitiated) {
    if (this.isOpen()) return;
    this.lastFocused = document.activeElement;
    this.overlay.removeAttribute('hidden');
    document.documentElement.classList.add('nrb2-lock');
    document.addEventListener('keydown', this._onKeydown);

    var targetTab = view ? this.tabs.filter(function (t) { return t.getAttribute('data-nrb2-tab') === view; })[0] : null;
    this._activateTab(targetTab || this.tabs[0], false);

    if (userInitiated) this._syncUrl(this.viewFromTab(targetTab || this.tabs[0]), 'push');

    var focusTarget = this.closeBtn || this.modal;
    window.setTimeout(function () { focusTarget.focus(); }, 0);
  };

  Widget.prototype._requestClose = function () {
    // If we pushed a history entry for this open state, going back pops it
    // cleanly and popstate does the actual close — keeps back/forward sane.
    if (history.state && history.state.nrb2 === this.product) {
      history.back();
    } else {
      this._close();
      this._syncUrl(null, 'replace');
    }
  };

  Widget.prototype._close = function () {
    if (!this.isOpen()) return;
    this.overlay.setAttribute('hidden', '');
    document.documentElement.classList.remove('nrb2-lock');
    document.removeEventListener('keydown', this._onKeydown);
    var toFocus = this.lastFocused || this.launcher;
    if (toFocus) toFocus.focus();
  };

  Widget.prototype._onKeydown = function (e) {
    if (e.key === 'Escape') { e.preventDefault(); this._requestClose(); return; }
    trapFocus(e, this.modal);
  };

  Widget.prototype._onOverlayClick = function (e) {
    if (e.target === this.overlay) this._requestClose();
  };

  Widget.prototype._syncUrl = function (view, mode) {
    var url = new URL(window.location.href);
    if (view) {
      url.searchParams.set('product', this.product);
      url.searchParams.set('view', view);
    } else {
      url.searchParams.delete('product');
      url.searchParams.delete('view');
    }
    var state = view ? { nrb2: this.product, view: view } : null;
    if (mode === 'push') history.pushState(state, '', url);
    else history.replaceState(state, '', url);
  };

  Widget.prototype.openFromUrl = function (view) { this._open(view, false); };

  function initSliders(root) {
    qsa('[data-nrb2-slider]', root).forEach(function (slider) {
      var stage = slider.querySelector('.nrb2-slider__stage');
      var range = slider.querySelector('input[type="range"]');
      if (!stage || !range) return;

      function setSplit(pct) {
        pct = Math.max(0, Math.min(100, pct));
        stage.style.setProperty('--nrb2-split', pct + '%');
        range.value = pct;
      }

      range.addEventListener('input', function () { setSplit(parseFloat(range.value)); });

      var dragging = false;
      var rtl = getComputedStyle(slider).direction === 'rtl';

      function pctFromEvent(e) {
        var rect = stage.getBoundingClientRect();
        var x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
        var pct = (x / rect.width) * 100;
        return rtl ? 100 - pct : pct;
      }

      stage.addEventListener('pointerdown', function (e) {
        dragging = true;
        stage.setPointerCapture(e.pointerId);
        setSplit(pctFromEvent(e));
      });
      stage.addEventListener('pointermove', function (e) { if (dragging) setSplit(pctFromEvent(e)); });
      ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (evt) {
        stage.addEventListener(evt, function () { dragging = false; });
      });
    });
  }

  function init() {
    var widgets = qsa('[data-nrb2-overlay]').map(function (overlay) { return new Widget(overlay); });
    initSliders(document);

    window.addEventListener('popstate', function () {
      var params = new URLSearchParams(window.location.search);
      var product = params.get('product');
      widgets.forEach(function (w) {
        if (w.product !== product && w.isOpen()) w._close();
      });
    });

    var params = new URLSearchParams(window.location.search);
    var deepProduct = params.get('product');
    var deepView = params.get('view');
    if (deepProduct) {
      var match = widgets.filter(function (w) { return w.product === deepProduct; })[0];
      if (match) match.openFromUrl(deepView);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
