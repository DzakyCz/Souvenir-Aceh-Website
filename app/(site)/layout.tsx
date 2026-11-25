import { Storefront } from "../../components/store";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Storefront>{children}</Storefront>;
}
