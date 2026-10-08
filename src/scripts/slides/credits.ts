import { gsap } from 'gsap';
import { revealLines } from '../split';
import { reducedMotion } from '../motion';
import type { SlideController } from '../deck';

let spin: gsap.core.Tween | undefined;

const credits: SlideController = {
  enter(el) {
    const tl = gsap.timeline();
    const mark = el.querySelector<HTMLElement>('[data-mark]')!;
    const markSpin = el.querySelector<HTMLElement>('[data-mark-spin]')!;

    revealLines(tl, el.querySelectorAll<HTMLElement>('[data-credit]'), 0, { stagger: 0.05, duration: 1 });

    // The mark flickers on like a bad signal, unwinding from a quarter turn.
    tl.fromTo(mark, { rotate: -90 }, { rotate: 0, duration: 1.6, ease: 'power4.out' }, 0.15);
    gsap.set(mark, { autoAlpha: 0 });
    tl.to(
      mark,
      {
        keyframes: { autoAlpha: [0, 1, 0, 1, 0.2, 0, 1, 0.4, 1], ease: 'none' },
        duration: 0.55,
        ease: 'steps(8)',
      },
      0.15,
    );

    revealLines(tl, el.querySelectorAll<HTMLElement>('[data-title]'), 0.35, { duration: 1.3 });
    revealLines(tl, el.querySelectorAll<HTMLElement>('[data-sign]'), 0.8);

    spin?.kill();
    spin = gsap.to(markSpin, {
      rotate: '+=360',
      duration: reducedMotion ? 120 : 40,
      ease: 'none',
      repeat: -1,
    });
    return tl;
  },
  leave() {
    spin?.kill();
    spin = undefined;
  },
};

export default credits;
