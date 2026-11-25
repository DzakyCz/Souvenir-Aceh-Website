# Souvenir Aceh

Website etalase dan pemesanan oleh oleh khas Aceh. Proyek ini berupa prototipe frontend dengan data contoh dan alur checkout simulasi.

## Fitur

- Katalog produk dengan pencarian, filter, dan pengurutan.
- Halaman detail produk dan etalase mitra.
- Keranjang lintas toko serta pilihan ambil di tempat atau antar hotel.
- Checkout simulasi dan riwayat pesanan yang tersimpan di browser.
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

Persyaratan: Node.js 22 atau lebih baru dan npm.

```bash
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

Perintah ini menghasilkan situs statis di folder `out/` yang dapat diunggah ke layanan static hosting.

## Struktur Proyek

```text
app/            Halaman dan routing Next.js
components/     Komponen antarmuka, data katalog, dan state
public/img/     Aset gambar
```

## Catatan

Seluruh transaksi berjalan di browser. Data produk, harga, mitra, dan pengiriman adalah contoh untuk keperluan demo, bukan layanan nyata.
