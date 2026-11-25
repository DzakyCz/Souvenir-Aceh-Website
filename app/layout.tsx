import type { Metadata } from "next";
import "@fontsource-variable/dm-sans";
import "./globals.css";
import "./shop.css";
import { CatalogProvider } from "../components/catalog";
export const metadata: Metadata = {
  title: {
    default: "souveniraceh Oleh oleh khas Aceh",
    template: "%s · souveniraceh",
  },
  description:
    "Jelajahi kopi Gayo, kue tradisional, dan kerajinan Aceh dari mitra lokal. Pilih antar hotel atau ambil di Banda Aceh.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body>
        {/* Runs before the page below it is parsed, so grids marked with
            data-reveal are already hidden by the time anything paints. */}
        <script
          dangerouslySetInnerHTML={{
            __html: 'document.documentElement.dataset.js="1"',
          }}
        />
        <CatalogProvider>{children}</CatalogProvider>
      </body>
    </html>
  );
}
