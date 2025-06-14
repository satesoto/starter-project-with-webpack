// CSS imports
import 'leaflet/dist/leaflet.css'; // Impor CSS Leaflet
import '../styles/styles.css';     // Impor gaya utama Anda

import App from './pages/app'; // Menggunakan App.js yang sudah dimodifikasi

document.addEventListener('DOMContentLoaded', async () => {
  const app = new App({
    content: document.querySelector('#app-view'), // Kontainer utama untuk render halaman
    drawerButton: document.querySelector('#drawer-button'),
    navigationDrawer: document.querySelector('#navigation-drawer'),
  });
  
  await app.renderPage(); // Render halaman awal

  window.addEventListener('hashchange', async () => {
    await app.renderPage(); // Render halaman saat hash berubah
  });

  // Service Worker (jika Anda ingin PWA, starter mungkin punya ini)
  // if ('serviceWorker' in navigator) {
  //   try {
  //     await navigator.serviceWorker.register('./sw.js'); // Sesuaikan path jika perlu
  //     console.log('Service Worker Registered');
  //   } catch (error) {
  //     console.error('Failed to register Service Worker:', error);
  //   }
  // }
});