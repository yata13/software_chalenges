/**
 * Netlify's free plan adds a fixed "Powered by Netlify" badge (an iframe,
 * #nl-badge-frame) to the bottom-right corner. It must stay visible on that
 * plan, but it covered our bottom buttons. So we measure it and expose its
 * height as the CSS variable --nl-lift: the bottom bars add that much space
 * under their buttons, and the badge sits in its own strip below them.
 * On hosts without the badge, --nl-lift is 0 and nothing changes.
 */
export function watchNetlifyBadge() {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  let watched: Element | null = null;
  let ro: ResizeObserver | null = null;

  const update = () => {
    const frame = document.getElementById('nl-badge-frame') ?? document.getElementById('nl-hud-frame');
    if (frame !== watched) {
      ro?.disconnect();
      ro = null;
      watched = frame;
      if (frame && 'ResizeObserver' in window) { ro = new ResizeObserver(update); ro.observe(frame); }
    }
    const h = frame ? Math.round(frame.getBoundingClientRect().height) : 0;
    // ignore odd sizes (e.g. an expanded panel): never lift more than a third of the screen
    root.style.setProperty('--nl-lift', `${h > 0 && h < window.innerHeight / 3 ? h : 0}px`);
  };

  update();
  const start = () => new MutationObserver(update).observe(document.body, { childList: true });
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
  window.addEventListener('resize', update);
}
