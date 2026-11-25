"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { money, useCatalog, type Product } from "../catalog";
import { useAdminFetch } from "./auth";
import { Choice } from "../choice";

type Draft = {
  slug: string;
  name: string;
  categoryId: string;
  shopId: string;
  price: string;
  size: string;
  shelfLifeDays: string;
  stock: string;
  imageUrl: string;
  description: string;
};

const emptyDraft: Draft = {
  slug: "",
  name: "",
  categoryId: "",
  shopId: "",
  price: "",
  size: "",
  shelfLifeDays: "0",
  stock: "0",
  imageUrl: "",
  description: "",
};

function toDraft(p: Product): Draft {
  return {
    slug: p.slug,
    name: p.name,
    categoryId: String(p.categoryId),
    shopId: String(p.shopId),
    price: String(p.price),
    size: p.size,
    shelfLifeDays: String(p.shelfLifeDays),
    stock: String(p.stock),
    imageUrl: p.imageUrl || "",
    description: p.description,
  };
}

export function ProductsAdmin() {
  const { categories, shops } = useCatalog();
  const adminFetch = useAdminFetch();
  const [products, setProducts] = useState<Product[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await adminFetch("/api/admin/products");
      if (!res.ok) throw new Error("gagal memuat produk");
      setProducts(await res.json());
      setError("");
    } catch {
      setError("Gagal memuat produk.");
    } finally {
      setLoaded(true);
    }
  }, [adminFetch]);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setEditing(null);
    setDraft({
      ...emptyDraft,
      categoryId: categories[0] ? String(categories[0].id) : "",
      shopId: shops[0] ? String(shops[0].id) : "",
    });
    setFormError("");
    setOpen(true);
  }
  function openEdit(p: Product) {
    setEditing(p);
    setDraft(toDraft(p));
    setFormError("");
    setOpen(true);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.categoryId || !draft.shopId) {
      setFormError("Pilih kategori dan toko.");
      return;
    }
    setSubmitting(true);
    setFormError("");
    const body = {
      slug: draft.slug.trim(),
      name: draft.name.trim(),
      categoryId: Number(draft.categoryId),
      shopId: Number(draft.shopId),
      price: Number(draft.price) || 0,
      size: draft.size.trim(),
      shelfLifeDays: Number(draft.shelfLifeDays) || 0,
      stock: Number(draft.stock) || 0,
      imageUrl: draft.imageUrl.trim(),
      description: draft.description.trim(),
    };
    try {
      const res = await adminFetch(
        editing ? "/api/admin/products/" + editing.id : "/api/admin/products",
        { method: editing ? "PUT" : "POST", body: JSON.stringify(body) },
      );
      const result = await res.json().catch(() => null);
      if (!res.ok) {
        setFormError(result?.error || "Gagal menyimpan produk.");
        return;
      }
      setOpen(false);
      load();
    } catch {
      setFormError("Tidak dapat menghubungi server.");
    } finally {
      setSubmitting(false);
    }
  }

  async function remove(p: Product) {
    if (!confirm("Hapus produk " + p.name + "?")) return;
    const res = await adminFetch("/api/admin/products/" + p.id, {
      method: "DELETE",
    });
    if (res.ok) load();
  }

  return (
    <div>
      <div className="summary-line">
        <h1>Produk</h1>
        <button className="btn primary" onClick={openCreate}>
          <Plus size={16} /> Tambah produk
        </button>
      </div>
      {!loaded ? (
        <p role="status">Memuat produk…</p>
      ) : error ? (
        <p role="status">{error}</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nama</th>
                <th>Kategori</th>
                <th>Toko</th>
                <th>Harga</th>
                <th>Stok</th>
                <th aria-label="Aksi" />
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.category?.name}</td>
                  <td>{p.shop?.name}</td>
                  <td>{money(p.price)}</td>
                  <td>{p.stock}</td>
                  <td className="admin-actions">
                    <button
                      className="icon-btn"
                      aria-label={"Ubah " + p.name}
                      onClick={() => openEdit(p)}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      className="icon-btn"
                      aria-label={"Hapus " + p.name}
                      onClick={() => remove(p)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!products.length && <p>Belum ada produk.</p>}
        </div>
      )}

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="overlay" />
          <Dialog.Content className="modal panel-guide" aria-describedby={undefined}>
            <div className="modal-head">
              <Dialog.Title>
                {editing ? "Ubah produk" : "Tambah produk"}
              </Dialog.Title>
              <Dialog.Close className="icon-btn" aria-label="Tutup">
                <X />
              </Dialog.Close>
            </div>
            <form onSubmit={submit} className="admin-form-grid">
              <label>
                Nama
                <input
                  required
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                />
              </label>
              <label>
                Slug (kosongkan untuk otomatis)
                <input
                  value={draft.slug}
                  onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
                />
              </label>
              <Choice
                label="Kategori"
                value={draft.categoryId}
                onChange={(categoryId) => setDraft({ ...draft, categoryId })}
                options={categories.map((c) => ({
                  value: String(c.id),
                  label: c.name,
                }))}
              />
              <Choice
                label="Toko"
                value={draft.shopId}
                onChange={(shopId) => setDraft({ ...draft, shopId })}
                options={shops.map((s) => ({
                  value: String(s.id),
                  label: s.name,
                }))}
              />
              <label>
                Harga (Rp)
                <input
                  required
                  type="number"
                  min={0}
                  value={draft.price}
                  onChange={(e) => setDraft({ ...draft, price: e.target.value })}
                />
              </label>
              <label>
                Stok
                <input
                  required
                  type="number"
                  min={0}
                  value={draft.stock}
                  onChange={(e) => setDraft({ ...draft, stock: e.target.value })}
                />
              </label>
              <label>
                Ukuran
                <input
                  value={draft.size}
                  onChange={(e) => setDraft({ ...draft, size: e.target.value })}
                  placeholder="250 g"
                />
              </label>
              <label>
                Daya simpan (hari, 0 jika tidak relevan)
                <input
                  type="number"
                  min={0}
                  value={draft.shelfLifeDays}
                  onChange={(e) =>
                    setDraft({ ...draft, shelfLifeDays: e.target.value })
                  }
                />
              </label>
              <label className="admin-field-wide">
                URL foto (opsional)
                <input
                  value={draft.imageUrl}
                  onChange={(e) =>
                    setDraft({ ...draft, imageUrl: e.target.value })
                  }
                  placeholder="https://…"
                />
              </label>
              <label className="admin-field-wide">
                Deskripsi
                <textarea
                  rows={3}
                  value={draft.description}
                  onChange={(e) =>
                    setDraft({ ...draft, description: e.target.value })
                  }
                />
              </label>
              {formError && (
                <p
                  role="alert"
                  className="admin-field-wide"
                  style={{ color: "var(--rust)" }}
                >
                  {formError}
                </p>
              )}
              <button
                className="btn primary admin-field-wide"
                disabled={submitting}
              >
                {submitting ? "Menyimpan…" : "Simpan"}
              </button>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
