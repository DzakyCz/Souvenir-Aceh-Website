# Souvenir Aceh

Website etalase dan pemesanan oleh oleh khas Aceh. Frontend Next.js yang dipanggil lewat HTTP ke [backend Go + PostgreSQL](backend/README.md) untuk katalog, checkout, dan admin.

## Fitur

- Katalog produk dengan pencarian, filter, dan pengurutan.
- Halaman detail produk dan etalase mitra.
- Keranjang lintas toko serta pilihan ambil di tempat atau antar hotel.
- Checkout dan pelacakan status pesanan lewat API backend.
- Halaman admin untuk mengelola produk dan status pesanan.
- Tampilan responsif untuk desktop dan mobile.

## Teknologi

- Next.js 15 dengan App Router
- React 19 dan TypeScript
- Tailwind CSS
- Radix UI
- GSAP
- Lucide React
- Fontsource (DM Sans)

## Menjalankan Proyek

Persyaratan: Node.js 22 atau lebih baru, npm, dan [backend](backend/README.md) yang sudah jalan.

```bash
cp .env.local.example .env.local   # NEXT_PUBLIC_API_URL, default http://localhost:8080
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000). Untuk memakai port lain:

```bash
npm run dev -- -p 3002
```

Pemeriksaan tipe:

```bash
npm run typecheck
```

## Build Produksi

```bash
npm run build
```

Frontend di-build sebagai aplikasi Next.js biasa (server-rendered), bukan situs statis — pastikan `NEXT_PUBLIC_API_URL` mengarah ke backend yang bisa diakses saat runtime.

## Struktur Proyek

```text
app/(site)/     Halaman publik: katalog, produk, checkout, pesanan
app/admin/      Halaman admin: login, kelola produk dan status pesanan
components/     Komponen antarmuka dan state
backend/        API Go + PostgreSQL (lihat backend/README.md)
public/img/     Aset gambar
```

## Catatan

Data produk, harga, mitra, dan status pengiriman disimpan di database lewat backend — lihat [backend/README.md](backend/README.md) untuk setup database (Docker Postgres lokal atau Supabase).
