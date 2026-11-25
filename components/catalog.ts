export const categories = [
  {
    slug: "kopi-aceh",
    name: "Kopi Aceh",
    short: "Kopi Aceh",
    caption: "Dari dataran tinggi Gayo",
    img: 0,
    // File in public/img, without the .webp. null means the card shows no icon.
    icon: "ikon-koleksi-0" as string | null,
  },
  {
    slug: "kue-camilan",
    name: "Kue & Camilan",
    short: "Camilan",
    caption: "Resep turun temurun",
    img: 1,
    icon: "ikon-koleksi-1" as string | null,
  },
  {
    slug: "kerajinan",
    name: "Kerajinan & Aksesori",
    short: "Kerajinan",
    caption: "Karya tangan perajin",
    img: 2,
    icon: "ikon-koleksi-2" as string | null,
  },
  {
    slug: "parfum",
    name: "Parfum",
    short: "Parfum",
    caption: "Aroma khas Aceh",
    img: 3,
    icon: null as string | null,
  },
];
export const shops = [
  {
    slug: "ruang-gayo",
    name: "Ruang Gayo",
    origin: "Aceh Tengah",
    desc: "Biji kopi pilihan dari dataran tinggi Gayo, disangrai dalam kelompok kecil untuk menjaga karakter tiap panen.",
    image: 0,
  },
  {
    slug: "dapur-cut-ida",
    name: "Dapur Cut Ida",
    origin: "Banda Aceh",
    desc: "Dapur rumahan yang merawat resep kue Aceh, dari lipatan timphan hingga anyaman halus keukarah.",
    image: 1,
  },
  {
    slug: "rumoh-sulam",
    name: "Rumoh Sulam",
    origin: "Aceh Besar",
    desc: "Perajin lokal yang menerjemahkan motif khas Aceh ke dalam aksesori untuk dipakai sehari hari.",
    image: 2,
  },
];
export const products = [
  {
    slug: "kopi-gayo-sangrai",
    name: "Kopi Gayo Sangrai",
    category: 0,
    shop: 0,
    price: 98000,
    size: "250 g",
    days: 180,
    stock: 24,
    image: 0,
    desc: "Arabika dataran tinggi Gayo dengan aroma kakao, rasa manis yang lembut, dan sentuhan rempah. Dikemas rapat agar kesegarannya terjaga sepanjang perjalanan.",
  },
  {
    slug: "keukarah-aceh",
    name: "Keukarah Tradisional",
    category: 1,
    shop: 1,
    price: 45000,
    size: "200 g",
    days: 30,
    stock: 22,
    image: 1,
    desc: "Kue khas Aceh dari jalinan halus tepung beras yang digoreng hingga keemasan. Renyah, ringan, dan pas untuk menemani secangkir kopi.",
  },
  {
    slug: "dompet-sulam",
    name: "Dompet Sulam Aceh",
    category: 2,
    shop: 2,
    price: 85000,
    size: "20 × 12 cm",
    days: 0,
    stock: 12,
    image: 2,
    desc: "Dompet kain dengan sulaman motif khas Aceh berwarna merah dan emas. Ritsleting menjaga barang kecil tetap rapi selama perjalanan.",
  },
  {
    slug: "timphan-asoe-kaya",
    name: "Timphan Asoe Kaya",
    category: 1,
    shop: 1,
    price: 38000,
    size: "6 buah",
    days: 2,
    stock: 15,
    image: 3,
    desc: "Kue kukus lembut berisi srikaya, dibalut daun pisang muda. Nikmati segera setelah diterima untuk rasa dan aroma terbaik.",
  },
  {
    slug: "robusta-gayo",
    name: "Robusta Gayo",
    category: 0,
    shop: 0,
    price: 65000,
    size: "250 g",
    days: 180,
    stock: 20,
    image: 4,
    desc: "Kopi robusta sangrai dengan karakter cokelat pekat dan rasa yang mantap. Pilihan untuk seduhan pagi atau kopi susu di rumah.",
  },
  {
    slug: "tas-anyam-pandan",
    name: "Tas Anyam Pandan",
    category: 2,
    shop: 2,
    price: 145000,
    size: "30 × 25 cm",
    days: 0,
    stock: 8,
    image: 5,
    desc: "Tas pandan berwarna alami dengan pola anyaman rapat dan pegangan melengkung. Ringan untuk dibawa berbelanja atau berjalan santai.",
  },
];
export type Product = (typeof products)[number];
export const money = (value: number) =>
  "Rp" + new Intl.NumberFormat("id-ID").format(value);
const studioPhotos = ["gayo", "keukarah", "sulam"];
export const photo = (i: number) =>
  studioPhotos[i]
    ? "/img/studio-" + studioPhotos[i] + ".webp"
    : "/img/products-" + i + ".webp";
