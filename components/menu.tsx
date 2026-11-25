"use client";
import Link from "next/link";
import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import {
  LayoutGrid,
  MapPin,
  BookOpen,
  ReceiptText,
  ChevronRight,
} from "lucide-react";
import { useCatalog } from "./catalog";
export function CollectionMenu({
  onClose,
  onGuide,
}: {
  onClose: () => void;
  onGuide: () => void;
}) {
  const { categories } = useCatalog();
  const root = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const motion = gsap.matchMedia();
    motion.add("(prefers-reduced-motion: no-preference)", () => {
      const scope = gsap.context(() => {
        gsap.from(".menu-card", {
          y: 10,
          stagger: 0.055,
          duration: 0.38,
          ease: "power3.out",
        });
      }, root);
      return () => scope.revert();
    });
    return () => motion.revert();
  }, []);
  return (
    <div ref={root} className="browse-menu">
      <div className="menu-cards">
        {categories.map((c, i) => (
          <a
            key={c.slug}
            className={"menu-card pass-" + i}
            href={"/produk/?kategori=" + c.slug}
            onClick={onClose}
          >
            {c.icon ? (
              <img
                className="menu-card-art"
                src={"/img/" + c.icon + ".webp"}
                alt=""
              />
            ) : (
              <div className="menu-card-art" aria-hidden="true" />
            )}
            <span>
              {c.name}
              <ChevronRight size={15} />
            </span>
          </a>
        ))}
        <a
          className="menu-card menu-card-all"
          href="/produk/"
          onClick={onClose}
        >
          <div className="menu-card-art" aria-hidden="true">
            <LayoutGrid />
          </div>
          <span>
            Semua produk
            <ChevronRight size={15} />
          </span>
        </a>
      </div>
      <div className="menu-routes">
        {/* Only for the hamburger: at >=900px these live in the header nav. */}
        <button className="compact-route" onClick={onGuide}>
          <BookOpen />
          Cara pesan
        </button>
        <Link className="compact-route" href="/pesanan/" onClick={onClose}>
          <ReceiptText />
          Pesanan saya
        </Link>
      </div>
      <div className="menu-local">
        <MapPin size={14} />
        Pengambilan &amp; antar hotel di Banda Aceh
      </div>
    </div>
  );
}
