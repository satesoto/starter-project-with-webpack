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
    icon: "icons/favicon.png", // Gunakan ikon dari manifest
    badge: "icons/favicon.png",
  };

  event.waitUntil(self.registration.showNotification(title, options));
});
