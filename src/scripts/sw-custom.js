// Import fungsi-fungsi yang diperlukan dari Workbox
import { clientsClaim, setCacheName } from "workbox-core";
import { precacheAndRoute, createHandlerBoundToURL } from "workbox-precaching";
import { registerRoute, NavigationRoute } from "workbox-routing";
import { StaleWhileRevalidate, CacheFirst, NetworkFirst } from "workbox-strategies";
import { CacheableResponsePlugin } from "workbox-cacheable-response";
import { ExpirationPlugin } from "workbox-expiration";
import { addNewStory } from "./data/api";
import StoryDb from "./data/idb-helper";

// --- KONFIGURASI DAN SIKLUS HIDUP SERVICE WORKER ---

// Mengatur nama cache agar unik
setCacheName("CeritaKitaCache");

// Memaksa service worker untuk segera aktif
self.addEventListener("install", () => {
  console.log("Service worker: Installing...");
  self.skipWaiting();
});

// Mengambil alih kontrol halaman dengan cepat
self.addEventListener("activate", () => {
  console.log("Service worker: Activating...");
  clientsClaim();
});

// --- STRATEGI CACHING UNTUK MODE OFFLINE ---

// Pre-caching untuk file-file inti yang dihasilkan oleh Webpack
// (Workbox akan otomatis mengisi 'self.__WB_MANIFEST' dengan daftar file dari build)
precacheAndRoute(self.__WB_MANIFEST || []);

// 1. Caching untuk Halaman (App Shell)
// Menggunakan NetworkFirst agar pengguna selalu mendapatkan versi terbaru jika online
registerRoute(
  ({ request }) => request.mode === "navigate",
  new NetworkFirst({
    cacheName: "ceritakita-pages-cache",
  })
);

// 2. Caching untuk Aset Statis (CSS, JS, Fonts)
// Menggunakan StaleWhileRevalidate agar aset dapat disajikan cepat dari cache
// sambil diperbarui di latar belakang jika ada versi baru.
registerRoute(
  ({ request }) => request.destination === "style" || request.destination === "script" || request.destination === "worker",
  new StaleWhileRevalidate({
    cacheName: "ceritakita-static-assets-cache",
  })
);

// 3. Caching untuk Gambar
// Menggunakan CacheFirst karena gambar jarang berubah.
registerRoute(
  ({ request }) => request.destination === "image",
  new CacheFirst({
    cacheName: "ceritakita-images-cache",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60, // Batasi jumlah gambar yang disimpan
        maxAgeSeconds: 30 * 24 * 60 * 60, // Simpan selama 30 hari
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200], // Hanya cache gambar yang berhasil diunduh
      }),
    ],
  })
);

// 4. Caching untuk API (khususnya daftar cerita)
// Menggunakan NetworkFirst agar data cerita selalu yang terbaru jika online,
// namun tetap bisa menampilkan data dari cache jika offline.
registerRoute(
  ({ url }) => url.href.startsWith("https://story-api.dicoding.dev/v1/stories"),
  new NetworkFirst({
    cacheName: "ceritakita-api-cache",
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

// --- BACKGROUND SYNC UNTUK UNGGAH CERITA OFFLINE ---

const syncPendingStories = async () => {
  console.log("Service Worker: Menjalankan sinkronisasi cerita yang tertunda...");
  const pendingStories = await StoryDb.getAllPendingStories();

  for (const story of pendingStories) {
    try {
      // NOTE: API Dicoding memerlukan otentikasi. Dalam skenario nyata,
      // token otentikasi harus dapat diakses dari service worker (misalnya dari IndexedDB).
      // Untuk tujuan demo ini, kita anggap token bisa diakses.
      await addNewStory(story.description, story.photo, story.lat, story.lon);

      // Jika berhasil, hapus cerita dari antrian pending di IndexedDB
      await StoryDb.deletePendingStory(story.id);
      console.log("Cerita berhasil disinkronkan:", story.id);
    } catch (error) {
      console.error("Gagal menyinkronkan cerita, akan dicoba lagi nanti:", error);
      // Jika gagal, cerita akan tetap di IndexedDB untuk sinkronisasi berikutnya
    }
  }
};

self.addEventListener("sync", (event) => {
  if (event.tag === "add-new-story-sync") {
    event.waitUntil(syncPendingStories());
  }
});

// --- PUSH NOTIFICATION LISTENER (KODE ANDA YANG SUDAH ADA) ---

self.addEventListener("push", (event) => {
  console.log("Push event diterima:", event);

  let notificationData;
  try {
    notificationData = event.data.json();
  } catch (e) {
    console.error("Gagal mem-parsing data notifikasi", e);
    notificationData = {
      title: "Notifikasi",
      options: {
        body: "Anda menerima pesan baru.",
      },
    };
  }

  const title = notificationData.title;
  const options = {
    body: notificationData.options.body,
    icon: "assets/icons/icon-192x192.png", // Gunakan path ikon yang benar
    badge: "assets/icons/icon-96x96.png",
  };

  event.waitUntil(self.registration.showNotification(title, options));
});