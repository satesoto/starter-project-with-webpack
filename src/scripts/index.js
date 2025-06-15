// src/scripts/index.js

// CSS imports
import "../styles/styles.css"; // Impor gaya utama Anda

import App from "./pages/app"; // Menggunakan App.js yang sudah dimodifikasi

document.addEventListener("DOMContentLoaded", async () => {
  const app = new App({
    content: document.querySelector("#app-view"),
    drawerButton: document.querySelector("#drawer-button"),
    navigationDrawer: document.querySelector("#navigation-drawer"),
  });

  window.addEventListener("hashchange", async () => {
    await app.renderPage();
  });

  // Initial page render
  await app.renderPage();
});
