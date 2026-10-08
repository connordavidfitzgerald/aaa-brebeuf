import { gsap } from 'gsap';
import { animateBlocks } from './content';
import type { SlideController } from '../deck';

const spectrum: SlideController = {
  enter(el) {
    const tl = gsap.timeline();
    animateBlocks(tl, el);

    // Current position snaps on; the future dot then travels from it to where L4E is heading.
    const now = el.querySelectorAll<HTMLElement>('[data-dot="now"]');
    const next = [...el.querySelectorAll<HTMLElement>('[data-dot="next"]')];
    tl.fromTo(now, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01, ease: 'none', stagger: 0.04 }, 0.45);
    next.forEach((dot, i) => {
      // Remember the authored end position; re-entering mid-tween would otherwise read a stale value.
      dot.dataset.to ??= dot.style.left;
      tl.fromTo(dot, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01, ease: 'none' }, 0.75 + i * 0.05);
      tl.fromTo(
        dot,
        { left: dot.dataset.from },
        { left: dot.dataset.to, duration: 1.1, ease: 'expo.inOut' },
        0.75 + i * 0.05,
      );
    });
    return tl;
  },
};

export default spectrum;
