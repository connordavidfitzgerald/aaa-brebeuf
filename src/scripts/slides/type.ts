import { gsap } from 'gsap';
import { revealLines, splitLines } from '../split';
import { reducedMotion } from '../motion';
import type { SlideController } from '../deck';

interface Glyph {
  glyph: string;
  label: string;
}

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NUMERALS = '0123456789';
const SYMBOLS = '&@?!§¶*#%$€£()/«»“”';

export const GLYPHS: Glyph[] = [
  ...[...LETTERS].map((c) => ({ glyph: c + c.toLowerCase(), label: `Letter ${c}` })),
  ...[...NUMERALS].map((n) => ({ glyph: n, label: `Numeral ${n}` })),
  ...[...SYMBOLS].map((s) => ({ glyph: s, label: `Glyph ${s}` })),
];

const STEP = reducedMotion ? 1.2 : 0.4;

let cycle: gsap.core.Tween | undefined;

function startCycle(glyphEl: HTMLElement, labelEl: HTMLElement) {
  let i = 0;
  const tick = () => {
    i = (i + 1) % GLYPHS.length;
    glyphEl.textContent = GLYPHS[i].glyph;
    labelEl.textContent = GLYPHS[i].label;
    cycle = gsap.delayedCall(STEP, tick);
  };
  cycle = gsap.delayedCall(STEP, tick);
}

function stopCycle(glyphEl: HTMLElement, labelEl: HTMLElement) {
  cycle?.kill();
  cycle = undefined;
  glyphEl.textContent = GLYPHS[0].glyph;
  labelEl.textContent = GLYPHS[0].label;
}

const type: SlideController = {
  enter(el) {
    const tl = gsap.timeline();
    const glyphEl = el.querySelector<HTMLElement>('[data-glyph]')!;
    const heading = el.querySelector<HTMLElement>('[data-specimen]')!;
    const photo = el.querySelector<HTMLElement>('[data-photo]')!;
    const photoImg = photo.querySelector('img')!;
    const quote = el.querySelector<HTMLElement>('[data-quote]');

    // Split first so the label line exists before we grab it.
    splitLines(heading);
    const labelEl = heading.querySelector<HTMLElement>('[data-label]')!;
    stopCycle(glyphEl, labelEl);

    // Photo opens right-to-left while the image settles from a slight zoom.
    tl.fromTo(
      photo,
      { clipPath: 'inset(0% 0% 0% 100%)' },
      { clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: 'expo.inOut' },
      0,
    );
    tl.fromTo(photoImg, { scale: 1.15 }, { scale: 1, duration: 1.6, ease: 'expo.out' }, 0.15);

    revealLines(tl, heading, 0.05);
    tl.fromTo(glyphEl, { yPercent: 100 }, { yPercent: 0, duration: 0.95, ease: 'expo.out' }, 0.12);

    if (quote) revealLines(tl, quote, 0.6, { stagger: 0.05, duration: 0.9 });

    tl.call(() => startCycle(glyphEl, labelEl), [], 0.8);
    return tl;
  },
  leave(el) {
    const glyphEl = el.querySelector<HTMLElement>('[data-glyph]')!;
    const labelEl = el.querySelector<HTMLElement>('[data-label]');
    if (labelEl) stopCycle(glyphEl, labelEl);
  },
};

export default type;
