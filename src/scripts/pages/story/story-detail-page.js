import { initMap, showMessageModal } from '../../utils/ui-helpers';
import { isLoggedIn } from '../../data/auth';
import { showFormattedDate } from '../../utils';

class StoryDetailPage {
  /**
   * Renders the initial HTML skeleton for the page with loading placeholders.
   */
  async render() {
    if (!isLoggedIn()) {
      window.location.hash = '#/login';
      return '<p>Anda harus login untuk melihat halaman ini.</p>';
    }

    return `
      <section class="story-detail-section container">
        <a href="#/" class="back-link">&larr; Kembali ke Daftar Cerita</a>
        
        <div id="story-detail-content">
            <h1 id="story-detail-heading" class="text-3xl font-bold text-gray-800 mb-2">Memuat cerita...</h1>
            <p id="story-meta-date" class="story-meta-date"></p>
            
            <img id="story-image-detail" src="https://placehold.co/800x600/e2e8f0/94a3b8?text=Memuat+Gambar..." alt="Memuat gambar cerita" class="story-image-detail">
            
            <div class="story-description-detail">
              <p id="story-description-text">Memuat deskripsi...</p>
            </div>
            
            <div id="map-location-section">
                <p class="text-gray-600 mb-6">Memuat lokasi...</p>
            </div>
        </div>

        <div id="story-detail-error" class="hidden text-center text-red-500"></div>
      </section>
    `;
  }

  /**
   * This method is called by the presenter after the page is rendered.
   * It's safe to leave this empty as the presenter will handle populating content.
   */
  async afterRender() {
    // All DOM manipulation is now handled by methods called from the presenter.
  }

  /**
   * Populates the page with the fetched story data.
   * @param {object} story The story data object.
   */
  fillStoryDetails(story) {
    if (!story) {
      this.showError('Data cerita tidak ditemukan.');
      return;
    }

    const headingEl = document.getElementById('story-detail-heading');
    const dateEl = document.getElementById('story-meta-date');
    const imageEl = document.getElementById('story-image-detail');
    const descriptionEl = document.getElementById('story-description-text');
    const mapSectionEl = document.getElementById('map-location-section');

    if (headingEl) headingEl.textContent = story.name || 'Pengguna CeritaKita';
    if (dateEl) dateEl.textContent = `Dibuat pada: ${showFormattedDate(story.createdAt, 'id-ID', { hour: '2-digit', minute: '2-digit' })}`;
    if (imageEl) {
      imageEl.src = story.photoUrl;
      imageEl.alt = `Foto cerita dari ${story.name || 'Anonim'}`;
    }
    if (descriptionEl) descriptionEl.textContent = story.description || 'Tidak ada deskripsi.';
    
    if (story.lat && story.lon) {
      if (mapSectionEl) {
        mapSectionEl.innerHTML = `
          <h2 class="story-location-heading">Lokasi Cerita</h2>
          <div id="story-detail-map" class="map-container"></div>
        `;
        // Use a timeout to ensure the map container is rendered before initialization.
        setTimeout(() => {
          initMap('story-detail-map', [story.lat, story.lon], story.name || 'Lokasi Cerita', true);
        }, 0);
      }
    } else if (mapSectionEl) {
      mapSectionEl.innerHTML = '<p class="text-gray-600 mb-6">Lokasi untuk cerita ini tidak tersedia.</p>';
    }
  }

  /**
   * Displays an error message on the page.
   * @param {string} message The error message to display.
   */
  showError(message) {
    const errorContainer = document.getElementById('story-detail-error');
    const contentContainer = document.getElementById('story-detail-content');
    
    if (contentContainer) contentContainer.classList.add('hidden');
    
    if (errorContainer) {
      errorContainer.classList.remove('hidden');
      errorContainer.textContent = `Gagal memuat cerita: ${message}`;
    }
    showMessageModal('Gagal Memuat Detail', message, 'error');
  }
}

export default StoryDetailPage;
