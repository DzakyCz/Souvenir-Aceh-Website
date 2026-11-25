"use client";
import { useCallback, useEffect, useState } from "react";
import { money } from "../catalog";
import { type Order } from "../store";
import { useAdminFetch } from "./auth";
import { Choice } from "../choice";

const statuses = [
  { value: "", label: "Semua status" },
  { value: "created", label: "Pesanan dibuat" },
  { value: "processing", label: "Sedang disiapkan" },
  { value: "ready", label: "Siap diserahkan" },
  { value: "completed", label: "Selesai diambil" },
  { value: "cancelled", label: "Dibatalkan" },
];

export function OrdersAdmin() {
  const adminFetch = useAdminFetch();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await adminFetch(
        "/api/admin/orders" + (filter ? "?status=" + filter : ""),
      );
      if (!res.ok) throw new Error("gagal memuat pesanan");
      setOrders(await res.json());
      setError("");
    } catch {
      setError("Gagal memuat pesanan.");
    } finally {
      setLoaded(true);
    }
  }, [adminFetch, filter]);

  useEffect(() => {
    load();
  }, [load]);

  async function changeStatus(order: Order, status: string) {
    setUpdating(order.id);
    try {
      const res = await adminFetch(
        "/api/admin/orders/" + order.id + "/status",
        { method: "PATCH", body: JSON.stringify({ status }) },
      );
      if (res.ok) {
        const updated = await res.json();
        setOrders((prev) =>
          prev.map((o) => (o.id === order.id ? updated : o)),
        );
      }
    } finally {
      setUpdating(null);
    }
  }

  return (
    <div>
      <div className="summary-line">
        <h1>Pesanan</h1>
        <Choice
          label="Filter status"
          hideLabel
          value={filter}
          onChange={setFilter}
          options={statuses}
        />
      </div>
      {!loaded ? (
        <p role="status">Memuat pesanan…</p>
      ) : error ? (
        <p role="status">{error}</p>
      ) : !orders.length ? (
        <p>Belum ada pesanan.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Penerima</th>
                <th>Serah</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>
                    {order.customerName}
                    <br />
                    <small>{order.phone}</small>
                  </td>
                  <td>{order.deliveryDate}</td>
                  <td>{money(order.total)}</td>
                  <td>
                    <Choice
                      label={"Status pesanan " + order.id}
                      hideLabel
                      value={order.status}
                      onChange={(status) => changeStatus(order, status)}
                      options={statuses.filter((s) => s.value)}
                    />
                    {updating === order.id && <small> Menyimpan…</small>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
