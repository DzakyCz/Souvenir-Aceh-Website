"use client";
import Link from "next/link";
import { useState, useRef, useEffect, type FormEvent } from "react";
import {
  UserRound,
  Phone,
  CalendarDays,
  Hotel,
  Store,
  ShoppingBag,
  Check,
  MapPin,
} from "lucide-react";
import { useMarket } from "./store";
import { products, money, photo } from "./catalog";
import { Field } from "./field";
import { Choice } from "./choice";

const pickupLocations = [
  "Gerai souveniraceh, Banda Aceh",
  "Meja serah, Ulee Lheue",
];
function dateInAceh(offset: number) {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(Date.now() + offset * 86400000));
}

export function Checkout() {
  const { cart, loaded, open, placeOrder } = useMarket();
  const [draft, setDraft] = useState({
    name: "",
    phone: "",
    hotel: "",
    pickup: pickupLocations[0],
  });
  const [method, setMethod] = useState("pickup");
  const [date, setDate] = useState("");
  const [firstDay, setFirstDay] = useState("");
  const deliveryDate = date || firstDay;
  const [order, setOrder] = useState<ReturnType<typeof placeOrder>>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const rows = products.filter((p) => cart[p.slug] > 0);
  const total = rows.reduce((sum, p) => sum + p.price * cart[p.slug], 0);
  const fee = method === "hotel" ? 15000 : 0;
  useEffect(() => {
    const tomorrow = dateInAceh(1);
    setFirstDay(tomorrow);
    setDate((current) => current || tomorrow);
  }, []);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = placeOrder(
      deliveryDate,
      method === "hotel" ? draft.hotel.trim() : draft.pickup,
      fee,
    );
    if (result) setOrder(result);
  }
  useEffect(() => {
    if (order) {
      window.scrollTo(0, 0);
      heading.current?.focus({ preventScroll: true });
    }
  }, [order]);
  return (
    <main id="utama" className="shell page checkout-page">
      <nav className="checkout-path" aria-label="Posisi halaman">
        <Link href="/">Beranda</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">Checkout</span>
      </nav>
      <div className="checkout-heading">
        <h1 ref={heading} tabIndex={-1}>
          {order ? "Pesanan tersimpan" : "Checkout"}
        </h1>
        {!order && (
          <p>Lengkapi detail penerima dan periksa ringkasan pesanan.</p>
        )}
      </div>
      {order ? (
        <section
          className="checkout-card confirmation"
          aria-label="Rincian pesanan"
        >
          <span className="ui-badge">
            <Check size={15} />
            {order.id}
          </span>
          <p>
            <MapPin size={17} />
            {order.location}
          </p>
          <p>
            <CalendarDays size={17} />
            {new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(
              new Date(order.date + "T12:00:00"),
            )}
          </p>
          {order.items.map((item) => (
            <div className="summary-line" key={item.name}>
              <span>{item.name}</span>
              <b>× {item.qty}</b>
            </div>
          ))}
          <div className="summary-line checkout-total">
            <strong>Total</strong>
            <b>{money(order.total)}</b>
          </div>
          <Link className="btn primary" href="/produk/">
            Kembali ke katalog
          </Link>
        </section>
      ) : !loaded ? (
        <p role="status">Memuat keranjang…</p>
      ) : !rows.length ? (
        <section className="checkout-card empty">
          <ShoppingBag />
          <h2>Keranjang masih kosong</h2>
          <p>Pilih produk terlebih dahulu untuk melanjutkan.</p>
          <Link className="btn primary" href="/produk/">
            Jelajahi produk
          </Link>
        </section>
      ) : (
        <form onSubmit={submit} className="checkout checkout-grid">
          <div className="checkout-card checkout-fields">
            <fieldset className="contact-fields">
              <legend>Penerima</legend>
              <div>
                <Field
                  icon={UserRound}
                  label="Nama penerima"
                  name="name"
                  autoComplete="off"
                  placeholder="Nama lengkap"
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  required
                  minLength={2}
                  maxLength={80}
                  errorMessage="Isi nama penerima, minimal 2 karakter."
                />
                <Field
                  icon={Phone}
                  label="Nomor telepon"
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="off"
                  placeholder="08xxxxxxxxxx"
                  pattern="[+]?[0-9]{8,15}"
                  required
                  value={draft.phone}
                  onChange={(e) =>
                    setDraft({ ...draft, phone: e.target.value })
                  }
                  errorMessage="Gunakan 8 sampai 15 digit tanpa spasi, misalnya 081234567890."
                />
              </div>
            </fieldset>
            <fieldset className="receive-choice">
              <legend>Cara menerima pesanan</legend>
              <div>
                <label>
                  <input
                    type="radio"
                    name="metode"
                    value="pickup"
                    checked={method === "pickup"}
                    onChange={() => setMethod("pickup")}
                  />
                  <Store size={18} />
                  <strong>Ambil sendiri</strong>
                  <small>Gratis</small>
                </label>
                <label>
                  <input
                    type="radio"
                    name="metode"
                    value="hotel"
                    checked={method === "hotel"}
                    onChange={() => setMethod("hotel")}
                  />
                  <Hotel size={18} />
                  <strong>Antar hotel</strong>
                  <small>{money(15000)}</small>
                </label>
              </div>
            </fieldset>
            {method === "hotel" ? (
              <Field
                icon={Hotel}
                label="Nama dan alamat hotel"
                name="hotel"
                placeholder="Nama hotel, jalan, Banda Aceh"
                value={draft.hotel}
                onChange={(e) => setDraft({ ...draft, hotel: e.target.value })}
                required
                minLength={5}
                maxLength={160}
                errorMessage="Cantumkan nama dan alamat hotel Anda, minimal 5 karakter."
              />
            ) : (
              <Choice
                label="Titik ambil"
                value={draft.pickup}
                onChange={(pickup) => setDraft({ ...draft, pickup })}
                options={pickupLocations.map((location) => ({
                  value: location,
                  label: location,
                }))}
              />
            )}
            <Field
              icon={CalendarDays}
              label="Tanggal serah"
              type="date"
              min={firstDay || undefined}
              max={firstDay ? dateInAceh(14) : undefined}
              value={deliveryDate}
              onChange={(e) => setDate(e.target.value)}
              required
              errorMessage="Pilih tanggal mulai besok sampai 14 hari ke depan."
            />
          </div>
          <section
            className="checkout-card checkout-summary"
            aria-labelledby="summary-title"
          >
            <div className="summary-line">
              <h2 id="summary-title">Ringkasan pesanan</h2>
              <button
                type="button"
                className="btn outline"
                onClick={() => open("cart")}
              >
                Ubah
              </button>
            </div>
            <ul>
              {rows.map((p) => (
                <li key={p.slug}>
                  <img src={photo(p.image)} alt="" width={48} height={48} />
                  <div>
                    <strong>{p.name}</strong>
                    <small>
                      {cart[p.slug]} × {money(p.price)}
                    </small>
                  </div>
                  <b>{money(cart[p.slug] * p.price)}</b>
                </li>
              ))}
            </ul>
            <div className="checkout-breakdown">
              <div>
                <span>Subtotal</span>
                <b>{money(total)}</b>
              </div>
              <div>
                <span>Biaya serah</span>
                <b>{fee ? money(fee) : "Gratis"}</b>
              </div>
            </div>
            <div className="summary-line checkout-total">
              <strong>Total</strong>
              <b>{money(total + fee)}</b>
            </div>
            <button className="btn primary wide">Buat pesanan</button>
          </section>
        </form>
      )}
    </main>
  );
}
