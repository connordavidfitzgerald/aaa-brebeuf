import { gsap } from 'gsap';
import { revealLines } from '../split';
import { animateBlocks } from './content';
import type { SlideController } from '../deck';

const index: SlideController = {
  enter(el) {
    const tl = gsap.timeline();
    animateBlocks(tl, el, 0, 0.6);

    // Each tile's big number + title rises once its tile has opened.
    el.querySelectorAll<HTMLElement>('[data-goto]').forEach((tile, i) => {
      revealLines(tl, [...tile.querySelectorAll<HTMLElement>('[data-display]')], 0.35 + i * 0.07, {
        stagger: 0.06,
        duration: 0.9,
      });
    });
    return tl;
  },
};

export default index;
