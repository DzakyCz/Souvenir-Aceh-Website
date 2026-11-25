import { notFound } from "next/navigation";
import { ProductDetail } from "../../../../components/market";
import type { Product } from "../../../../components/catalog";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

type Params = { params: Promise<{ slug: string }> };

async function getProduct(slug: string): Promise<Product | null> {
  const res = await fetch(API_URL + "/api/products/" + slug, {
    cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("gagal memuat produk");
  return res.json();
}

async function getAllProducts(): Promise<Product[]> {
  const res = await fetch(API_URL + "/api/products", { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const product = await getProduct(slug);
  return { title: product?.name };
}

export default async function Page({ params }: Params) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const all = await getAllProducts();
  const related = all.filter(
    (x) => x.shop.id === product.shop.id && x.slug !== product.slug,
  );

  return <ProductDetail product={product} related={related} />;
}
