import { getStoryById } from '../../data/api';
import { parseActivePathname } from '../../routes/url-parser';
import { initMap, showMessageModal } from '../../utils/ui-helpers';
import { isLoggedIn } from '../../data/auth';
import { showFormattedDate } from '../../utils';

export default class StoryDetailPage {
  async render() {
    if (!isLoggedIn()) {
      window.location.hash = '#/login';
      return '<p>Anda harus login untuk melihat halaman ini.</p>';
    }
    const url = parseActivePathname(); // Mendapatkan { resource: 'story', id: '...' }
    if (!url.id) {
      return '<p>ID Cerita tidak ditemukan.</p>';
    }

    try {
      const data = await getStoryById(url.id);
      if (data.error) throw new Error(data.message);
      const story = data.story;
      const photoUrl = story.photoUrl || 'https://placehold.co/800x600/e2e8f0/94a3b8?text=Gambar+Tidak+Tersedia';

      return `
        <section aria-labelledby="story-detail-heading-${story.id}" class="story-detail-section container">
          <a href="#/" class="back-link">&larr; Kembali ke Daftar Cerita</a>
          <h2 id="story-detail-heading-${story.id}">${story.name || 'Pengguna CeritaKita'}</h2>
          <p class="story-meta-date">Dibuat pada: ${showFormattedDate(story.createdAt, 'id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
          
          <img src="${photoUrl}" alt="Foto cerita detail dari ${story.name || 'Anonim'}" class="story-image-detail" onerror="this.onerror=null;this.src='https://placehold.co/800x600/e2e8f0/94a3b8?text=Error';">
          
          <div class="story-description-detail">
            <p>${story.description || 'Tidak ada deskripsi.'}</p>
          </div>
          
          ${(story.lat && story.lon) ? `
            <h3 class="story-location-heading">Lokasi Cerita</h3>
            <div id="story-detail-map" class="map-container"></div>
          ` : '<p class="text-gray-600 mb-6">Lokasi untuk cerita ini tidak tersedia.</p>'}
        </section>
      `;
    } catch (error) {
      showMessageModal('Gagal Memuat Detail Cerita', error.message, 'error');
      return `<section class="container"><p class="text-center text-red-500">Tidak dapat memuat detail cerita: ${error.message}</p><p><a href="#/" class="text-blue-600 hover:underline">Kembali ke Beranda</a></p></section>`;
    }
  }

  async afterRender(appInstance) {
    const url = parseActivePathname();
    if (!url.id) return;

    // Kita perlu mengambil data cerita lagi untuk mendapatkan lat/lon karena render() tidak bisa return objek kompleks
    // Alternatif: simpan data cerita di state global/App instance jika sudah diambil di render()
    try {
      const data = await getStoryById(url.id);
      if (!data.error && data.story.lat && data.story.lon) {
        const story = data.story;
        initMap('story-detail-map', [story.lat, story.lon], story.name || 'Lokasi Cerita', true);
      }
    } catch (error) {
      console.error('Gagal menginisialisasi peta detail cerita:', error);
    }
  }
}