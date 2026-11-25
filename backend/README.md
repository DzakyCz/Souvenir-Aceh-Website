# Souvenir Aceh — Backend API

Backend REST (Go + PostgreSQL) untuk katalog, checkout, dan admin produk/pesanan. Terpisah dari frontend Next.js, dipanggil lewat HTTP + CORS.

## Menjalankan

Persyaratan: Go 1.22+, Docker.

```bash
cp .env.example .env
docker compose up -d        # jalankan PostgreSQL
go run ./cmd/api             # jalankan API di :8080
```

Saat pertama kali jalan, database di-migrasi otomatis dan diisi data contoh (4 kategori, 3 toko, 6 produk) serta satu akun admin dari `ADMIN_USERNAME`/`ADMIN_PASSWORD` di `.env`.

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
