import { gsap } from 'gsap';
import { revealLines } from '../split';
import type { SlideController } from '../deck';

/**
 * Animates every `[data-a]` element inside `root` in document order:
 * - `lines` masked line rise
 * - `rule`  hairline drawn from the left
 * - `clip`  box revealed bottom-up
 * The cascade is compressed so long slides finish in about the same time as short ones.
 */
export function animateBlocks(tl: gsap.core.Timeline, root: HTMLElement, start = 0, total = 0.9) {
  const blocks = [...root.querySelectorAll<HTMLElement>('[data-a]')];
  const step = Math.min(0.05, total / Math.max(blocks.length, 1));

  blocks.forEach((b, i) => {
    const at = start + i * step;
    switch (b.dataset.a) {
      case 'lines':
        revealLines(tl, b, at, { stagger: 0.04, duration: 0.85 });
        break;
      case 'rule':
        tl.fromTo(b, { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: 'expo.out' }, at);
        break;
      case 'clip':
        tl.fromTo(
          b,
          { clipPath: 'inset(100% 0% 0% 0%)' },
          { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.8, ease: 'expo.inOut' },
          at,
        );
        break;
    }
  });
  return tl;
}

const content: SlideController = {
  enter(el) {
    return animateBlocks(gsap.timeline(), el);
  },
};

export default content;
