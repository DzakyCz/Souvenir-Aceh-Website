# Souvenir Aceh — Backend API

Backend REST (Go + PostgreSQL) untuk katalog, checkout, dan admin produk/pesanan. Terpisah dari frontend Next.js, dipanggil lewat HTTP + CORS.

## Menjalankan

Persyaratan: Go 1.22+.

Database bisa pakai PostgreSQL lokal lewat Docker, atau database cloud seperti Supabase — backend hanya butuh `DATABASE_URL` yang valid.

### Opsi A — PostgreSQL lokal via Docker

```bash
cp .env.example .env
docker compose up -d        # jalankan PostgreSQL
go run ./cmd/api             # jalankan API di :8080
```

### Opsi B — Supabase

1. Buat project di [supabase.com](https://supabase.com), lalu ambil connection string di **Project Settings > Database > Connection string**.
2. Set `DATABASE_URL` di `.env` ke string tersebut dengan `?sslmode=require`, contoh:
   ```
   DATABASE_URL=postgres://postgres.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres?sslmode=require
   ```
3. **Pakai Session pooler (port 5432), bukan Transaction pooler (port 6543).** Transaction pooler membagi koneksi Postgres mentah antar banyak client sehingga cache prepared-statement ORM bentrok (`ERROR: prepared statement ... already exists`, SQLSTATE 42P05) dan query gagal dengan 500. Session pooler memberi setiap koneksi backend session sendiri.
4. Hostname direct connection (`db.<ref>.supabase.co`) project baru biasanya IPv6-only — kalau network tidak punya rute IPv6, gunakan pooler (selalu punya IPv4) seperti di atas, bukan direct connection.

```bash
go run ./cmd/api
```

Saat pertama kali jalan, database di-migrasi otomatis dan diisi data contoh (4 kategori, 3 toko, 6 produk) serta satu akun admin dari `ADMIN_USERNAME`/`ADMIN_PASSWORD` di `.env`. Lewat pooler cloud, migrasi awal ini bisa makan waktu 1-2 menit karena tiap query ada roundtrip jaringan.

## Endpoint

Publik:

- `GET /api/categories`, `GET /api/shops`
- `GET /api/products?category=&q=&sort=harga_asc|harga_desc`
- `GET /api/products/{slug}`
- `POST /api/orders` — checkout, body: `{name, phone, method: "pickup"|"hotel", location, deliveryDate, items: [{slug, qty}]}`
- `GET /api/orders/{id}` — lacak status pesanan

Admin (header `Authorization: Bearer <token>` dari `/api/admin/login`):

- `POST /api/admin/login` — `{username, password}`
- `GET/POST /api/admin/products`, `PUT/DELETE /api/admin/products/{id}`
- `GET /api/admin/orders?status=`
- `PATCH /api/admin/orders/{id}/status` — `{status}` (`created`, `processing`, `ready`, `completed`, `cancelled`)
