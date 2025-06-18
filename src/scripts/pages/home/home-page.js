// src/scripts/pages/home/home-page.js

import { showFormattedDate } from "../../utils";
import { isLoggedIn } from "../../data/auth";
import { showMessageModal } from "../../utils/ui-helpers";
import { requestNotificationPermission } from "../../utils/sw-register";
import StoryDb from "../../data/idb-helper";

class HomePage {
  async render() {
    if (!isLoggedIn()) {
      window.location.hash = "#/login";
      return "<p>Anda harus login untuk melihat halaman ini.</p>";
    }
    return `
      <section class="story-list-container container">
        <h1 class="text-3xl font-bold mb-4 text-gray-700">Kumpulan Cerita</h1>
        
        <div class="home-controls mb-6 flex flex-wrap items-center gap-3">
          <button id="subscribe-notification-button" class="btn btn-outline-green">
            Aktifkan Notifikasi
          </button>
          <button id="clear-cache-button" class="btn btn-outline-yellow">
            Hapus Cache Cerita
          </button>
        </div>
        <div id="stories-container">
          <div class="spinner" aria-label="Memuat cerita..."></div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    const subscribeButton = document.getElementById("subscribe-notification-button");
    const clearCacheButton = document.getElementById("clear-cache-button");

    if (subscribeButton) {
      subscribeButton.addEventListener("click", async (event) => {
        event.target.disabled = true;
        await requestNotificationPermission();
        event.target.disabled = false;
      });
    }

    if (clearCacheButton) {
      clearCacheButton.addEventListener("click", async () => {
        try {
          await StoryDb.clearAllStories();
          showMessageModal("Berhasil", "Data cerita offline berhasil dihapus.", "success");
        } catch (error) {
          showMessageModal("Gagal", `Gagal menghapus data: ${error.message}`, "error");
        }
      });
    }
  }

  showError(message) {
    const container = document.getElementById("stories-container");
    if (container) {
      container.innerHTML = `<p class="text-center text-red-500">Gagal memuat cerita: ${message}</p>`;
    }
    if (!message.includes("offline")) {
      showMessageModal("Gagal Memuat Cerita", message, "error");
    }
  }

  showStories(stories) {
    const container = document.getElementById("stories-container");
    if (!container) return;

    if (!stories || stories.length === 0) {
      container.innerHTML = `
        <p class="text-center text-gray-600">Belum ada cerita yang dibagikan. Jadilah yang pertama!</p>
        <div class="text-center mt-4"><a href="#/add-story" class="text-blue-600 hover:underline">Bagikan Ceritamu Sekarang</a></div>
      `;
      return;
    }

    let storiesHtml = '<div class="stories-grid">';
    stories.forEach((story) => {
      const photoUrl = story.photoUrl || "https://placehold.co/600x400/e2e8f0/94a3b8?text=Gambar+Tidak+Tersedia";
      storiesHtml += `
        <article class="story-card">
          <img src="${photoUrl}" alt="Foto cerita dari ${
        story.name || "Anonim"
      }" loading="lazy" onerror="this.onerror=null;this.src='https://placehold.co/600x400/e2e8f0/94a3b8?text=Error';">
          <div class="story-card-content">
            <h3>${story.name || "Pengguna CeritaKita"}</h3>
            <p class="story-description" title="${story.description || ""}">${story.description || "Tidak ada deskripsi."}</p>
            <p class="story-date">Dibuat pada: ${showFormattedDate(story.createdAt)}</p>
          </div>
          <div class="story-card-footer">
            <a href="#/story/${story.id}">Lihat Detail & Peta</a>
          </div>
        </article>
      `;
    });
    storiesHtml += "</div>";
    container.innerHTML = storiesHtml;
  }
}

export default HomePage;
