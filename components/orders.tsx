"use client";
import Link from "next/link";
import {
  CalendarDays,
  Check,
  Hotel,
  MapPin,
  NotebookTabs,
  Store,
} from "lucide-react";
import { useMarket, type Order } from "./store";
import { money } from "./catalog";
import { Breadcrumb } from "./market";

function longDate(value: string) {
  const parsed = new Date(value + "T12:00:00");
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(parsed);
}
function placedOn(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(parsed);
}

const statusOrder = ["created", "processing", "ready", "completed"];
const steps = [
  "Pesanan dibuat",
  "Sedang disiapkan",
  "Siap diserahkan",
  "Selesai diambil",
];
const statusLabel: Record<string, string> = {
  created: "Pesanan dibuat",
  processing: "Sedang disiapkan",
  ready: "Siap diserahkan",
  completed: "Selesai diambil",
  cancelled: "Dibatalkan",
};

function OrderCard({ order }: { order: Order }) {
  const stage = statusOrder.indexOf(order.status);
  const cancelled = order.status === "cancelled";
  const placed = order.placedAt ? placedOn(order.placedAt) : "";
  return (
    <article className="order-card">
      <div className="order-top">
        <div className="order-id">
          <span className="ui-badge">
            <NotebookTabs size={14} />
            {order.id}
          </span>
          {placed && <small>Dibuat {placed} WIB</small>}
        </div>
        <span className={"order-status status-" + (cancelled ? 2 : stage)}>
          {statusLabel[order.status] || order.status}
        </span>
      </div>
      {!cancelled && (
      <ol className="order-track">
        {steps.map((label, i) => {
          const state = stage > i ? "done" : stage === i ? "active" : "next";
          return (
            <li key={label} className={state}>
              <span className="order-dot" aria-hidden="true">
                {state === "done" && <Check size={11} strokeWidth={3} />}
              </span>
              <small>
                {label}
                <span className="sr-only">
                  {state === "done"
                    ? " — selesai"
                    : state === "active"
                      ? " — tahap saat ini"
                      : " — belum"}
                </span>
              </small>
            </li>
          );
        })}
      </ol>
      )}
      <div className="order-facts">
        <p>
          <CalendarDays size={16} />
          Serah {longDate(order.deliveryDate)}
        </p>
        <p>
          <MapPin size={16} />
          {order.location}
        </p>
        {order.fee !== undefined && (
          <p>
            {order.fee > 0 ? <Hotel size={16} /> : <Store size={16} />}
            {order.fee > 0 ? "Antar hotel" : "Ambil sendiri"}
          </p>
        )}
      </div>
      <div className="order-items">
        {order.items.map((item) => (
          <div className="summary-line" key={item.id}>
            <span>{item.name}</span>
            <b>× {item.qty}</b>
          </div>
        ))}
        <div className="summary-line order-total">
          <strong>Total</strong>
          <b>{money(order.total)}</b>
        </div>
      </div>
    </article>
  );
}

export function Orders() {
  const { orders, ordersLoaded } = useMarket();
  return (
    <main id="utama" className="shell page">
      <Breadcrumb items={[{ name: "Pesanan saya" }]} />
      <div className="page-heading">
        <div className="eyebrow">RIWAYAT PESANAN</div>
        <h1>
          Pesanan <em>saya.</em>
        </h1>
        <p>
          Lacak pesanan yang sudah Anda buat. Status diperbarui oleh admin dan
          riwayat ini tersimpan di peramban perangkat ini saja.
        </p>
      </div>
      {!ordersLoaded ? (
        <p role="status">Memuat pesanan…</p>
      ) : !orders.length ? (
        <section className="checkout-card empty">
          <NotebookTabs />
          <h2>Belum ada pesanan</h2>
          <p>Pesanan Anda akan tersimpan di sini setelah checkout.</p>
          <Link className="btn primary" href="/produk/">
            Jelajahi katalog
          </Link>
        </section>
      ) : (
        <div className="order-list">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </main>
  );
}
