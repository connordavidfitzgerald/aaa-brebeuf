import { gsap } from 'gsap';
import { revealLines } from '../split';
import type { SlideController } from '../deck';

const credits: SlideController = {
  enter(el) {
    const tl = gsap.timeline();

    revealLines(tl, el.querySelectorAll<HTMLElement>('[data-credit]'), 0, { stagger: 0.04, duration: 0.8 });
    revealLines(tl, el.querySelectorAll<HTMLElement>('[data-title]'), 0.25, { duration: 0.95 });
    revealLines(tl, el.querySelectorAll<HTMLElement>('[data-sign]'), 0.55);

    return tl;
  },
};

export default credits;
