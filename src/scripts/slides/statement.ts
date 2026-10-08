import { gsap } from 'gsap';
import { revealLines } from '../split';
import type { SlideController } from '../deck';

const statement: SlideController = {
  enter(el) {
    return revealLines(gsap.timeline(), el.querySelectorAll<HTMLElement>('[data-split]'), 0, {
      stagger: 0.07,
      duration: 0.95,
    });
  },
};

export default statement;
