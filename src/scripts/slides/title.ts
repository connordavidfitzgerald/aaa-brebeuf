import { gsap } from 'gsap';
import { revealLines } from '../split';
import type { SlideController } from '../deck';

const title: SlideController = {
  enter(el) {
    const tl = gsap.timeline();
    const chars = el.querySelectorAll<HTMLElement>('[data-char]');

    // Letters rise up out of the bottom edge; the dots hard-cut in behind them.
    chars.forEach((c, i) => {
      const at = i * 0.08;
      if (c.dataset.char === 'dot') {
        tl.fromTo(c, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01, ease: 'none' }, at + 0.3);
      } else {
        tl.fromTo(c, { yPercent: 105 }, { yPercent: 0, duration: 0.95, ease: 'expo.out' }, at);
      }
    });

    revealLines(tl, el.querySelectorAll<HTMLElement>('[data-split]'), 0.25);
    return tl;
  },
};

export default title;
