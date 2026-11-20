/*
  DAFTAR PROYEK (tampil di projects.html)
  =======================================
  Cara nambah proyek: copy satu blok { ... } (dari "{" sampai "},"),
  tempel di dalam [ ], lalu ganti isinya. Urutan di sini = urutan tampil.

  title    : nama proyek
  status   : "progress" = sedang dikerjakan, "done" = selesai
  year     : tahun, misal "2026". Kosongkan "" kalau nggak mau ditampilkan.
  featured : true = kartu besar di paling atas. Cukup satu proyek aja.
  desc     : deskripsi singkat. en = bahasa Inggris, id = bahasa Indonesia
             (ikut tombol EN/ID di menu).
  stack    : tools / teknologi yang dipakai.
  image    : gambar/screenshot, misal "img/bitaqwa.png" (taruh filenya di folder img).
             Ukuran ideal 1600x1000 (rasio 16:10). Kosongkan "" kalau belum ada,
             nanti muncul kotak pengganti otomatis.
  links    : demo = link web/app, code = link GitHub.
             Kosongkan "" kalau nggak ada, tombolnya otomatis hilang.
*/
const PROJECTS = [
  {
    title: "Bitaqwa",
    status: "progress",
    year: "",
    featured: true,
    desc: {
      en: "A Flutter app in development. Current work is on the dashboard: a home screen with a header banner and a two-column menu grid.",
      id: "Aplikasi Flutter yang sedang dikembangkan. Saat ini fokus pada dashboard: layar beranda dengan banner header dan menu grid dua kolom."
    },
    stack: ["Flutter", "Dart", "Mobile UI"],
    image: "",
    links: { demo: "", code: "" }
  },

  // CONTOH: ganti isinya atau hapus blok ini
  {
    title: "[Project title]",
    status: "done",
    year: "[Year]",
    featured: false,
    desc: {
      en: "[Placeholder: what it is, what problem it solves, and what you did.]",
      id: "[Placeholder: proyek apa, masalah apa yang diselesaikan, dan bagian yang kamu kerjakan.]"
    },
    stack: ["[Tool]", "[Tool]"],
    image: "",
    links: { demo: "", code: "" }
  },

  // CONTOH: ganti isinya atau hapus blok ini
  {
    title: "[Project title]",
    status: "progress",
    year: "[Year]",
    featured: false,
    desc: {
      en: "[Placeholder: what it is, what problem it solves, and what you did.]",
      id: "[Placeholder: proyek apa, masalah apa yang diselesaikan, dan bagian yang kamu kerjakan.]"
    },
    stack: ["[Tool]", "[Tool]"],
    image: "",
    links: { demo: "", code: "" }
  },
];
