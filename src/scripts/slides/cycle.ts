import { gsap } from "gsap";
import { revealLines } from "../split";
import { reducedMotion } from "../motion";
import type { SlideController } from "../deck";

// Project cycle (Brique par Brique, Ecozoic): images land one per beat, each
// wiping up over the last, and the run ends on the project video, which keeps looping.
const BEAT_START = 3;
const BEAT_END = 3; // the beat tightens into the video
const REVEAL = 0.6;
const HIDDEN = "inset(100% 0% 0% 0%)";
const SHOWN = "inset(0% 0% 0% 0%)";

const pad = (n: number) => String(n).padStart(2, "0");
const items = (el: HTMLElement) => [...el.querySelectorAll<HTMLElement>("[data-cycle-item]")];
const player = (el: HTMLElement) =>
    el.querySelector<HTMLMediaElement>("[data-cycle-video] mux-video");

function reset(el: HTMLElement) {
    items(el).forEach((it, i) => {
        gsap.set(
            it,
            reducedMotion ? { autoAlpha: i === 0 ? 1 : 0 } : { clipPath: i === 0 ? SHOWN : HIDDEN },
        );
    });
    const count = el.querySelector("[data-cycle-count]");
    if (count) count.textContent = pad(1);
}

const cycle: SlideController = {
    init(el) {
        // Decode up front so no cut ever lands on a half-painted image.
        el.querySelectorAll("img").forEach((img) => img.decode().catch(() => {}));
        // Hold the video until its turn.
        const v = player(el);
        v?.removeAttribute("autoplay");
        v?.pause?.();
        reset(el);
    },
    enter(el) {
        const tl = gsap.timeline();
        const list = items(el);
        const count = el.querySelector("[data-cycle-count]");
        const v = player(el);
        reset(el);

        revealLines(tl, el.querySelectorAll<HTMLElement>("[data-split]"), 0.15);

        // First image is already up under the wipe; it just settles.
        if (!reducedMotion) {
            tl.fromTo(
                list[0].querySelector("[data-cycle-media]"),
                { scale: 1.15 },
                { scale: 1, duration: 1.4, ease: "expo.out" },
                0,
            );
        }

        let at = 0;
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
                    },
                    at + 0.05,
                );
            }

            // Counter hard-cuts mid-wipe.
            tl.call(() => count && (count.textContent = pad(i + 1)), [], at + REVEAL * 0.5);
        }

        return tl;
    },
    leave(el) {
        player(el)?.pause?.();
        reset(el);
    },
};

export default cycle;
