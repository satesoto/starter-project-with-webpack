// src/scripts/index.js

// CSS imports
import "../styles/styles.css";

import App from "./pages/app";
import { swRegister } from "./utils/sw-register"; // <-- Perubahan di sini

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

  // Daftarkan Service Worker setelah halaman utama dimuat
  await swRegister();
});
