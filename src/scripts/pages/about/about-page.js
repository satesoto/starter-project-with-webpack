// src/scripts/pages/about/about-page.js

// Tidak perlu impor 'requestNotificationPermission' atau 'idb-helper' lagi di sini

export default class AboutPage {
  async render() {
    return `
      <section class="about-page-section container max-w-3xl mx-auto py-8 px-4">
        <h1 class="text-3xl font-bold text-gray-800 mb-6 text-center">Tentang Aplikasi CeritaKita</h1>
        
        <div class="bg-white shadow-md rounded-lg p-6 mb-8">
          <p class="text-gray-700 leading-relaxed mb-4">
            <strong>CeritaKita</strong> adalah sebuah platform digital yang dirancang untuk memungkinkan pengguna berbagi cerita dan pengalaman mereka dengan komunitas. 
            Aplikasi ini dibangun sebagai bagian dari submission untuk kelas "Menjadi Front-End Web Developer Expert" di Dicoding.
          </p>
          <p class="text-gray-700 leading-relaxed mb-4">
            Kami percaya bahwa setiap orang memiliki cerita yang berharga untuk dibagikan, dan melalui CeritaKita, kami berharap dapat menciptakan ruang yang aman dan inspiratif 
            bagi para pengguna untuk mengekspresikan diri, terhubung dengan orang lain, dan menemukan perspektif baru.
          </p>
        </div>

        <div class="bg-white shadow-md rounded-lg p-6">
          <h2 class="text-2xl font-semibold text-gray-700 mb-4">Fitur Utama:</h2>
          <ul class="list-disc list-inside text-gray-700 leading-relaxed">
            <li class="mb-2">Registrasi dan Login Pengguna</li>
            <li class="mb-2">Menampilkan daftar cerita dari berbagai pengguna</li>
            <li class="mb-2">Menambahkan cerita baru, lengkap dengan deskripsi dan foto</li>
            <li class="mb-2">Mengambil foto langsung dari kamera perangkat</li>
            <li class="mb-2">Memilih lokasi cerita menggunakan peta interaktif</li>
            <li class="mb-2">Menampilkan detail cerita beserta lokasi di peta (jika tersedia)</li>
            <li class="mb-2">Antarmuka yang responsif dan aksesibel</li>
            <li class="mb-2">Transisi halaman yang halus untuk pengalaman pengguna yang lebih baik</li>
            <li class="mb-2">Dukungan offline dan dapat di-install (PWA)</li>
            <li class="mb-2">Push Notifications untuk update terbaru</li>
          </ul>
        </div>
        
        <div class="mt-8 text-center text-sm text-gray-600">
          <p>Aplikasi ini memanfaatkan Story API yang disediakan oleh Dicoding.</p>
          <p>Dibangun dengan teknologi web modern termasuk HTML, CSS, JavaScript, dan Webpack.</p>
        </div>
      </section>
    `;
  }

  async afterRender() {
    // Tidak ada lagi aksi yang diperlukan setelah render untuk halaman ini
  }
}
