"use client";
import { useLayoutEffect, type RefObject } from "react";
import { gsap } from "gsap";

/**
 * Lifts each named grid's cards into place one after another, the first time
 * that grid scrolls into view — on a page that already shows it, immediately.
 *
 * The grids carry `data-reveal`, which the stylesheet uses to hide their cards
 * before the first paint (see `[data-reveal]` in globals.css). That is what
 * keeps a grid above the fold from flashing into view and then vanishing once
 * hydration catches up. The attribute is this hook's to clear, and every path
 * through it clears it — otherwise a browser without IntersectionObserver, or
 * a visitor who asked for reduced motion, would be left with an empty grid.
 *
 * It runs once per mount: a grid that later re-renders (a filter, a search)
 * swaps in fresh cards that are simply visible, rather than replaying the
 * entrance on every keystroke.
 */
export function useGridReveal(
  root: RefObject<HTMLElement | null>,
  selectors: string[],
) {
  useLayoutEffect(() => {
    const host = root.current;
    if (!host) return;
    const grids = selectors
      .map((selector) => host.querySelector(selector))
      .filter((grid): grid is HTMLElement => grid !== null);
    const handOverToUs = () =>
      grids.forEach((grid) => grid.removeAttribute("data-reveal"));

    const reducedMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reducedMotion || typeof IntersectionObserver !== "function") {
      handOverToUs();
      return;
    }

    const watchers: IntersectionObserver[] = [];
    const context = gsap.context(() => {
      for (const grid of grids) {
        const cards = Array.from(grid.children);
        if (!cards.length) continue;
        // Inline styles take over the hiding before the attribute goes.
        gsap.set(cards, { autoAlpha: 0, y: 26 });
        const watcher = new IntersectionObserver(
          (entries) => {
            if (!entries.some((entry) => entry.isIntersecting)) return;
            watcher.disconnect();
            gsap.to(cards, {
              autoAlpha: 1,
              y: 0,
              duration: 0.5,
              ease: "power2.out",
              stagger: 0.09,
              // Hand the cards back to the stylesheet; .service-card carries
              // its own :hover transform that an inline one would override.
              clearProps: "transform",
            });
          },
          { threshold: 0.15 },
        );
        watcher.observe(grid);
        watchers.push(watcher);
      }
      handOverToUs();
    }, root);

    return () => {
      watchers.forEach((watcher) => watcher.disconnect());
      context.revert();
    };
    // Mount only; `selectors` is a fresh array each render and never changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
