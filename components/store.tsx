"use client";
import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";
import { CollectionMenu } from "./menu";
import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  Search,
  ChevronDown,
  ShoppingBag,
  Menu,
  X,
  Compass,
  PackageCheck,
  MapPin,
  Store,
  Minus,
  Plus,
  Trash2,
  Check,
  ShoppingBasket,
  NotebookTabs,
} from "lucide-react";
import { API_URL, money, photo, useCatalog, type Product } from "./catalog";
type Panel =
  "cart" | "search" | "guide" | "menu" | null;
type Cart = Record<string, number>;
export type Order = {
  id: string;
  customerName: string;
  phone: string;
  method: string;
  location: string;
  deliveryDate: string;
  fee: number;
  subtotal: number;
  total: number;
  status: string;
  placedAt: string;
  items: { id: number; name: string; qty: number; price: number }[];
};
export type PlaceOrderInput = {
  name: string;
  phone: string;
  method: "pickup" | "hotel";
  location: string;
  deliveryDate: string;
};
export type PlaceOrderResult =
  | { ok: true; order: Order }
  | { ok: false; error: string };
const Context = createContext<{
  open: (p: Panel) => void;
  add: (p: Product, n?: number) => boolean;
  loaded: boolean;
  cart: Cart;
  orders: Order[];
  ordersLoaded: boolean;
  refreshOrders: () => void;
  placeOrder: (input: PlaceOrderInput) => Promise<PlaceOrderResult>;
}>({
  open: () => {},
  add: () => false,
  loaded: false,
  cart: {},
  orders: [],
  ordersLoaded: false,
  refreshOrders: () => {},
  placeOrder: async () => ({ ok: false, error: "belum siap" }),
});
export const useMarket = () => useContext(Context);
export function Logo() {
  return (
    <Link href="/" className="logo" aria-label="souveniraceh, beranda">
      <img
        className="heritage-mark"
        src="/icon.svg"
        width="35"
        height="35"
        alt=""
      />
      <b>
        souvenir<span>aceh</span>
      </b>
    </Link>
  );
}
function read<T>(key: string, fallback: T): T {
  try {
    return JSON.parse(localStorage.getItem(key) || "null") ?? fallback;
  } catch {
    return fallback;
  }
}
function save(key: string, data: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {}
}
const ORDER_IDS_KEY = "buah-tangan.order-ids.v1";
function readOrderIds(): string[] {
  const ids = read<string[]>(ORDER_IDS_KEY, []);
  return Array.isArray(ids) ? ids : [];
}
function saveOrderIds(ids: string[]) {
  save(ORDER_IDS_KEY, ids);
}
export function Storefront({ children }: { children: ReactNode }) {
  const pathname = usePathname(),
    { products, shops, reload } = useCatalog(),
    [panel, setPanel] = useState<Panel>(null),
    [shown, setShown] = useState<Exclude<Panel, null>>("menu"),
    [cart, setCart] = useState<Cart>({}),
    [orders, setOrders] = useState<Order[]>([]),
    [ordersLoaded, setOrdersLoaded] = useState(false),
    [loaded, setLoaded] = useState(false);
  const [removed, setRemoved] = useState<{
    product: Product;
    quantity: number;
  } | null>(null);
  const [query, setQuery] = useState(""),
    [toast, setToast] = useState(""),
    timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    setCart(read<Cart>("buah-tangan.cart.v1", {}));
    setLoaded(true);
  }, []);
  // Once live stock arrives, drop cart entries for products that no longer
  // exist and clamp quantities that now exceed current stock.
  useEffect(() => {
    if (!products.length) return;
    setCart((old) => {
      const clean: Cart = {};
      products.forEach((p) => {
        const n = Number(old[p.slug]);
        if (Number.isInteger(n) && n > 0) clean[p.slug] = Math.min(n, p.stock);
      });
      return clean;
    });
  }, [products]);
  useEffect(() => {
    if (loaded) save("buah-tangan.cart.v1", cart);
  }, [cart, loaded]);
  const refreshOrders = useCallback(async () => {
    const ids = readOrderIds();
    if (!ids.length) {
      setOrders([]);
      setOrdersLoaded(true);
      return;
    }
    const results = await Promise.all(
      ids.map((id) =>
        fetch(API_URL + "/api/orders/" + id, { cache: "no-store" })
          .then((res) => (res.ok ? (res.json() as Promise<Order>) : null))
          .catch(() => null),
      ),
    );
    const valid = results.filter((o): o is Order => o !== null);
    valid.sort((a, b) => (a.placedAt < b.placedAt ? 1 : -1));
    setOrders(valid);
    setOrdersLoaded(true);
  }, []);
  useEffect(() => {
    refreshOrders();
  }, [refreshOrders]);
  useEffect(() => {
    setPanel(null);
  }, [pathname]);
  const opener = useRef<HTMLElement | null>(null);
  useEffect(() => {
    function searchShortcut(event: KeyboardEvent) {
      const target = event.target;
      if (
        panel ||
        event.key !== "/" ||
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        !(target instanceof HTMLElement) ||
        target.closest("input,textarea,select,[contenteditable=true]")
      )
        return;
      event.preventDefault();
      opener.current = document.activeElement as HTMLElement;
      setQuery("");
      setPanel("search");
    }
    document.addEventListener("keydown", searchShortcut);
    return () => document.removeEventListener("keydown", searchShortcut);
  }, [panel]);
  const rows = products.filter((p) => cart[p.slug] > 0),
    count = rows.reduce((a, p) => a + cart[p.slug], 0),
    total = rows.reduce((a, p) => a + p.price * cart[p.slug], 0);
  function open(p: Panel) {
    if (!panel && p) opener.current = document.activeElement as HTMLElement;
    setToast("");
    setPanel(p);
    if (p) setShown(p);
    setRemoved(null);
    if (p === "search") setQuery("");
  }
  function add(p: Product, n = 1) {
    setCart((old) => ({
      ...old,
      [p.slug]: Math.min(p.stock, (old[p.slug] || 0) + n),
    }));
    setToast(
      (cart[p.slug] || 0) >= p.stock
        ? "Jumlah sudah mencapai stok tersedia."
        : p.name + " masuk keranjang.",
    );
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(""), 3500);
    return (cart[p.slug] || 0) < p.stock;
  }
  function change(p: Product, n: number) {
    if (n < 1) setRemoved({ product: p, quantity: cart[p.slug] });

    setCart((prev) => {
      const updated = { ...prev };
      if (n < 1) delete updated[p.slug];
      else updated[p.slug] = Math.min(n, p.stock);
      return updated;
    });
  }
  async function placeOrder(
    input: PlaceOrderInput,
  ): Promise<PlaceOrderResult> {
    if (!rows.length) return { ok: false, error: "Keranjang masih kosong." };
    try {
      const res = await fetch(API_URL + "/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: input.name,
          phone: input.phone,
          method: input.method,
          location: input.location,
          deliveryDate: input.deliveryDate,
          items: rows.map((p) => ({ slug: p.slug, qty: cart[p.slug] })),
        }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        return {
          ok: false,
          error: body?.error || "Gagal membuat pesanan. Coba lagi.",
        };
      }
      const order = body as Order;
      saveOrderIds([order.id, ...readOrderIds()]);
      setOrders((prev) => [order, ...prev]);
      setOrdersLoaded(true);
      setCart({});
      reload();
      return { ok: true, order };
    } catch {
      return {
        ok: false,
        error: "Tidak dapat menghubungi server. Periksa koneksi Anda.",
      };
    }
  }
  const results = products.filter((p) =>
    query
      .trim()
      .toLocaleLowerCase()
      .split(/\s+/)
      .every((w) =>
        (p.name + " " + p.shop.name + " " + p.shop.origin + " " + p.category.name)
          .toLowerCase()
          .includes(w),
      ),
  );
  const titles = {
    cart: "Keranjang Anda",
    search: "Cari oleh oleh",
    guide: "Cara pesan",
    menu: "Jelajahi souveniraceh",
  };
  const nav = (
    <>
      <Link className={pathname === "/" ? "active" : ""} href="/">
        Beranda
      </Link>
      <button
        className={
          pathname?.startsWith("/produk") || panel === "menu" ? "active" : ""
        }
        aria-haspopup="dialog"
        aria-expanded={panel === "menu"}
        onClick={() => open("menu")}
      >
        Katalog <ChevronDown size={14} />
      </button>
      <button onClick={() => open("guide")}>Cara Pesan</button>
      <Link
        className={pathname?.startsWith("/pesanan") ? "active" : ""}
        href="/pesanan/"
      >
        Pesanan Saya
      </Link>
    </>
  );
  return (
    <Context.Provider
      value={{
        open,
        add,
        loaded,
        cart,
        orders,
        ordersLoaded,
        refreshOrders,
        placeOrder,
      }}
    >
      <a className="skip" href="#utama">
        Langsung ke konten
      </a>
      <header>
        <div className="shell header-inner">
          <Logo />
          <nav aria-label="Navigasi utama">{nav}</nav>
          <div className="header-actions">
            <button
              className="icon-btn header-search"
              onClick={() => open("search")}
              aria-label="Cari produk"
            >
              <Search />
              <span className="search-word">Cari oleh oleh</span>
            </button>
            <span className="vline" />
            <button
              className="cart-btn"
              onClick={() => open("cart")}
              aria-label={"Keranjang " + count}
            >
              <ShoppingBag size={17} />
              <span>Keranjang</span>
              <b>{count}</b>
            </button>
            <button
              className="icon-btn mobile-menu"
              aria-label="Buka menu"
              aria-haspopup="dialog"
              aria-expanded={panel === "menu"}
              onClick={() => open("menu")}
            >
              <Menu />
            </button>
          </div>
        </div>
      </header>
      {children}
      <footer>
        <div className="shell footer-inner">
          <Logo />
          <span className="footer-place">
            <MapPin size={15} />
            Banda Aceh, Indonesia
          </span>
          <button onClick={() => open("guide")}>Cara pesan</button>
          <Link href="/pesanan/">Pesanan saya</Link>
        </div>
      </footer>
      <div className={"toast " + (toast ? "shown" : "")} role="status">
        {toast && (
          <>
            <Check size={16} />
            {toast}
            <button onClick={() => open("cart")}>Lihat</button>
          </>
        )}
      </div>
      <Dialog.Root
        open={panel !== null}
        onOpenChange={(v) => {
          if (!v) setPanel(null);
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="overlay" />
          <Dialog.Content
            className={
              "modal " + (shown === "cart" ? "drawer" : "panel-" + shown)
            }
            onCloseAutoFocus={(event) => {
              if (opener.current?.isConnected) {
                event.preventDefault();
                opener.current.focus({ preventScroll: true });
              }
            }}
            aria-describedby={undefined}
          >
            <div className="modal-head">
              <Dialog.Title>{titles[shown]}</Dialog.Title>
              <Dialog.Close className="icon-btn" aria-label="Tutup">
                <X />
              </Dialog.Close>
            </div>
            {shown === "menu" && (
              <CollectionMenu
                onClose={() => open(null)}
                onGuide={() => open("guide")}
              />
            )}
            {shown === "guide" && (
              <div className="guide">
                <p>
                  Satu keranjang untuk oleh oleh dari beberapa pembuat lokal.
                </p>
                {[
                  [
                    Compass,
                    "Pilih oleh oleh",
                    "Jelajahi katalog, lalu cek daya simpan dan ukuran produk sebelum menambahkannya ke keranjang.",
                  ],
                  [
                    MapPin,
                    "Tentukan tempat dan tanggal",
                    "Pilih antar ke hotel di Banda Aceh atau ambil di titik serah, mulai besok hingga 14 hari ke depan.",
                  ],
                  [
                    PackageCheck,
                    "Simpan rincian pesanan",
                    "Isi detail penerima dan pilih cara menerima pesanan. Rinciannya bisa dibuka melalui Pesanan saya.",
                  ],
                ].map(([Icon, t, d]) => {
                  const I = Icon as typeof Compass;
                  return (
                    <div className="guide-row" key={String(t)}>
                      <I />
                      <div>
                        <h3>{String(t)}</h3>
                        <p>{String(d)}</p>
                      </div>
                    </div>
                  );
                })}
                <Link
                  className="btn primary"
                  href="/produk/"
                  onClick={() => open(null)}
                >
                  Jelajahi katalog
                </Link>
              </div>
            )}
            {shown === "search" && (
              <>
                <label className="input-icon">
                  <Search size={18} />
                  <input
                    autoFocus
                    value={query}
                    maxLength={100}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Cari produk"
                    aria-label="Kata pencarian"
                  />
                </label>
                <div className="search-results">
                  {results.map((p) => (
                    <Link
                      href={"/produk/" + p.slug + "/"}
                      key={p.slug}
                      onClick={() => open(null)}
                    >
                      <img src={photo(p)} alt="" />
                      <span>
                        <strong>{p.name}</strong>
                        <small>{p.shop.name}</small>
                      </span>
                      <b>{money(p.price)}</b>
                    </Link>
                  ))}
                  {!results.length && (
                    <p>
                      Produk tidak ditemukan. Coba nama produk atau daerah lain.
                    </p>
                  )}
                </div>
              </>
            )}
            {shown === "cart" && removed && (
              <div className="undo-remove">
                <span role="status">{removed.product.name} dihapus.</span>
                <button
                  onClick={() => {
                    change(removed.product, removed.quantity);
                    setRemoved(null);
                  }}
                >
                  Urungkan
                </button>
              </div>
            )}
            {shown === "cart" &&
              (rows.length ? (
                <>
                  <div className="cart-rows">
                    {shops.map((s) => {
                      const shopRows = rows.filter((p) => p.shop.id === s.id);
                      if (!shopRows.length) return null;
                      return (
                          <section key={s.slug}>
                            <h3 className="shop-tag">
                              <Store size={15} />
                              {s.name}
                            </h3>
                            {shopRows
                              .map((p) => (
                                <div className="cart-row" key={p.slug}>
                                  <img src={photo(p)} alt={p.name} />
                                  <div className="grow">
                                    <h4>{p.name}</h4>
                                    <small>{p.size}</small>
                                    <div className="stepper">
                                      <button
                                        aria-label={"Kurangi " + p.name}
                                        onClick={() =>
                                          change(p, cart[p.slug] - 1)
                                        }
                                      >
                                        <Minus />
                                      </button>
                                      <span>{cart[p.slug]}</span>
                                      <button
                                        disabled={cart[p.slug] >= p.stock}
                                        aria-label={"Tambah " + p.name}
                                        onClick={() =>
                                          change(p, cart[p.slug] + 1)
                                        }
                                      >
                                        <Plus />
                                      </button>
                                    </div>
                                  </div>
                                  <div className="cart-price">
                                    <b>{money(p.price * cart[p.slug])}</b>
                                    <button
                                      className="icon-btn"
                                      aria-label={"Hapus " + p.name}
                                      onClick={() => change(p, 0)}
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                          </section>
                      );
                    })}
                  </div>
                  <div className="cart-bottom">
                    <div className="summary-line">
                      <span>Subtotal</span>
                      <b>{money(total)}</b>
                    </div>
                    <p>Ambil sendiri gratis · Antar hotel Rp15.000.</p>
                    <Link
                      className="btn primary wide"
                      href="/checkout/"
                      onClick={() => open(null)}
                    >
                      Lanjut ke checkout
                    </Link>
                  </div>
                </>
              ) : (
                <Empty
                  icon="bag"
                  title="Keranjang masih kosong"
                  text="Pilih kopi, camilan, atau kerajinan untuk dibawa pulang."
                  close={() => open(null)}
                />
              ))}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </Context.Provider>
  );
}
function Empty({
  icon,
  title,
  text,
  close,
}: {
  icon: string;
  title: string;
  text: string;
  close: () => void;
}) {
  return (
    <div className="empty">
      {icon === "bag" ? <ShoppingBasket /> : <NotebookTabs />}
      <h3>{title}</h3>
      <p>{text}</p>
      <Link className="btn primary" href="/produk/" onClick={close}>
        Jelajahi katalog
      </Link>
    </div>
  );
}
