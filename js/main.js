/* ==========================================================================
   Entry point – boots navigation, components and the motion system.
   ========================================================================== */
(function () {
  'use strict';
  const AMS = window.AMS || {};
  const run = (name, fn) => { try { fn && fn(); } catch (err) { console.error(`[AMS] ${name} failed`, err); if (name === 'animations') document.documentElement.classList.add('anim-off'); } };

  run('navigation', AMS.initNavigation);
  run('components', AMS.initComponents);
  run('animations', AMS.initAnimations);
})();
