import { gsap } from 'gsap';
import { revealLines } from '../split';
import { animateBlocks } from './content';
import type { SlideController } from '../deck';

/** Pattern labels blink on in random order — hard cuts, no fades. */
export function flickerCells(tl: gsap.core.Timeline, root: HTMLElement, at = 0) {
  const cells = root.querySelectorAll<HTMLElement>('[data-cell]');
  tl.fromTo(
    cells,
    { autoAlpha: 0 },
    { autoAlpha: 1, duration: 0.01, ease: 'none', stagger: { each: 0.005, from: 'random' } },
    at,
  );
  return tl;
}

const section: SlideController = {
  enter(el) {
    const tl = gsap.timeline();
    flickerCells(tl, el, 0);
    animateBlocks(tl, el, 0.05);
    revealLines(tl, [...el.querySelectorAll<HTMLElement>('[data-display]')], 0.1, {
      stagger: 0.08,
      duration: 0.95,
    });
    return tl;
  },
};

export default section;
