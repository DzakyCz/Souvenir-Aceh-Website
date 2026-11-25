"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import {
  ShoppingBag,
  LayoutGrid,
  Check,
  X,
  Store,
  Plus,
  Minus,
  Search,
  SlidersHorizontal,
  ChevronRight,
  Plane,
  Clock3,
  Package,
} from "lucide-react";
import { money, photo, useCatalog, type Product } from "./catalog";
import { useMarket } from "./store";
import { Choice } from "./choice";
import { Showcase } from "./showcase";
import { flyToCart } from "./fly-to-cart";
import { useGridReveal } from "./reveal";
export function ProductCard({ p }: { p: Product }) {
  const { add } = useMarket();
  const { categories } = useCatalog();
  const [added, setAdded] = useState(0);
  useEffect(() => {
    if (!added) return;
    const timer = window.setTimeout(() => setAdded(0), 1350);
    return () => window.clearTimeout(timer);
  }, [added]);
  const toneIndex = categories.findIndex((c) => c.id === p.categoryId);
  return (
    <article
      className={"product-card product-tone-" + (toneIndex >= 0 ? toneIndex % 4 : 0)}
    >
      <Link className="product-photo" href={"/produk/" + p.slug + "/"}>
        <img loading="lazy" src={photo(p)} alt={p.name} />
      </Link>
      <div className="p-info">
        <span className="meta">
          {p.shop.origin} <span aria-hidden="true">/</span> {p.size}
        </span>
        <h3>
          <Link href={"/produk/" + p.slug + "/"}>{p.name}</Link>
        </h3>
        <div className="p-price">
          <b>{money(p.price)}</b>
          <button
            aria-label={"Tambahkan " + p.name + " ke keranjang"}
            onClick={(event) => {
              const trigger = event.currentTarget;
              if (add(p)) {
                setAdded((k) => k + 1);
                flyToCart(trigger);
              }
            }}
          >
            {added ? <Check size={15} /> : <Plus size={15} />}
            <span>{added ? "Masuk" : "Tambah"}</span>
          </button>
        </div>
      </div>
    </article>
  );
}
export function Home() {
  const { categories, products, loaded, error, reload } = useCatalog();
  const [chosen, setChosen] = useState(-1);
  const main = useRef<HTMLElement>(null);
  useGridReveal(main, [".service-grid", ".product-grid"], loaded);
  if (!loaded) {
    return (
      <main id="utama" className="shell page">
        <p role="status">Memuat katalog…</p>
      </main>
    );
  }
  if (error) {
    return (
      <main id="utama" className="shell page">
        <p role="status">
          {error} <button className="btn outline" onClick={reload}>Coba lagi</button>
        </p>
      </main>
    );
  }
  return (
    <main id="utama" ref={main}>
      <Showcase />
      <section className="category-deck" aria-labelledby="collections-title">
        <div className="shell">
          <div className="collection-head">
            <h2 id="collections-title">Mau bawa pulang apa?</h2>
            <Link className="editorial-link" href="/produk/">
              Semua produk <LayoutGrid size={15} />
            </Link>
          </div>
          <div className="service-grid" data-reveal>
            {categories.map((c, i) => (
              <Link
                key={c.slug}
                className={
                  "service-card service-" + i + (c.icon ? "" : " service-plain")
                }
                href={"/produk/?kategori=" + c.slug}
              >
                <div className="service-copy">
                  <h3>{c.name}</h3>
                  <p>{c.caption}</p>
                  <span className="ui-badge">
                    {products.filter((p) => p.categoryId === c.id).length} produk{" "}
                    <ChevronRight size={13} />
                  </span>
                </div>
                {c.icon && (
                  <img src={"/img/" + c.icon + ".webp"} loading="lazy" alt="" />
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="shell product-edit" aria-labelledby="picks-title">
        <div className="collection-head">
          <div>
            <h2 id="picks-title">Produk pilihan</h2>
          </div>
          <Link className="editorial-link" href="/produk/">
            Lihat katalog <LayoutGrid size={15} />
          </Link>
        </div>
        <div className="edit-tabs" aria-label="Kategori produk pilihan">
          {[{ id: -1, name: "Semua", short: "Semua" }, ...categories].map(
            (label) => (
              <button
                key={label.id}
                aria-pressed={chosen === label.id}
                onClick={() => setChosen(label.id)}
              >
                <span className="category-full">{label.name}</span>
                <span aria-hidden="true" className="category-short">
                  {label.short}
                </span>
              </button>
            ),
          )}
        </div>
        <div className="product-grid" aria-live="polite" data-reveal>
          {(chosen === -1
            ? products.slice(0, 4)
            : products.filter((p) => p.categoryId === chosen)
          ).map((p) => (
            <ProductCard key={p.slug} p={p} />
          ))}
        </div>
      </section>
    </main>
  );
}
export function Breadcrumb({
  items,
}: {
  items: { name: string; href?: string }[];
}) {
  return (
    <div className="crumb">
      <Link href="/">Beranda</Link>
      {items.map((i, index) => (
        <span key={index}>
          <ChevronRight size={12} />
          {i.href ? <Link href={i.href}>{i.name}</Link> : i.name}
        </span>
      ))}
    </div>
  );
}
export function Catalog() {
  const main = useRef<HTMLElement>(null);
  const { categories, products, loaded, error, reload } = useCatalog();
  useGridReveal(main, [".product-grid"], loaded);
  const [cat, setCat] = useState(""),
    [q, setQ] = useState(""),
    [sort, setSort] = useState("pilihan"),
    [long, setLong] = useState(false),
    [filters, setFilters] = useState(false);
  function sync() {
    const p = new URLSearchParams(location.search);
    setCat(p.get("kategori") || "");
    setQ(p.get("q") || "");
    setSort(p.get("urut") || "pilihan");
    setLong(p.get("tahan") === "7");
  }
  useEffect(() => {
    sync();
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);
  function update(k: string, v: string) {
    const u = new URL(window.location.href);
    if (v) u.searchParams.set(k, v);
    else u.searchParams.delete(k);
    window.history.replaceState(null, "", u);
    sync();
  }
  function clearFilters() {
    window.history.replaceState(null, "", location.pathname);
    sync();
  }
  const filtered = Boolean(cat || long || q || sort !== "pilihan");
  const list = products
    .filter(
      (p) =>
        (!cat || p.category.slug === cat) &&
        (!long || p.shelfLifeDays >= 7) &&
        q
          .trim()
          .toLowerCase()
          .split(/\s+/)
          .every((w) =>
            (p.name + " " + p.shop.name + " " + p.shop.origin + " " + p.category.name)
              .toLowerCase()
              .includes(w),
          ),
    )
    .sort((a, b) =>
      sort === "rendah"
        ? a.price - b.price
        : sort === "tinggi"
          ? b.price - a.price
          : 0,
    );
  if (!loaded) {
    return (
      <main id="utama" className="shell page">
        <p role="status">Memuat katalog…</p>
      </main>
    );
  }
  if (error) {
    return (
      <main id="utama" className="shell page">
        <p role="status">
          {error} <button className="btn outline" onClick={reload}>Coba lagi</button>
        </p>
      </main>
    );
  }
  return (
    <main id="utama" className="shell page" ref={main}>
      <Breadcrumb items={[{ name: "Katalog" }]} />
      <div className="page-heading">
        <div className="eyebrow">OLEH OLEH KHAS ACEH</div>
        <h1>
          Katalog <em>Aceh.</em>
        </h1>
        <p>Temukan oleh oleh sesuai selera dan rencana perjalanan Anda.</p>
      </div>
      <div className="catalog-tools">
        <label className="input-icon">
          <Search size={18} />
          <input
            aria-label="Cari di katalog"
            placeholder="Cari produk, daerah, atau mitra"
            maxLength={100}
            value={q}
            onChange={(e) => update("q", e.target.value)}
          />
          {q && (
            <button
              type="button"
              aria-label="Kosongkan pencarian"
              className="clear-search"
              onClick={() => update("q", "")}
            >
              <X size={16} />
            </button>
          )}
        </label>
        <button
          className={"btn outline " + (filters || long ? "filter-active" : "")}
          aria-expanded={filters}
          onClick={() => setFilters(!filters)}
        >
          <SlidersHorizontal size={16} />
          Filter{long ? " (1)" : ""}
        </button>
        <Choice
          label="Urutkan produk"
          hideLabel
          value={sort}
          onChange={(value) => update("urut", value)}
          options={[
            { value: "pilihan", label: "Urutan pilihan" },
            { value: "rendah", label: "Harga terendah" },
            { value: "tinggi", label: "Harga tertinggi" },
          ]}
        />
      </div>
      {filters && (
        <div className="filter-box">
          <label>
            <input
              type="checkbox"
              checked={long}
              onChange={(e) => update("tahan", e.target.checked ? "7" : "")}
            />{" "}
            Pangan dengan daya simpan minimal 7 hari
          </label>
        </div>
      )}
      <div className="chip-row" aria-label="Kategori katalog">
        <button
          aria-pressed={cat === ""}
          onClick={() => update("kategori", "")}
        >
          Semua
        </button>
        {categories.map((c) => (
          <button
            key={c.slug}
            aria-pressed={c.slug === cat}
            onClick={() => update("kategori", c.slug)}
          >
            <span className="category-full">{c.name}</span>
            <span aria-hidden="true" className="category-short">
              {c.short}
            </span>
          </button>
        ))}
      </div>
      <div className="results-line">
        <p className="result-count" aria-live="polite">
          {list.length} produk
        </p>
        {filtered && <button onClick={clearFilters}>Atur ulang</button>}
      </div>
      <div className="product-grid" data-reveal>
        {list.map((p) => (
          <ProductCard key={p.slug} p={p} />
        ))}
      </div>
      {list.length === 0 && (
        <div className="empty">
          <Search />
          <h3>Produk tidak ditemukan</h3>
          <p>Coba kata kunci lain atau atur ulang filter.</p>
          <button className="btn outline" onClick={clearFilters}>
            Tampilkan semua produk
          </button>
        </div>
      )}
    </main>
  );
}
export function ProductDetail({
  product: p,
  related,
}: {
  product: Product;
  related: Product[];
}) {
  const [qty, setQty] = useState(1),
    { add } = useMarket();
  return (
    <main id="utama" className="shell page">
      <Breadcrumb
        items={[{ name: "Katalog", href: "/produk/" }, { name: p.name }]}
      />
      <div className="detail">
        <img className="detail-photo" src={photo(p)} alt={p.name} />
        <div>
          <div className="eyebrow">{p.category.name.toUpperCase()}</div>
          <h1>{p.name}</h1>
          <span className="detail-shop">
            <Store size={16} />
            {p.shop.name} · {p.shop.origin}
          </span>
          <b className="detail-price">{money(p.price)}</b>
          <p>{p.description}</p>
          <div className="facts">
            <span>
              <Package />
              {p.size}
            </span>
            <span>
              <Plane />
              Muat di kabin
            </span>
            {p.shelfLifeDays > 0 && (
              <span>
                <Clock3 />
                Tahan {p.shelfLifeDays} hari
              </span>
            )}
          </div>
          <div className="buy">
            <div className="stepper">
              <button
                aria-label="Kurangi jumlah"
                disabled={qty === 1}
                onClick={() => setQty(qty - 1)}
              >
                <Minus />
              </button>
              <b>{qty}</b>
              <button
                aria-label="Tambah jumlah"
                disabled={qty >= p.stock}
                onClick={() => setQty(qty + 1)}
              >
                <Plus />
              </button>
            </div>
            <button
              className="btn primary"
              onClick={(event) => {
                const trigger = event.currentTarget;
                if (add(p, qty)) flyToCart(trigger);
              }}
            >
              <ShoppingBag size={18} />
              Tambah ke keranjang
            </button>
          </div>
          <small>
            Tersedia {p.stock} · Antar hotel atau ambil di Banda Aceh
          </small>
          {p.shelfLifeDays > 0 && (
            <small className="legal">
              Legalitas pangan · Belum dicantumkan
            </small>
          )}
        </div>
      </div>
      {related.length > 0 && (
        <>
          <div className="section-head">
            <h2>
              Rekomendasi <em>Produk.</em>
            </h2>
          </div>
          <div className="product-grid">
            {related.map((x) => (
              <ProductCard key={x.slug} p={x} />
            ))}
          </div>
        </>
      )}
    </main>
  );
}
