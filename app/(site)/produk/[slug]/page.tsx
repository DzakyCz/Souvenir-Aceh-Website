import { products } from "../../../components/catalog";
import { ProductDetail } from "../../../components/market";
import { notFound } from "next/navigation";
export const generateStaticParams = () =>
  products.map(({ slug }) => ({ slug }));
export const dynamicParams = false;
type Params = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  return { title: products.find((p) => p.slug === slug)?.name };
}
export default async function Page({ params }: Params) {
  const { slug } = await params;
  const p = products.find((x) => x.slug === slug);
  if (!p) notFound();
  return <ProductDetail p={p} />;
}
