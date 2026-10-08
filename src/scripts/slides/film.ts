import { gsap } from 'gsap';
import { reducedMotion } from '../motion';
import type { SlideController } from '../deck';

// Full-bleed looping Mux video. Plays only while its slide is up.
const player = (el: HTMLElement) => el.querySelector<HTMLMediaElement>('mux-video');

const film: SlideController = {
  enter(el) {
    const tl = gsap.timeline();
    player(el)?.play()?.catch(() => {});
    // Settles into place under the wipe.
    if (!reducedMotion) {
      tl.fromTo(el.querySelector('[data-film]'), { scale: 1.08 }, { scale: 1, duration: 1.6, ease: 'expo.out' }, 0);
    }
    return tl;
  },
  leave(el) {
    const v = player(el);
    if (!v) return;
    v.pause?.();
    v.currentTime = 0;
  },
};

export default film;
