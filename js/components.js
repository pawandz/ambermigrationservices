/* ==========================================================================
   Components – accordion, slider, world map, contact form
   ========================================================================== */
(function () {
  'use strict';
  const AMS = (window.AMS = window.AMS || {});

  /* ---------- Accordion ---------- */
  function initAccordions() {
    document.querySelectorAll('[data-accordion]').forEach((acc) => {
      const triggers = acc.querySelectorAll('.accordion__trigger');
      triggers.forEach((btn) => {
        const panel = document.getElementById(btn.getAttribute('aria-controls'));
        btn.addEventListener('click', () => {
          const willOpen = btn.getAttribute('aria-expanded') !== 'true';
          if (acc.dataset.accordion === 'single') {
            triggers.forEach((other) => {
              if (other !== btn && other.getAttribute('aria-expanded') === 'true') {
                other.setAttribute('aria-expanded', 'false');
                document.getElementById(other.getAttribute('aria-controls')).classList.remove('is-open');
              }
            });
          }
          btn.setAttribute('aria-expanded', String(willOpen));
          panel.classList.toggle('is-open', willOpen);
          // panels change page height – keep ScrollTrigger positions accurate
          setTimeout(() => window.ScrollTrigger && window.ScrollTrigger.refresh(), 480);
        });
      });
    });
  }

  /* ---------- Slider ---------- */
  function initSliders() {
    document.querySelectorAll('[data-slider]').forEach((slider) => {
      const track = slider.querySelector('.slider__track');
      const slides = [...slider.querySelectorAll('.slider__slide')];
      const prev = slider.querySelector('[data-slider-prev]');
      const next = slider.querySelector('[data-slider-next]');
      const dotsWrap = slider.querySelector('.slider__dots');
      const live = slider.querySelector('[data-slider-live]');
      if (!track || slides.length < 2) return;
      let index = 0;

      slides.forEach((s, i) => {
        s.setAttribute('role', 'group');
        s.setAttribute('aria-roledescription', 'slide');
        s.setAttribute('aria-label', `${i + 1} of ${slides.length}`);
      });
      const dots = slides.map((_, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('aria-label', `Go to slide ${i + 1}`);
        b.addEventListener('click', () => go(i));
        dotsWrap && dotsWrap.appendChild(b);
        return b;
      });

      function go(i) {
        index = (i + slides.length) % slides.length;
        track.style.transform = `translateX(${-index * 100}%)`;
        slides.forEach((s, n) => {
          const active = n === index;
          s.setAttribute('aria-hidden', String(!active));
          s.querySelectorAll('a, button').forEach((el) => (el.tabIndex = active ? 0 : -1));
        });
        dots.forEach((d, n) => d.setAttribute('aria-current', String(n === index)));
        if (live) live.textContent = `Slide ${index + 1} of ${slides.length}`;
      }
      prev && prev.addEventListener('click', () => go(index - 1));
      next && next.addEventListener('click', () => go(index + 1));
      slider.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') go(index - 1);
        if (e.key === 'ArrowRight') go(index + 1);
      });

      // Swipe
      let startX = null;
      track.addEventListener('pointerdown', (e) => { startX = e.clientX; }, { passive: true });
      window.addEventListener('pointerup', (e) => {
        if (startX === null) return;
        const dx = e.clientX - startX;
        if (Math.abs(dx) > 50) go(index + (dx < 0 ? 1 : -1));
        startX = null;
      }, { passive: true });

      go(0);
    });
  }

  /* ---------- Interactive world map ---------- */
  function initWorldMap() {
    const map = document.querySelector('[data-world]');
    if (!map) return;
    const pins = map.querySelectorAll('.world__pin');
    const panel = map.querySelector('.world__panel');
    const el = (sel) => panel.querySelector(sel);

    const show = (pin) => {
      pins.forEach((p) => p.setAttribute('aria-pressed', String(p === pin)));
      const d = pin.dataset;
      const update = () => {
        el('[data-f="code"]').textContent = d.code;
        el('[data-f="name"]').textContent = d.name;
        el('[data-f="intro"]').textContent = d.intro;
        el('[data-f="services"]').innerHTML = d.services.split('|').map((s) => `<li class="chip">${s}</li>`).join('');
        const link = el('[data-f="link"]');
        link.href = d.link;
        link.querySelector('span').textContent = `Explore ${d.name}`;
      };
      if (window.gsap && !AMS.reducedMotion) {
        const parts = panel.children;
        gsap.to(parts, {
          opacity: 0, y: -8, duration: 0.18, stagger: 0.02, ease: 'power2.in', overwrite: true,
          onComplete: () => { update(); gsap.fromTo(parts, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.45, stagger: 0.05, ease: 'power3.out' }); },
        });
      } else update();
    };
    pins.forEach((pin) => {
      pin.addEventListener('click', () => show(pin));
      pin.addEventListener('mouseenter', () => window.matchMedia('(hover: hover)').matches && pin.getAttribute('aria-pressed') !== 'true' && show(pin));
    });
  }

  /* ---------- Contact form ---------- */
  function initContactForm() {
    const form = document.querySelector('[data-contact-form]');
    if (!form) return;
    const cfg = window.AMS_CONFIG || {};
    const status = form.querySelector('.form__status');
    const submit = form.querySelector('[type="submit"]');
    const submitLabel = submit.querySelector('[data-label]');
    const originalLabel = submitLabel.textContent;

    const messages = {
      valueMissing: 'This field is required.',
      typeMismatch: 'Please enter a valid email address.',
      patternMismatch: 'Please enter a valid phone number (digits, spaces and + only).',
      tooShort: 'Please add a little more detail (at least 10 characters).',
    };
    const errorFor = (field) => {
      const v = field.validity;
      if (v.valid) return '';
      if (field.type === 'checkbox') return 'Please confirm you have read the Privacy Policy.';
      for (const key of Object.keys(messages)) if (v[key]) return messages[key];
      return 'Please check this field.';
    };
    const validate = (field) => {
      const msg = errorFor(field);
      const out = document.getElementById(field.getAttribute('aria-describedby'));
      field.setAttribute('aria-invalid', String(!!msg));
      if (out) out.textContent = msg;
      return !msg;
    };
    const fields = [...form.querySelectorAll('input:not([type="hidden"]):not([name="_gotcha"]), select, textarea')];
    fields.forEach((f) => {
      f.addEventListener('blur', () => f.value && validate(f));
      f.addEventListener('input', () => f.getAttribute('aria-invalid') === 'true' && validate(f));
      f.addEventListener('change', () => f.type === 'checkbox' && validate(f));
    });

    const setStatus = (type, html) => {
      status.className = `form__status is-${type}`;
      status.innerHTML = html;
      status.focus();
    };

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const invalid = fields.filter((f) => !validate(f));
      if (invalid.length) {
        invalid[0].focus();
        setStatus('error', `Please correct ${invalid.length === 1 ? 'the highlighted field' : `the ${invalid.length} highlighted fields`} and try again.`);
        return;
      }
      if (form.querySelector('[name="_gotcha"]').value) return; // bot

      const data = Object.fromEntries(new FormData(form));
      delete data._gotcha;

      // No form service connected yet → hand the enquiry to the visitor's email app.
      // Nothing is sent from the website, so we say exactly that.
      if (!cfg.formEndpoint) {
        const body = [
          `Name: ${data.name}`, `Email: ${data.email}`, `Phone: ${data.phone || '-'}`,
          `Service of interest: ${data.service}`, `Destination: ${data.destination || '-'}`, '', data.message,
        ].join('\n');
        const href = `mailto:${cfg.email}?subject=${encodeURIComponent(`Consultation enquiry – ${data.name}`)}&body=${encodeURIComponent(body)}`;
        setStatus('info',
          `<strong>Your enquiry has not been sent yet.</strong> Online submission isn't connected on this website, so we've opened your email app with your details filled in. Please press <em>Send</em> there to reach us. ` +
          `If nothing opened, <a href="${href}">open the email again</a>, email <a href="mailto:${cfg.email}">${cfg.email}</a> or call <a href="tel:${cfg.phoneHref}">${cfg.phoneDisplay}</a>.`);
        window.location.href = href;
        return;
      }

      // Connected form service (Formspree, Netlify-compatible JSON endpoints, etc.)
      submit.disabled = true;
      submitLabel.textContent = 'Sending…';
      try {
        const res = await fetch(cfg.formEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error(String(res.status));
        form.reset();
        fields.forEach((f) => f.removeAttribute('aria-invalid'));
        setStatus('success', '<strong>Thank you, your enquiry has been received.</strong> A member of our team will reply by email or phone. Submitting an enquiry does not create a client relationship or guarantee any immigration outcome.');
      } catch (err) {
        setStatus('error', `Sorry, we couldn't send your enquiry just now. Please try again, or email <a href="mailto:${cfg.email}">${cfg.email}</a>.`);
      } finally {
        submit.disabled = false;
        submitLabel.textContent = originalLabel;
      }
    });
  }

  AMS.initComponents = function () {
    initAccordions();
    initSliders();
    initWorldMap();
    initContactForm();
    document.querySelectorAll('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear()));
  };
})();
