import { gsap } from "gsap";
import { revealLines } from "../split";
import { reducedMotion } from "../motion";
import type { SlideController } from "../deck";

// Project cycle (Brique par Brique, Ecozoic): images land one per beat, each
// wiping up over the last, and the run ends on the project video. When the video
// finishes, the first image wipes back up over its last frame and the cycle repeats.
const BEAT_START = 3;
const BEAT_END = 3; // the beat tightens into the video
const REVEAL = 0.6;
const HIDDEN = "inset(100% 0% 0% 0%)";
const SHOWN = "inset(0% 0% 0% 0%)";

const pad = (n: number) => String(n).padStart(2, "0");
const items = (el: HTMLElement) => [...el.querySelectorAll<HTMLElement>("[data-cycle-item]")];
const player = (el: HTMLElement) =>
    el.querySelector<HTMLMediaElement>("[data-cycle-video] mux-video");

// Replay timelines started by the video's `ended`, so `leave` can stop them.
const loops = new WeakMap<HTMLElement, gsap.core.Timeline>();

function reset(el: HTMLElement) {
    items(el).forEach((it, i) => {
        gsap.set(
            it,
            reducedMotion ? { autoAlpha: i === 0 ? 1 : 0 } : { clipPath: i === 0 ? SHOWN : HIDDEN },
        );
        gsap.set(it, { clearProps: "zIndex" });
    });
    const count = el.querySelector("[data-cycle-count]");
    if (count) count.textContent = pad(1);
}

/** Adds the beats from the second image through to the video, starting at `start`. */
function addBeats(tl: gsap.core.Timeline, el: HTMLElement, start: number) {
    const list = items(el);
    const count = el.querySelector("[data-cycle-count]");
    const v = player(el);

    let at = start;
    for (let i = 1; i < list.length; i++) {
        const isVideo = i === list.length - 1;
        at += gsap.utils.interpolate(
            BEAT_START,
            BEAT_END,
            (i - 1) / Math.max(1, list.length - 2),
        );
        const item = list[i];
        const media = item.querySelector("[data-cycle-media]");

        if (isVideo && v) {
            tl.call(
                () => {
                    v.currentTime = 0;
                    v.play()?.catch(() => {});
                },
                [],
                at - 0.2,
            );
        }

        if (reducedMotion) {
            tl.to(item, { autoAlpha: 1, duration: 0.4, ease: "none" }, at);
        } else {
            // Wipe up over the previous frame while the image counter-moves.
            tl.to(item, { clipPath: SHOWN, duration: REVEAL, ease: "expo.inOut" }, at);
            tl.fromTo(
                media,
                { yPercent: 12, scale: 1.15 },
                {
                    yPercent: 0,
                    scale: 1,
                    duration: isVideo ? 1.4 : REVEAL + 0.4,
                    ease: "expo.out",
                    // On a replay the video is still on screen; don't knock it out of place early.
                    immediateRender: false,
                },
                at + 0.05,
            );
        }

        // Counter hard-cuts mid-wipe.
        tl.call(() => count && (count.textContent = pad(i + 1)), [], at + REVEAL * 0.5);
    }
}

/** Video finished: bring the first image back up over its last frame and run again. */
function replay(el: HTMLElement) {
    loops.get(el)?.kill();
    const tl = gsap.timeline();
    loops.set(el, tl);

    const first = items(el)[0];
    const media = first.querySelector("[data-cycle-media]");
    const count = el.querySelector("[data-cycle-count]");

    // Lift the first image above the stack for its wipe, then drop everything back to the start.
    gsap.set(first, { zIndex: 1 });
    if (reducedMotion) {
        tl.fromTo(first, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, ease: "none" }, 0);
    } else {
        tl.fromTo(first, { clipPath: HIDDEN }, { clipPath: SHOWN, duration: REVEAL, ease: "expo.inOut" }, 0);
        tl.fromTo(
            media,
            { yPercent: 12, scale: 1.15 },
            { yPercent: 0, scale: 1, duration: 1.4, ease: "expo.out" },
            0.05,
        );
    }
    tl.call(() => count && (count.textContent = pad(1)), [], REVEAL * 0.5);
    tl.call(() => reset(el), [], REVEAL);

    addBeats(tl, el, 0);
}

const cycle: SlideController = {
    init(el) {
        // Decode up front so no cut ever lands on a half-painted image.
        el.querySelectorAll("img").forEach((img) => img.decode().catch(() => {}));
        // Hold the video until its turn, and let it end so the cycle can restart.
        const v = player(el);
        v?.removeAttribute("autoplay");
        v?.removeAttribute("loop");
        if (v) v.loop = false;
        v?.pause?.();
        v?.addEventListener("ended", () => {
            if (el.classList.contains("is-current")) replay(el);
        });
        reset(el);
    },
    enter(el) {
        const tl = gsap.timeline();
        const first = items(el)[0];
        reset(el);

        revealLines(tl, el.querySelectorAll<HTMLElement>("[data-split]"), 0.15);

        // First image is already up under the wipe; it just settles.
        if (!reducedMotion) {
            tl.fromTo(
                first.querySelector("[data-cycle-media]"),
                { scale: 1.15 },
                { scale: 1, duration: 1.4, ease: "expo.out" },
                0,
            );
        }

        addBeats(tl, el, 0);
        return tl;
    },
    leave(el) {
        loops.get(el)?.kill();
        loops.delete(el);
        player(el)?.pause?.();
        reset(el);
    },
};

export default cycle;
