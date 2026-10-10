/* Shared enquiry interactions. Analytics parameters never include form text or contact details. */
(() => {
  'use strict';
  function track(name, parameters) {
    try {
      if (typeof window.gtag === 'function') window.gtag('event', name, parameters);
    } catch (_) { /* Analytics must not interrupt enquiries. */ }
  }
  window.aspecTrack = track;
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href]');
    if (!link) return;
    const href = link.getAttribute('href');
    if (href.startsWith('tel:') || href.startsWith('mailto:')) {
      track('contact_click', {contact_method: href.startsWith('tel:') ? 'phone' : 'email'});
      return;
    }
    const url = new URL(href, window.location.href);
    if (url.origin === window.location.origin && url.pathname === '/contact.html') {
      // Only a fixed event label: arbitrary query strings are never copied into event parameters.
      track('inquiry_click', {contact_method: 'form'});
    }
  });
  const menu = document.querySelector('.site-mobile-menu');
  if (menu) {
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && menu.open) {
        menu.open = false;
        menu.querySelector('summary').focus();
      }
    });
    document.addEventListener('click', (event) => {
      if (menu.open && !menu.contains(event.target)) menu.open = false;
    });
    menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => { menu.open = false; }));
  }
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('video[autoplay]').forEach(video => {
      video.pause();
      video.removeAttribute('autoplay');
    });
  }
})();
