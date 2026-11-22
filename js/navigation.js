/* ==========================================================================
   Navigation – sticky header, desktop dropdowns, mobile menu
   ========================================================================== */
(function () {
  'use strict';
  const AMS = (window.AMS = window.AMS || {});
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const desktop = window.matchMedia('(min-width: 1024px)');

  /* ---------- Sticky header ---------- */
  function initHeader() {
    const header = document.querySelector('[data-header]');
    if (!header) return;
    let lastY = window.scrollY;
    let ticking = false;

    const update = () => {
      const y = window.scrollY;
      header.classList.toggle('is-scrolled', y > 24);
      const menuOpen = document.documentElement.classList.contains('menu-open');
      const dropdownOpen = header.querySelector('.nav__item.is-open');
      if (!menuOpen && !dropdownOpen) {
        header.classList.toggle('is-hidden', y > 480 && y > lastY + 2);
        if (y < lastY - 2) header.classList.remove('is-hidden');
      }
      lastY = y;
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    header.addEventListener('focusin', () => header.classList.remove('is-hidden'));
    update();
  }

  /* ---------- Desktop dropdowns ---------- */
  function initDropdowns() {
    const items = document.querySelectorAll('[data-dropdown]');
    items.forEach((item) => {
      const trigger = item.querySelector('.nav__link');
      let closeTimer;

      const open = () => {
        clearTimeout(closeTimer);
        items.forEach((other) => other !== item && close(other));
        item.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
      };
      const close = (el = item) => {
        el.classList.remove('is-open');
        el.querySelector('.nav__link').setAttribute('aria-expanded', 'false');
      };
      item._close = close;

      item.addEventListener('mouseenter', () => finePointer.matches && open());
      item.addEventListener('mouseleave', () => {
        if (!finePointer.matches) return;
        closeTimer = setTimeout(() => close(), 180);
      });

      // Touch devices: first tap opens the menu, second tap follows the link.
      trigger.addEventListener('click', (e) => {
        if (!finePointer.matches && !item.classList.contains('is-open')) {
          e.preventDefault();
          open();
        }
      });

      // Keyboard: ArrowDown / Space opens and focuses the first item.
      trigger.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown' || e.key === ' ') {
          e.preventDefault();
          open();
          const first = item.querySelector('.dropdown a');
          first && first.focus();
        }
      });
      item.addEventListener('keydown', (e) => {
        const links = [...item.querySelectorAll('.dropdown a')];
        const idx = links.indexOf(document.activeElement);
        if (e.key === 'Escape') { close(); trigger.focus(); }
        if (idx > -1 && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
          e.preventDefault();
          const next = e.key === 'ArrowDown' ? (idx + 1) % links.length : (idx - 1 + links.length) % links.length;
          links[next].focus();
        }
      });
      item.addEventListener('focusout', (e) => {
        if (!item.contains(e.relatedTarget)) close();
      });
      // Open the panel when keyboard focus lands inside it (e.g. Shift+Tab back into it)
      item.querySelector('.dropdown').addEventListener('focusin', open);
    });

    document.addEventListener('click', (e) => {
      items.forEach((item) => { if (!item.contains(e.target)) item._close(); });
    });
  }

  /* ---------- Mobile menu ---------- */
  function initMobileMenu() {
    const toggle = document.querySelector('[data-menu-toggle]');
    const menu = document.querySelector('[data-mobile-menu]');
    if (!toggle || !menu) return;
    const root = document.documentElement;
    const main = document.getElementById('main');
    const footer = document.querySelector('.site-footer');

    const setOpen = (open) => {
      menu.classList.toggle('is-open', open);
      root.classList.toggle('menu-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      [main, footer].forEach((el) => el && (open ? el.setAttribute('inert', '') : el.removeAttribute('inert')));
      if (AMS.lenis) open ? AMS.lenis.stop() : AMS.lenis.start();
      if (open) {
        const first = menu.querySelector('a, button');
        setTimeout(() => first && first.focus({ preventScroll: true }), 300);
      }
    };
    AMS.closeMenu = () => setOpen(false);

    toggle.addEventListener('click', () => setOpen(!menu.classList.contains('is-open')));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) { setOpen(false); toggle.focus(); }
    });
    menu.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
    desktop.addEventListener('change', (e) => e.matches && setOpen(false));

    // Keep focus inside header + menu while open
    menu.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      const focusables = [...menu.querySelectorAll('a, button')].filter((el) => el.offsetParent !== null);
      const last = focusables[focusables.length - 1];
      if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); toggle.focus(); }
    });

    menu.querySelectorAll('[data-submenu-toggle]').forEach((btn) => {
      const panel = document.getElementById(btn.getAttribute('aria-controls'));
      btn.addEventListener('click', () => {
        const open = btn.getAttribute('aria-expanded') !== 'true';
        btn.setAttribute('aria-expanded', String(open));
        panel.classList.toggle('is-open', open);
      });
    });
  }

  AMS.initNavigation = function () {
    initHeader();
    initDropdowns();
    initMobileMenu();
  };
})();
