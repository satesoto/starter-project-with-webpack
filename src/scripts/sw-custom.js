// Tidak ada lagi import di sini

// Event listener untuk fase install
self.addEventListener("install", () => {
  console.log("Service worker: Installing...");
  self.skipWaiting();
});

// Event listener untuk fase activate
self.addEventListener("activate", () => {
  console.log("Service worker: Activating...");
  self.clients.claim(); // Mengambil kontrol halaman dengan cepat
});

// `precacheAndRoute` akan disuntikkan oleh Workbox di sini.
// Anda tidak perlu menulisnya, cukup sediakan placeholder ini.
self.__WB_MANIFEST;

// --- Event fetch untuk menangani request offline ---
// self.addEventListener("fetch", (event) => {
//   // Anda bisa menambahkan logika caching di sini jika diperlukan,
//   // namun untuk sekarang kita fokus pada perbaikan error.
//   // Contoh: event.respondWith( ... );
// });

// --- Event sync untuk background sync ---
self.addEventListener("sync", (event) => {
  if (event.tag === "add-new-story-sync") {
    console.log("Menjalankan background sync untuk cerita baru...");
    // Logika untuk mengirim data yang tersimpan di IndexedDB
  }
});

// --- Event push untuk notifikasi ---
self.addEventListener("push", (event) => {
  console.log("Push event diterima:", event);

  let notificationData;
  try {
    notificationData = event.data.json();
  } catch (e) {
    console.error("Gagal mem-parsing data notifikasi", e);
    notificationData = {
      title: "Notifikasi",
      options: { body: "Anda menerima pesan baru." },
    };
  }

  const title = notificationData.title;
  const options = {
    body: notificationData.options.body,
    icon: "assets/icons/icon-192x192.png",
    badge: "assets/icons/icon-96x96.png",
  };

  event.waitUntil(self.registration.showNotification(title, options));
});
