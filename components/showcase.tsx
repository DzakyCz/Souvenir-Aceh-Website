"use client";
import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";
import { money, useCatalog } from "./catalog";

const stories = [
  {
    title: "Oleh oleh Aceh,",
    accent: "tinggal pilih.",
    copy: "Kopi Gayo, kue tradisional, dan kerajinan dari pembuat lokal. Ambil di Banda Aceh atau minta antar ke hotel.",
    action: "Jelajahi produk",
    href: "/produk/",
    alt: "Di pasar Aceh, dua perempuan berjilbab bertukar tas marun bersulam emas yang berisi oleh oleh.",
  },
  {
    imageName: "keukarah",
    title: "Camilan Aceh,",
    accent: "renyah rasanya.",
    copy: "Keukarah yang renyah dan timphan berbalut daun pisang. Temukan resep turun temurun dari dapur pembuat lokal.",
    action: "Jelajahi camilan",
    href: "/produk/?kategori=kue-camilan",
    alt: "Pembuat kue berjilbab marun menyajikan keukarah kepada pengunjung berjilbab warna pasir.",
  },
  {
    title: "Sulaman Aceh,",
    accent: "penuh warna.",
    copy: "Dari sulaman benang emas sampai anyaman pandan, pilih karya perajin yang bisa menemani keseharianmu.",
    action: "Jelajahi kerajinan",
    href: "/produk/?kategori=kerajinan",
    alt: "Perajin berjilbab keemasan menyulam dompet marun, sementara pengunjung berjilbab mengamati motifnya.",
  },
];
const SLIDE_MS = 5000;

export function Showcase() {
  const { categories, products } = useCatalog();
  const [index, setIndex] = useState(0),
    root = useRef<HTMLElement>(null);
  // Pointer inside the hero, keyboard focus inside it, or a backgrounded tab
  // each hold the carousel where it is.
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [backgrounded, setBackgrounded] = useState(false);
  const story = stories[index],
    product = products[index];
  const imageName = story.imageName ?? index;
  useLayoutEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const context = gsap.context(() => {
        // One timeline so the artwork, the copy and the product chip arrive as
        // a single move instead of several unrelated twitches.
        const entrance = gsap.timeline({
          defaults: { ease: "power2.out", clearProps: "transform" },
        });
        entrance
          .fromTo(
            ".story-art",
            { autoAlpha: 0, x: 24, scale: 1.015 },
            { autoAlpha: 1, x: 0, scale: 1, duration: 0.6 },
            0,
          )
          .fromTo(
            ".story-heading span",
            { autoAlpha: 0, y: 18 },
            { autoAlpha: 1, y: 0, stagger: 0.07, duration: 0.46 },
            0.04,
          )
          .fromTo(
            ".story-copy > p",
            { autoAlpha: 0, y: 14 },
            { autoAlpha: 1, y: 0, duration: 0.42 },
            0.16,
          )
          .fromTo(
            ".story-cta > *",
            { autoAlpha: 0, y: 12 },
            { autoAlpha: 1, y: 0, stagger: 0.06, duration: 0.36 },
            0.22,
          )
          .fromTo(
            ".story-product",
            { autoAlpha: 0, y: 16 },
            { autoAlpha: 1, y: 0, duration: 0.42 },
            0.26,
          );
      }, root);
      return () => context.revert();
    });
    return () => media.revert();
  }, [index]);
  function move(by: number) {
    setIndex((i) => (i + by + stories.length) % stories.length);
  }
  useEffect(() => {
    const onVisibility = () => setBackgrounded(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);
  useEffect(() => {
    if (hovered || focused || backgrounded) return;
    // Auto-advancing is motion, so visitors who asked for less do not get it.
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    // Keyed on index, so using the arrows restarts the countdown rather than
    // letting a slide flip moments after the visitor picked it.
    const timer = window.setTimeout(() => move(1), SLIDE_MS);
    return () => window.clearTimeout(timer);
  }, [index, hovered, focused, backgrounded]);
  return (
    <section
      ref={root}
      className={"illustrated-hero story-" + index}
      aria-label="Sorotan koleksi souveniraceh"
      aria-roledescription="karusel"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    >
      <picture className="story-art">
        <source
          media="(max-width: 620px)"
          srcSet={"/img/cerita-ponsel-" + imageName + ".webp"}
          width={850}
          height={[758, 658, 647][index]}
        />
        <img
          src={"/img/cerita-" + imageName + ".webp"}
          alt={story.alt}
          fetchPriority={index === 0 ? "high" : "auto"}
          width={index === 0 ? 1401 : 1450}
          height={index === 0 ? 1024 : 999}
        />
      </picture>
      <div className="shell story-layout">
        <div className="story-copy">
          <h1 className="story-heading">
            <span>{story.title}</span>
            <span>{story.accent}</span>
          </h1>
          <p>{story.copy}</p>
          <div className="story-cta">
            <Link className="btn primary" href={story.href}>
              <ShoppingBag size={17} />
              {story.action}
            </Link>
          </div>
          <div className="story-controls">
            <button onClick={() => move(-1)} aria-label="Koleksi sebelumnya">
              <ChevronLeft size={16} />
            </button>
            <div className="story-markers" aria-hidden="true">
              {stories.map((_, i) => (
                <i key={i} className={i === index ? "current" : ""} />
              ))}
            </div>
            <button onClick={() => move(1)} aria-label="Koleksi berikutnya">
              <ChevronRight size={16} />
            </button>
            <span className="sr-only" aria-live="polite">
              {categories[index]?.name}, {index + 1} dari {stories.length}
            </span>
          </div>
        </div>
        {product && (
          <Link className="story-product" href={"/produk/" + product.slug + "/"}>
            <img src={"/img/ikon-koleksi-" + index + ".webp"} alt="" />
            <span>
              <small>Produk pilihan</small>
              <strong>{product.name}</strong>
            </span>
            <b>{money(product.price)}</b>
            <ChevronRight size={15} />
          </Link>
        )}
      </div>
    </section>
  );
}
