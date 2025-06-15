import { showFormattedDate } from '../../utils';
import { isLoggedIn } from '../../data/auth';
import { showMessageModal } from '../../utils/ui-helpers';

class HomePage {
  /**
   * Renders the initial skeleton of the page with a loading placeholder.
   */
  async render() {
    if (!isLoggedIn()) {
      window.location.hash = '#/login';
      return '<p>Anda harus login untuk melihat halaman ini.</p>';
    }
    return `
      <section class="story-list-container container">
        <h1 class="text-3xl font-bold mb-6 text-gray-700">Kumpulan Cerita</h1>
        <div id="stories-container">
          <!-- Stories will be loaded here by the presenter -->
          <div class="spinner" aria-label="Memuat cerita..."></div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    // All logic is now handled by the presenter.
  }

  /**
   * Displays an error message on the page. This method is called by the presenter.
   * @param {string} message The error message to display.
   */
  showError(message) {
    const container = document.getElementById('stories-container');
    if (container) {
      container.innerHTML = `<p class="text-center text-red-500">Gagal memuat cerita: ${message}</p>`;
    }
    showMessageModal('Gagal Memuat Cerita', message, 'error');
  }

  /**
   * Renders the list of stories into the container. This method is called by the presenter.
   * @param {Array<object>} stories The array of story objects.
   */
  showStories(stories) {
    const container = document.getElementById('stories-container');
    if (!container) return;

    if (!stories || stories.length === 0) {
      container.innerHTML = `
        <p class="text-center text-gray-600">Belum ada cerita yang dibagikan. Jadilah yang pertama!</p>
        <div class="text-center mt-4"><a href="#/add-story" class="text-blue-600 hover:underline">Bagikan Ceritamu Sekarang</a></div>
      `;
      return;
    }

    let storiesHtml = '<div class="stories-grid">';
    stories.forEach(story => {
      const photoUrl = story.photoUrl || 'https://placehold.co/600x400/e2e8f0/94a3b8?text=Gambar+Tidak+Tersedia';
      storiesHtml += `
        <article class="story-card">
          <img src="${photoUrl}" alt="Foto cerita dari ${story.name || 'Anonim'}" loading="lazy" onerror="this.onerror=null;this.src='https://placehold.co/600x400/e2e8f0/94a3b8?text=Error';">
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
    storiesHtml += '</div>';
    container.innerHTML = storiesHtml;
  }
}

export default HomePage;
