"use client";
import { gsap } from "gsap";

/**
 * Sends a copy of the header's cart icon flying from `origin` to the cart
 * button, then runs `onArrive`.
 *
 * It bows out and calls `onArrive` straight away when the page has no cart
 * button to aim at, or when the visitor asked for reduced motion, so callers
 * can rely on the callback running exactly once either way.
 */
export function flyToCart(origin: HTMLElement | null, onArrive?: () => void) {
  const finish = () => onArrive?.();
  if (!origin || typeof window === "undefined") return finish();
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches)
    return finish();

  const cart = document.querySelector<HTMLElement>(".cart-btn");
  const icon = cart?.querySelector("svg");
  if (!cart || !icon) return finish();

  const from = origin.getBoundingClientRect();
  const to = cart.getBoundingClientRect();
  const startX = from.left + from.width / 2;
  const startY = from.top + from.height / 2;
  // The header does not stick, so once it has scrolled away the icon heads for
  // the top edge instead of a point somewhere above the page.
  const endX = to.left + to.width / 2;
  const endY = Math.max(to.top + to.height / 2, 26);

  const ghost = document.createElement("span");
  ghost.className = "cart-fly";
  ghost.setAttribute("aria-hidden", "true");
  ghost.appendChild(icon.cloneNode(true));
  document.body.appendChild(ghost);

  gsap.set(ghost, { left: startX, top: startY, xPercent: -50, yPercent: -50 });
  gsap
    .timeline({
      onComplete: () => {
        ghost.remove();
        finish();
      },
    })
    // Separate eases on each axis bend the path into an arc.
    .to(ghost, { x: endX - startX, duration: 0.52, ease: "power1.inOut" }, 0)
    .to(ghost, { y: endY - startY, duration: 0.52, ease: "power2.in" }, 0)
    .to(ghost, { scale: 0.45, opacity: 0, duration: 0.22, ease: "power1.in" }, 0.32)
    .set(cart, { transition: "none" }, 0.46)
    .to(cart, { scale: 1.14, duration: 0.12, ease: "power2.out", yoyo: true, repeat: 1 }, 0.46)
    .set(cart, { clearProps: "transform,transition" });
}
