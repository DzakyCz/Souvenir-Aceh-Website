"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { LogOut, Package, NotebookTabs } from "lucide-react";
import { useAdminAuth } from "./auth";

export function AdminShell({ children }: { children: ReactNode }) {
  const { token, ready, logout } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (ready && !token) router.replace("/admin/login");
  }, [ready, token, router]);

  if (!ready || !token) {
    return (
      <main className="shell page">
        <p role="status">Memeriksa sesi admin…</p>
      </main>
    );
  }

  return (
    <>
      <header>
        <div className="shell header-inner">
          <b>souveniraceh admin</b>
          <nav aria-label="Navigasi admin" style={{ display: "flex", gap: 8 }}>
            <Link
              className={pathname?.startsWith("/admin/produk") ? "active" : ""}
              href="/admin/produk"
            >
              <Package size={16} /> Produk
            </Link>
            <Link
              className={pathname?.startsWith("/admin/pesanan") ? "active" : ""}
              href="/admin/pesanan"
            >
              <NotebookTabs size={16} /> Pesanan
            </Link>
          </nav>
          <button
            className="btn outline"
            onClick={() => {
              logout();
              router.replace("/admin/login");
            }}
          >
            <LogOut size={16} /> Keluar
          </button>
        </div>
      </header>
      <main className="shell page">{children}</main>
    </>
  );
}
