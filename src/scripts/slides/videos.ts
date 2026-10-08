import { gsap } from 'gsap';
import { reducedMotion } from '../motion';
import type { SlideController } from '../deck';

// Matches the Figma column: 871px tall frames with a 40px gap.
const ITEM = 871;
const GAP = 40;
const STEP = ITEM + GAP;
// First video sits where the main frame is in Figma; the rest stack below it.
const FIRST_Y = 174;
// Pixels per second the column drifts upward.
const SPEED = reducedMotion ? 12 : 55;

let drift: gsap.core.Tween | undefined;

function players(el: HTMLElement) {
  return [...el.querySelectorAll<HTMLMediaElement>('mux-video')];
}

const videos: SlideController = {
  init(el) {
    // Lay the videos out as a ring so the loop never needs duplicate streams:
    // each one wraps from just above the top edge back to below the last.
    const items = [...el.querySelectorAll<HTMLElement>('[data-reel-item]')];
    const ring = items.length * STEP;
    const wrap = gsap.utils.wrap(-STEP, ring - STEP);
    const setters = items.map((it) => gsap.quickSetter(it, 'y', 'px'));
    const state = { offset: 0 };
    const render = () =>
      setters.forEach((set, i) => set(wrap(FIRST_Y + i * STEP - state.offset)));
    render();

    drift = gsap.to(state, {
      offset: ring,
      duration: ring / SPEED,
      ease: 'none',
      repeat: -1,
      paused: true,
      onUpdate: render,
    });
  },
  enter(el) {
    const tl = gsap.timeline();
    const reel = el.querySelector<HTMLElement>('[data-reel]')!;

    players(el).forEach((v) => v.play()?.catch(() => {}));
    drift?.play();

    tl.fromTo(reel, { y: 260 }, { y: 0, duration: 1.8, ease: 'power4.out' }, 0);
    return tl;
  },
  leave() {
    drift?.pause();
  },
};

export default videos;
