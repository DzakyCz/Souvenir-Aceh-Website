"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export type Category = {
  id: number;
  slug: string;
  name: string;
  short: string;
  caption: string;
  icon: string | null;
};
export type Shop = {
  id: number;
  slug: string;
  name: string;
  origin: string;
  description: string;
};
export type Product = {
  id: number;
  slug: string;
  name: string;
  categoryId: number;
  category: Category;
  shopId: number;
  shop: Shop;
  price: number;
  size: string;
  shelfLifeDays: number;
  stock: number;
  imageUrl: string | null;
  description: string;
  createdAt: string;
  updatedAt: string;
};

export const money = (value: number) =>
  "Rp" + new Intl.NumberFormat("id-ID").format(value);
export const photo = (p: Product) => p.imageUrl || "/img/products-0.webp";

type CatalogState = {
  categories: Category[];
  shops: Shop[];
  products: Product[];
  loaded: boolean;
  error: string | null;
  reload: () => void;
};
const Context = createContext<CatalogState>({
  categories: [],
  shops: [],
  products: [],
  loaded: false,
  error: null,
  reload: () => {},
});
export const useCatalog = () => useContext(Context);

async function fetchJSON(path: string) {
  const res = await fetch(API_URL + path, { cache: "no-store" });
  if (!res.ok) throw new Error("gagal memuat " + path);
  return res.json();
}

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [c, s, p] = await Promise.all([
        fetchJSON("/api/categories"),
        fetchJSON("/api/shops"),
        fetchJSON("/api/products"),
      ]);
      setCategories(c);
      setShops(s);
      setProducts(p);
      setError(null);
    } catch {
      setError("Gagal memuat katalog. Periksa koneksi lalu coba lagi.");
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <Context.Provider
      value={{ categories, shops, products, loaded, error, reload: load }}
    >
      {children}
    </Context.Provider>
  );
}
