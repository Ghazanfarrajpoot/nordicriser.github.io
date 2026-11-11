function toggleMenu() {
  const navLinks = document.getElementById('navLinks');
  const toggle = document.querySelector('.mobile-toggle');
  const isOpen = navLinks.classList.toggle('open');
  if (toggle) toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
}

document.addEventListener('click', function (e) {
  if (!e.target.closest('.navbar')) {
    const navLinks = document.getElementById('navLinks');
    const toggle = document.querySelector('.mobile-toggle');
    if (navLinks) navLinks.classList.remove('open');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
  }
});

const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  });
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.1 });
document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));

// Contact page: pre-select the enquiry purpose from a ?purpose= query param
// (used by the NR-BOS trial CTA) and prefill the message field to match.
const purposeSelect = document.getElementById('purpose');
if (purposeSelect) {
  const requestedPurpose = new URLSearchParams(window.location.search).get('purpose');
  const matchingOption = requestedPurpose &&
    Array.from(purposeSelect.options).find((opt) => opt.value === requestedPurpose);
  if (matchingOption) {
    purposeSelect.value = requestedPurpose;
    const messageField = document.getElementById('message');
    if (messageField && !messageField.value && messageField.dataset.trialPrefill && requestedPurpose === 'nrbos-trial') {
      messageField.value = messageField.dataset.trialPrefill;
    }
  }
}

// Cloud Functions base for the two real endpoints below (F7) - both are
// public onRequest functions (no Firebase SDK loaded on this static site),
// CORS-restricted to this origin, rate-limited per IP server-side.
const FUNCTIONS_BASE = 'https://us-central1-nordicrisercom.cloudfunctions.net';

// Contact page: previously a demo-only client-side "submit" that claimed
// success without sending anything anywhere. Now a real POST.
const consultationForm = document.getElementById('consultationForm');
if (consultationForm) {
  consultationForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const submitBtn = consultationForm.querySelector('.btn-submit');
    const fd = new FormData(consultationForm);
    const payload = {
      firstName: fd.get('firstName'), lastName: fd.get('lastName'), email: fd.get('email'),
      businessType: fd.get('businessType'), purpose: fd.get('purpose'),
      budget: fd.get('budget'), timeline: fd.get('timeline'), message: fd.get('message'),
      locale: document.documentElement.lang,
    };
    if (submitBtn) submitBtn.disabled = true;
    fetch(`${FUNCTIONS_BASE}/submitConsultationRequest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) throw new Error('request failed');
        consultationForm.style.display = 'none';
        const success = document.getElementById('formSuccess');
        if (success) success.style.display = 'block';
      })
      .catch(() => {
        if (submitBtn) submitBtn.disabled = false;
        const status = document.getElementById('formError');
        if (status) { status.hidden = false; status.textContent = consultationForm.dataset.errorText; }
      });
  });
}

// Global Reach "Notify Me" form (F7) - previously GETted to the Contact
// page with the email in a query string nothing ever read.
const grNotifyForm = document.getElementById('grNotifyForm');
if (grNotifyForm) {
  grNotifyForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const emailInput = document.getElementById('grNotifyEmail');
    const consentInput = document.getElementById('grNotifyConsent');
    const status = document.getElementById('grNotifyStatus');
    const submitBtn = grNotifyForm.querySelector('button[type="submit"]');

    const showStatus = (text, kind) => {
      if (!status) return;
      status.hidden = false;
      status.textContent = text;
      status.className = 'gr-form-status is-' + kind;
    };

    if (submitBtn) submitBtn.disabled = true;
    fetch(`${FUNCTIONS_BASE}/notifyLanguageInterest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: emailInput.value,
        consent: consentInput.checked,
        locale: grNotifyForm.dataset.locale,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('request failed');
        showStatus(grNotifyForm.dataset.successText, 'success');
        grNotifyForm.reset();
      })
      .catch(() => {
        showStatus(grNotifyForm.dataset.errorText, 'error');
      })
      .finally(() => {
        if (submitBtn) submitBtn.disabled = false;
      });
  });
}

// Global Reach hero demo: a client-side-only illustration of timezone-aware
// presence badges next to a scratch notes textarea. No backend calls, no
// persistence - purely so a visitor can see what a live room looks like
// before signing up. Each demo participant's clock is a fixed illustrative
// timezone (not derived from any real user data).
const grPresenceRoot = document.querySelector('[data-gr-presence]');
if (grPresenceRoot) {
  const DEMO_TIMEZONES = {
    SV: 'Europe/Stockholm',
    UR: 'Asia/Karachi',
    EN: 'America/New_York',
    AR: 'Asia/Dubai',
    DE: 'Europe/Berlin',
    PL: 'Europe/Warsaw',
  };
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const renderTimes = () => {
    grPresenceRoot.querySelectorAll('[data-gr-lang]').forEach((badge) => {
      const tz = DEMO_TIMEZONES[badge.dataset.grLang];
      const timeEl = badge.querySelector('[data-gr-time]');
      if (!tz || !timeEl) return;
      try {
        timeEl.textContent = new Intl.DateTimeFormat(undefined, {
          hour: 'numeric', minute: '2-digit', timeZone: tz,
        }).format(new Date());
      } catch (err) {
        timeEl.textContent = '';
      }
    });
  };

  renderTimes();
  // A static demo doesn't need a ticking clock; skip the interval entirely
  // under reduced-motion and just show one still frame.
  if (!prefersReducedMotion) {
    setInterval(renderTimes, 60000);
  }
}

// NR-BOS demo request form: same demo-only client-side "submit" pattern.
const nrbosDemoForm = document.getElementById('nrbosDemoForm');
if (nrbosDemoForm) {
  nrbosDemoForm.addEventListener('submit', function (e) {
    e.preventDefault();
    nrbosDemoForm.style.display = 'none';
    const success = document.getElementById('nrbosDemoFormSuccess');
    if (success) success.style.display = 'block';
  });
}
