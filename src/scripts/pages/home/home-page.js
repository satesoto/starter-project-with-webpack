import { getAllStories } from '../../data/api';
import { showMessageModal } from '../../utils/ui-helpers';
import { isLoggedIn } from '../../data/auth';
import { showFormattedDate } from '../../utils'; // Menggunakan util dari starter

export default class HomePage {
  async render() {
    if (!isLoggedIn()) {
      // Idealnya ini dihandle oleh router di App.js sebelum render,
      // tapi sebagai fallback:
      window.location.hash = '#/login';
      return '<p>Anda harus login untuk melihat halaman ini.</p>';
    }

    try {
      const data = await getAllStories(1, 20, 1); // page 1, size 20, with location
      if (data.error) throw new Error(data.message);
      
      const stories = data.listStory;
      if (!stories || stories.length === 0) {
        return `
          <section class="story-list-container container">
            <p class="text-center text-gray-600">Belum ada cerita yang dibagikan. Jadilah yang pertama!</p>
            <div class="text-center mt-4"><a href="#/add-story" class="text-blue-600 hover:underline">Bagikan Ceritamu Sekarang</a></div>
          </section>
        `;
      }

      let storiesHtml = `
        <section class="story-list-container container">
          <h2 class="text-3xl font-bold mb-6 text-gray-700">Kumpulan Cerita</h2>
          <div class="stories-grid">
      `;
      stories.forEach(story => {
        const photoUrl = story.photoUrl || 'https://placehold.co/600x400/e2e8f0/94a3b8?text=Gambar+Tidak+Tersedia';
        storiesHtml += `
          <article class="story-card">
            <img src="${photoUrl}" alt="Foto cerita dari ${story.name || 'Anonim'}" onerror="this.onerror=null;this.src='https://placehold.co/600x400/e2e8f0/94a3b8?text=Error';">
            <div class="story-card-content">
              <h3>${story.name || 'Pengguna CeritaKita'}</h3>
              <p class="story-description" title="${story.description || ''}">${story.description || 'Tidak ada deskripsi.'}</p>
              <p class="story-date">Dibuat pada: ${showFormattedDate(story.createdAt)}</p>
            </div>
            <div class="story-card-footer">
              <a href="#/story/${story.id}">Lihat Detail & Peta</a>
            </div>
          </article>
        `;
      });
      storiesHtml += '</div></section>';
      return storiesHtml;

    } catch (error) {
      console.error("Error fetching stories:", error);
      showMessageModal('Gagal Memuat Cerita', error.message, 'error');
      return `<section class="container"><p class="text-center text-red-500">Tidak dapat memuat cerita: ${error.message}</p></section>`;
    }
  }

  async afterRender(appInstance) {
    // Tidak ada interaksi spesifik setelah render di sini,
    // semua link sudah dihandle oleh hashchange listener global.
  }
}