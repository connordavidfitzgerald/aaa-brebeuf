import { gsap } from 'gsap';
import title from './slides/title';
import statement from './slides/statement';
import credits from './slides/credits';
import type from './slides/type';
import videos from './slides/videos';
import { reducedMotion } from './motion';

export interface SlideController {
  /** Build the slide's entrance. Returned timeline is nested into the wipe. */
  enter?(el: HTMLElement): gsap.core.Timeline | void;
  /** Called once the slide is fully covered — stop loops here. */
  leave?(el: HTMLElement): void;
  /** Called once on boot, before anything is shown (preloading etc). */
  init?(el: HTMLElement): void;
}

// Keyed by each slide's `data-slide` attribute. New slide → add a module here.
const registry: Record<string, SlideController> = { title, statement, credits, type, videos };

const WIPE = 0.9;

const slides = [...document.querySelectorAll<HTMLElement>('.slide')];
const enterTls = new WeakMap<HTMLElement, gsap.core.Timeline>();
let current = -1;
let busy = false;

const ctrl = (el: HTMLElement) => registry[el.dataset.slide ?? ''] ?? {};

function leave(el: HTMLElement) {
  enterTls.get(el)?.kill();
  enterTls.delete(el);
  ctrl(el).leave?.(el);
  el.classList.remove('is-current');
  gsap.set(el, { clearProps: 'transform,clipPath,opacity,visibility,zIndex' });
}

function go(target: number) {
  const next = gsap.utils.clamp(0, slides.length - 1, target);
  if (next === current || busy) return;

  const prev = current >= 0 ? slides[current] : null;
  const incoming = slides[next];
  const dir = next > current ? 1 : -1;
  busy = true;

  if (prev) prev.style.zIndex = '1';
  incoming.style.zIndex = '2';
  incoming.classList.add('is-current');

  const enterTl = ctrl(incoming).enter?.(incoming) || undefined;
  if (enterTl) {
    enterTl.pause(0);
    enterTls.set(incoming, enterTl);
  }

  const tl = gsap.timeline();

  if (!prev) {
    // First paint: no wipe, just the slide's own entrance.
    if (enterTl) tl.add(() => void enterTl.play(), 0.15);
    tl.call(() => (busy = false), [], 0.15);
  } else if (reducedMotion) {
    tl.fromTo(incoming, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5, ease: 'none' }, 0);
    if (enterTl) tl.add(() => void enterTl.play(), 0.2);
    tl.call(() => { leave(prev); busy = false; }, [], 0.5);
  } else {
    tl.fromTo(
      incoming,
      { clipPath: dir > 0 ? 'inset(100% 0% 0% 0%)' : 'inset(0% 0% 100% 0%)' },
      { clipPath: 'inset(0% 0% 0% 0%)', duration: WIPE, ease: 'power4.inOut' },
      0,
    );
    // Outgoing slide drifts away under the wipe for depth.
    tl.to(prev, { yPercent: -7 * dir, duration: WIPE, ease: 'power4.inOut' }, 0);
    if (enterTl) tl.add(() => void enterTl.play(), WIPE * 0.45);
    tl.call(() => { leave(prev); busy = false; }, [], WIPE);
  }

  current = next;
  history.replaceState(null, '', `#${next + 1}`);
}

const next = () => go(current + 1);
const prev = () => go(current - 1);

function indexFromHash() {
  const n = parseInt(location.hash.slice(1), 10);
  return Number.isFinite(n) ? n - 1 : 0;
}

addEventListener('keydown', (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  switch (e.key) {
    case 'ArrowRight':
    case 'ArrowDown':
    case 'PageDown':
    case ' ':
    case 'Enter':
      e.preventDefault();
      next();
      break;
    case 'ArrowLeft':
    case 'ArrowUp':
    case 'PageUp':
    case 'Backspace':
      e.preventDefault();
      prev();
      break;
    case 'Home':
      go(0);
      break;
    case 'End':
      go(slides.length - 1);
      break;
    case 'f':
    case 'F':
      if (document.fullscreenElement) document.exitFullscreen();
      else document.documentElement.requestFullscreen();
      break;
  }
});

addEventListener('click', (e) => (e.shiftKey ? prev() : next()));
addEventListener('hashchange', () => go(indexFromHash()));

// Hide the cursor while presenting; it comes back on mouse movement.
let idle: number | undefined;
addEventListener('mousemove', () => {
  document.body.classList.remove('no-cursor');
  clearTimeout(idle);
  idle = window.setTimeout(() => document.body.classList.add('no-cursor'), 1800);
});

slides.forEach((el) => ctrl(el).init?.(el));
document.fonts.ready.then(() => go(indexFromHash()));
