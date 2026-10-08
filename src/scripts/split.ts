import { gsap } from 'gsap';

/**
 * Wraps each visual line of `el` in an overflow-hidden mask so it can rise into view.
 * - If `el` contains `[data-line]` children, each one is used as a line as-is
 *   (keeps per-line styling like opacity or italics).
 * - Otherwise the plain text is split into words and regrouped by rendered line.
 * Safe to call repeatedly: the split only happens once.
 */
export function splitLines(el: HTMLElement): HTMLElement[] {
  if (el.dataset.splitDone) return [...el.querySelectorAll<HTMLElement>('.line-inner')];

  const manual = [...el.querySelectorAll<HTMLElement>('[data-line]')];
  if (manual.length) {
    for (const line of manual) {
      const mask = document.createElement('span');
      mask.className = 'line-mask';
      line.before(mask);
      mask.append(line);
      line.classList.add('line-inner');
    }
  } else {
    const words = (el.textContent ?? '').trim().split(/\s+/);
    el.textContent = '';
    const spans = words.map((w) => {
      const s = document.createElement('span');
      s.textContent = w;
      el.append(s, ' ');
      return s;
    });

    const lines: string[][] = [];
    let top = -Infinity;
    for (const s of spans) {
      if (s.offsetTop > top + 2) {
        lines.push([]);
        top = s.offsetTop;
      }
      lines[lines.length - 1].push(s.textContent ?? '');
    }

    el.textContent = '';
    for (const words of lines) {
      const mask = document.createElement('span');
      mask.className = 'line-mask';
      const inner = document.createElement('span');
      inner.className = 'line-inner';
      inner.textContent = words.join(' ');
      mask.append(inner);
      el.append(mask);
    }
  }

  el.dataset.splitDone = 'true';
  return [...el.querySelectorAll<HTMLElement>('.line-inner')];
}

/** Masked line rise — the house text reveal. */
export function revealLines(
  tl: gsap.core.Timeline,
  targets: HTMLElement | HTMLElement[] | NodeListOf<HTMLElement>,
  position: gsap.Position = 0,
  { stagger = 0.06, duration = 0.85 } = {},
) {
  const els = targets instanceof HTMLElement ? [targets] : [...targets];
  const lines = els.flatMap(splitLines);
  tl.fromTo(
    lines,
    { yPercent: 130 },
    { yPercent: 0, duration, ease: 'expo.out', stagger },
    position,
  );
  return tl;
}
