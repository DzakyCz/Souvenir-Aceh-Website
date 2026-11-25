"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
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

/** Today in Aceh (WIB) as YYYY-MM-DD, so it can be compared to order.date. */
function todayInAceh() {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
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

const steps = ["Pesanan dibuat", "Sedang disiapkan", "Siap diserahkan"];
const statusLabel = [
  "Sedang disiapkan",
  "Siap diserahkan hari ini",
  "Sudah lewat tanggal serah",
];

/**
 * Tanpa backend, status dihitung dari tanggal serah:
 * 0 = belum sampai tanggalnya, 1 = hari ini, 2 = sudah lewat.
 */
function stageOf(date: string, today: string) {
  if (today < date) return 0;
  return today === date ? 1 : 2;
}

function OrderCard({ order, today }: { order: Order; today: string }) {
  const stage = stageOf(order.date, today);
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
        <span className={"order-status status-" + stage}>
          {statusLabel[stage]}
        </span>
      </div>
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
      <div className="order-facts">
        <p>
          <CalendarDays size={16} />
          Serah {longDate(order.date)}
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
          <div className="summary-line" key={item.name}>
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
  const { orders, loaded } = useMarket();
  const [today, setToday] = useState("");
  useEffect(() => setToday(todayInAceh()), []);
  const ready = loaded && today;
  return (
    <main id="utama" className="shell page">
      <Breadcrumb items={[{ name: "Pesanan saya" }]} />
      <div className="page-heading">
        <div className="eyebrow">RIWAYAT PESANAN</div>
        <h1>
          Pesanan <em>saya.</em>
        </h1>
        <p>
          Lacak pesanan yang sudah Anda buat. Status mengikuti tanggal serah dan
          riwayat ini tersimpan di peramban perangkat ini saja.
        </p>
      </div>
      {!ready ? (
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
            <OrderCard key={order.id} order={order} today={today} />
          ))}
        </div>
      )}
    </main>
  );
}
