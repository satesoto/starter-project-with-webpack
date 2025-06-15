// src/scripts/pages/error/not-found-page.js
class NotFoundPage {
  async render() {
    return `
      <section class="container text-center py-20">
        <h1 class="text-6xl font-bold text-blue-600 mb-4">404</h1>
        <p class="text-2xl text-gray-700 mb-8">Halaman Tidak Ditemukan</p>
        <p class="text-gray-600 mb-8">Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.</p>
        <a href="#/" class="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors no-underline">Kembali ke Beranda</a>
      </section>
    `;
  }

  async afterRender() {
    // No specific actions needed for this static page
  }
}

export default NotFoundPage;
