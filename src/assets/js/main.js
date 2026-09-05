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

// Contact page: demo-only client-side "submit" (no backend wired up yet).
const consultationForm = document.getElementById('consultationForm');
if (consultationForm) {
  consultationForm.addEventListener('submit', function (e) {
    e.preventDefault();
    consultationForm.style.display = 'none';
    const success = document.getElementById('formSuccess');
    if (success) success.style.display = 'block';
  });
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
