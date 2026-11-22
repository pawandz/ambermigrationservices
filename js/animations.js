/* ==========================================================================
   Motion system – GSAP + ScrollTrigger + SplitText, Lenis smooth scrolling
   All content is visible without JS; animations only enhance.
   ========================================================================== */
(function () {
  'use strict';
  const AMS = (window.AMS = window.AMS || {});

  // Motion tokens (mirrors CSS custom properties in scss/abstracts/_tokens.scss)
  const M = {
    micro: 0.2,
    base: 0.35,
    reveal: 0.75,
    hero: 0.95,
    stagger: 0.08,
    ease: 'power3.out',
    easeSoft: 'power2.out',
    easeInOut: 'power2.inOut',
  };
  AMS.motion = M;

  const root = document.documentElement;
  const fontsReady = () => Promise.race([
    document.fonts ? document.fonts.ready : Promise.resolve(),
    new Promise((r) => setTimeout(r, 900)),
  ]);

  function showEverything() {
    clearTimeout(window.__amsFallback);
    root.classList.add('anim-off');
  }

  /* ---------- Smooth scroll ---------- */
  function initLenis() {
    if (!window.Lenis) return;
    const lenis = new Lenis({ duration: 1.05, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true, wheelMultiplier: 1 });
    AMS.lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    // In-page anchors scroll through Lenis (header offset aware)
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href*="#"]');
      if (!a) return;
      const url = new URL(a.href, location.href);
      if (url.pathname !== location.pathname || !url.hash || url.hash === '#') return;
      const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -90 });
      history.pushState(null, '', url.hash);
      if (target.id === 'main') target.focus({ preventScroll: true });
    });
    // Arriving with a hash from another page
    if (location.hash) {
      const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (target) setTimeout(() => lenis.scrollTo(target, { offset: -90, immediate: true }), 60);
    }
  }

  /* ---------- Hero ---------- */
  function initHero() {
    const hero = document.querySelector('[data-hero]');
    if (!hero) return;
    const title = hero.querySelector('[data-hero-title]');
    const tl = gsap.timeline({ defaults: { ease: M.ease } });

    gsap.set(hero.querySelectorAll('[data-hero-item]'), { opacity: 1 });
    if (title && window.SplitText) {
      const split = SplitText.create(title, { type: 'lines', mask: 'lines', linesClass: 'split-line' });
      tl.from(split.lines, { yPercent: 105, duration: M.hero, stagger: 0.1 }, 0.15);
    }
    tl.from(hero.querySelectorAll('[data-hero-fade]'), { y: 24, opacity: 0, duration: 0.8, stagger: 0.08 }, 0.55)
      .from(hero.querySelectorAll('[data-hero-cta] > *'), { y: 18, opacity: 0, duration: 0.6, stagger: 0.09 }, 0.75);

    const main = hero.querySelector('.hero__main');
    if (main) {
      tl.fromTo(main, { clipPath: 'inset(100% 0% 0% 0% round 220px 220px 28px 28px)' }, { clipPath: 'inset(0% 0% 0% 0% round 220px 220px 28px 28px)', duration: 1.3, ease: 'power4.inOut' }, 0.1)
        .from(main.querySelector('img'), { scale: 1.25, duration: 1.6, ease: 'power3.out' }, 0.1);
    }
    tl.from(hero.querySelectorAll('[data-hero-float]'), { y: 30, opacity: 0, scale: 0.94, duration: 0.8, stagger: 0.12, ease: 'back.out(1.4)' }, 0.95)
      .from(hero.querySelector('.hero__arc path'), { strokeDashoffset: 1200, duration: 1.8, ease: M.easeInOut }, 0.6);

    // Scroll parallax
    if (main) {
      gsap.to(main.querySelector('img'), { yPercent: -10, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
    }
    hero.querySelectorAll('[data-hero-float]').forEach((el, i) => {
      gsap.to(el, { y: (i % 2 ? -1 : 1) * (40 + i * 15), ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
    });

    // Destination ticker in the boarding-pass card
    const dest = hero.querySelector('[data-rotator]');
    if (dest) {
      const words = dest.dataset.rotator.split('|');
      const span = dest.querySelector('span');
      let i = 0;
      gsap.timeline({ repeat: -1, delay: 2.5, repeatDelay: 0 })
        .to(span, { yPercent: -100, opacity: 0, duration: 0.45, ease: 'power2.in', delay: 2.2 })
        .call(() => { i = (i + 1) % words.length; span.textContent = words[i]; })
        .fromTo(span, { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.55, ease: M.ease });
    }
  }

  /* ---------- Split headings ---------- */
  function initSplitHeadings() {
    if (!window.SplitText) return;
    document.querySelectorAll('[data-split]').forEach((el) => {
      const byWords = el.dataset.split === 'words';
      SplitText.create(el, {
        type: byWords ? 'words,lines' : 'lines',
        mask: byWords ? 'words' : 'lines',
        linesClass: 'split-line', wordsClass: 'split-word',
        autoSplit: true,
        onSplit(self) {
          return gsap.from(byWords ? self.words : self.lines, {
            yPercent: 110, duration: M.reveal + 0.1, ease: M.ease, stagger: byWords ? 0.04 : M.stagger,
            scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          });
        },
      });
    });
  }

  /* ---------- Generic reveals ---------- */
  const VARIANTS = {
    up: { y: 40, opacity: 0 },
    fade: { opacity: 0 },
    left: { x: -50, opacity: 0 },
    right: { x: 50, opacity: 0 },
    scale: { scale: 0.96, opacity: 0, transformOrigin: '50% 60%' },
  };

  function initReveals() {
    document.querySelectorAll('[data-reveal]').forEach((el) => {
      const from = VARIANTS[el.dataset.reveal] || VARIANTS.up;
      gsap.from(el, { ...from, duration: M.reveal, ease: M.ease, delay: parseFloat(el.dataset.delay || 0),
        scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
    });

    document.querySelectorAll('[data-stagger]').forEach((group) => {
      const items = group.children;
      const from = VARIANTS[group.dataset.stagger] || VARIANTS.up;
      gsap.from(items, { ...from, duration: M.reveal, ease: M.ease, stagger: 0.1,
        scrollTrigger: { trigger: group, start: 'top 85%', once: true } });
    });

    // Clip-path image reveals (direction via data-clip="up|left|right")
    document.querySelectorAll('[data-clip]').forEach((el) => {
      const dir = el.dataset.clip || 'up';
      const start = { up: 'inset(100% 0% 0% 0%)', left: 'inset(0% 100% 0% 0%)', right: 'inset(0% 0% 0% 100%)' }[dir];
      const img = el.querySelector('img');
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
      tl.fromTo(el, { clipPath: start }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: 'power4.inOut' });
      if (img) tl.from(img, { scale: 1.2, duration: 1.6, ease: M.ease }, 0);
    });

    // Parallax
    document.querySelectorAll('[data-parallax]').forEach((el) => {
      const amt = parseFloat(el.dataset.parallax) || 10;
      gsap.fromTo(el, { yPercent: -amt / 2 }, { yPercent: amt / 2, ease: 'none',
        scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
  }

  /* ---------- Process timeline ---------- */
  function initTimeline() {
    document.querySelectorAll('[data-timeline]').forEach((tl) => {
      const bar = tl.querySelector('.timeline__line span');
      const steps = tl.querySelectorAll('.timeline__step');
      const mm = gsap.matchMedia();
      mm.add({ desktop: '(min-width: 1024px)', mobile: '(max-width: 1023.98px)' }, (ctx) => {
        const prop = ctx.conditions.desktop ? 'scaleX' : 'scaleY';
        gsap.fromTo(bar, { [prop]: 0 }, {
          [prop]: 1, ease: 'none',
          scrollTrigger: {
            trigger: tl, start: ctx.conditions.desktop ? 'top 75%' : 'top 70%', end: ctx.conditions.desktop ? 'bottom 55%' : 'bottom 60%', scrub: 0.6,
            onUpdate(self) {
              steps.forEach((s, i) => s.classList.toggle('is-active', self.progress >= (ctx.conditions.desktop ? i / steps.length : i / (steps.length - 0.6)) - 0.001));
            },
          },
        });
        gsap.from(steps, { y: 30, opacity: 0, duration: M.reveal, ease: M.ease, stagger: 0.12, scrollTrigger: { trigger: tl, start: 'top 80%', once: true } });
      });
    });
  }

  /* ---------- Destinations: pinned horizontal rail (desktop) ---------- */
  function initDestinationRail() {
    const rail = document.querySelector('[data-dest-rail]');
    if (!rail) return;
    const track = rail.querySelector('.dest-rail__track');
    const progress = rail.querySelector('.dest-rail__progress span');
    const section = rail.closest('section');

    const mm = gsap.matchMedia();
    mm.add('(min-width: 1024px)', () => {
      rail.classList.add('is-pinned');
      const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
      const tween = gsap.to(track, {
        x: () => -distance(), ease: 'none',
        scrollTrigger: {
          trigger: section, start: 'top top', end: () => '+=' + distance(), pin: true, scrub: 0.8, invalidateOnRefresh: true, anticipatePin: 1,
          onUpdate: (self) => progress && gsap.set(progress, { scaleX: self.progress }),
        },
      });
      gsap.from(track.children, { x: 120, opacity: 0, duration: 1, stagger: 0.08, ease: M.ease, scrollTrigger: { trigger: section, start: 'top 70%', once: true } });
      return () => { rail.classList.remove('is-pinned'); tween.kill(); gsap.set(track, { clearProps: 'transform' }); };
    });
    mm.add('(max-width: 1023.98px)', () => {
      const onScroll = () => progress && gsap.set(progress, { scaleX: track.scrollLeft / Math.max(1, track.scrollWidth - track.clientWidth) });
      track.addEventListener('scroll', onScroll, { passive: true });
      gsap.from(track.children, { y: 40, opacity: 0, duration: M.reveal, stagger: 0.08, ease: M.ease, scrollTrigger: { trigger: rail, start: 'top 85%', once: true } });
      return () => track.removeEventListener('scroll', onScroll);
    });
  }

  /* ---------- "Why choose" scroll storytelling ---------- */
  function initWhyList() {
    document.querySelectorAll('[data-focus-list] > *').forEach((item) => {
      ScrollTrigger.create({ trigger: item, start: 'top 65%', end: 'bottom 35%', toggleClass: 'is-active' });
    });
  }

  /* ---------- Magnetic CTAs (desktop, fine pointer) ---------- */
  function initMagnetic() {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    document.querySelectorAll('[data-magnetic]').forEach((el) => {
      const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' });
      const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' });
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.22);
        yTo((e.clientY - r.top - r.height / 2) * 0.3);
      });
      el.addEventListener('mouseleave', () => { xTo(0); yTo(0); });
    });
  }

  AMS.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  AMS.initAnimations = function () {
    if (!window.gsap || !window.ScrollTrigger || AMS.reducedMotion) { showEverything(); return; }
    clearTimeout(window.__amsFallback);
    gsap.registerPlugin(ScrollTrigger);
    if (window.SplitText) gsap.registerPlugin(SplitText);
    root.classList.add('anim-on');

    initLenis();
    fontsReady().then(() => {
      initHero();
      initSplitHeadings();
      initReveals();
      initTimeline();
      initDestinationRail();
      initWhyList();
      initMagnetic();
      ScrollTrigger.refresh();
    });
    window.addEventListener('load', () => ScrollTrigger.refresh());
  };
})();
