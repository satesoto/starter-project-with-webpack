import routes from "../routes/routes";
import { getActiveRoute, parseActivePathname } from "../routes/url-parser";
import { isLoggedIn, clearAuthData, getUserName } from "../data/auth";
import {
  showLoading,
  showMessageModal,
  stopCameraStream as globalStopCameraStream,
} from "../utils/ui-helpers"; // Impor stopCameraStream
import NotFoundPage from "./error/not-found-page"; // Impor NotFoundPage

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;
  #appViewContainer = null; // Tambahkan referensi ke app-view
  #navLinksContainer = null; // Tambahkan referensi ke nav-links
  #currentPath = ""; // Untuk melacak path saat ini

  constructor({ content, drawerButton, navigationDrawer }) {
    this.#content = content; // Ini adalah #app-view di index.html
    this.#appViewContainer = content; // Sama dengan #content
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;
    this.#navLinksContainer = document.getElementById("nav-list"); // Atau #nav-links dari HTML sebelumnya

    this._initialAppShell();
    this._setupDrawer(); // Fungsi drawer dari starter
  }

  _initialAppShell() {
    // Setup listener untuk tombol tutup modal global
    const messageModal = document.getElementById("message-modal");
    const closeXButton = document.getElementById("message-modal-close-x");
    const closeButton = document.getElementById("message-modal-close-button");
    const closeModal = () => {
      if (messageModal) messageModal.classList.add("hidden");
    };
    if (closeXButton) closeXButton.addEventListener("click", closeModal);
    if (closeButton) closeButton.addEventListener("click", closeModal);
    window.addEventListener("keydown", (e) => {
      if (
        e.key === "Escape" &&
        messageModal &&
        !messageModal.classList.contains("hidden")
      ) {
        closeModal();
      }
    });

    // Update Nav Links
    this.updateNavLinks();

    // Set tahun di footer
    const currentYearElement = document.getElementById("current-year");
    if (currentYearElement) {
      currentYearElement.textContent = new Date().getFullYear();
    }
    // Pastikan target skip link bisa difokus
    const mainContentElement = document.getElementById("main-content");
    if (mainContentElement) {
      mainContentElement.setAttribute("tabindex", "-1");
    }
  }

  _setupDrawer() {
    // Fungsi drawer dari starter dipertahankan
    this.#drawerButton.addEventListener("click", (event) => {
      event.stopPropagation();
      this.#navigationDrawer.classList.toggle("open");
    });

    // Menutup drawer saat klik di luar drawer atau link di dalam drawer
    document.body.addEventListener("click", (event) => {
      if (
        !this.#navigationDrawer.contains(event.target) &&
        !this.#drawerButton.contains(event.target)
      ) {
        this.#navigationDrawer.classList.remove("open");
      }
    });
    // Pastikan semua link di dalam drawer menutup drawer
    this.#navigationDrawer.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        this.#navigationDrawer.classList.remove("open");
      });
    });
  }

  updateNavLinks() {
    if (!this.#navLinksContainer) {
      console.warn(
        "Elemen #navLinksContainer (seharusnya ul#nav-list) tidak ditemukan. Navigasi tidak akan diperbarui."
      );
      return;
    }

    const loggedIn = isLoggedIn(); // Pastikan fungsi ini diimpor/tersedia
    const userName = getUserName(); // Pastikan fungsi ini diimpor/tersedia
    let navContent = "";

    if (loggedIn) {
      navContent = `
        <li><span class="text-sm hidden md:inline px-3 py-2">Halo, ${
          userName || "Pengguna"
        }!</span></li>
        <li><a href="#/" class="nav-link">Beranda</a></li>
        <li><a href="#/add-story" class="nav-link">Tambah Cerita</a></li>
        <li><a href="#/about" class="nav-link">Tentang</a></li>
        <li><button id="logout-button-global" class="bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-md text-sm font-medium">Keluar</button></li>
      `;
    } else {
      navContent = `
        <li><a href="#/login" class="nav-link">Masuk</a></li>
        <li><a href="#/register" class="nav-link">Daftar</a></li>
        <li><a href="#/about" class="nav-link">Tentang</a></li>
      `;
    }

    // Memperbarui konten navigasi
    this.#navLinksContainer.innerHTML = navContent;

    // Pasang ulang event listener untuk tombol logout jika pengguna sudah login
    if (loggedIn) {
      const logoutButton = document.getElementById("logout-button-global");
      if (logoutButton) {
        // Listener ditambahkan ke elemen baru, jadi tidak ada duplikasi pada instance elemen yang sama.
        logoutButton.addEventListener("click", () => this.handleLogout());
      } else {
        // Peringatan jika tombol logout tidak ditemukan setelah DOM diperbarui.
        console.warn(
          'Tombol logout "logout-button-global" tidak ditemukan setelah navigasi diperbarui.'
        );
      }
    }
    // Re-attach event listener untuk menutup drawer saat link diklik
    this.#navigationDrawer.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        this.#navigationDrawer.classList.remove("open");
      });
    });
  }

  handleLogout() {
    clearAuthData();
    this.updateNavLinks();
    showMessageModal(
      "Logout Berhasil",
      "Anda telah berhasil keluar.",
      "success"
    );
    window.location.hash = "#/login";
  }

  showGlobalLoading() {
    showLoading(this.#appViewContainer);
  }
  hideGlobalLoading() {
    // Biasanya tidak perlu dipanggil jika renderPage menimpa konten
    // Tapi bisa berguna jika ada operasi async tanpa full re-render
    const spinner = this.#appViewContainer.querySelector(".spinner");
    if (spinner) spinner.remove();
  }

  async renderPage() {
    // Hentikan stream kamera jika ada dan berpindah halaman dari add-story
    if (
      this.#currentPath.startsWith("#/add-story") &&
      !window.location.hash.startsWith("#/add-story")
    ) {
      globalStopCameraStream();
    }
    this.#currentPath = window.location.hash;

    this.showGlobalLoading(); // Tampilkan loading global
    const url = getActiveRoute(); // Mendapatkan rute seperti '/', '/story/:id'
    const pathSegments = parseActivePathname(); // Mendapatkan { resource, id }

    let PageClass = routes[url];
    if (!PageClass) {
      // Fallback jika rute spesifik (misal /story/:id) tidak ada, coba /story
      if (pathSegments.resource && !pathSegments.id) {
        PageClass = routes[`/${pathSegments.resource}`];
      }
      // Jika masih tidak ada, gunakan NotFoundPage
      if (!PageClass) {
        PageClass = NotFoundPage;
      }
    }

    const pageInstance = new PageClass(pathSegments); // Kirim pathSegments ke konstruktor halaman jika perlu

    const renderContent = async () => {
      try {
        this.#content.innerHTML = await pageInstance.render();
        await pageInstance.afterRender(this); // Kirim instance App ke afterRender

        // Fokus ke main content untuk aksesibilitas setelah render
        const mainContentEl = document.getElementById("main-content");
        if (mainContentEl) mainContentEl.focus({ preventScroll: true });
      } catch (error) {
        console.error("Error rendering page:", error);
        this.#content.innerHTML =
          '<p class="text-red-500 text-center">Terjadi kesalahan saat memuat halaman.</p>';
        showMessageModal(
          "Error Halaman",
          "Gagal memuat konten halaman.",
          "error"
        );
      }
    };

    if (document.startViewTransition) {
      document.startViewTransition(renderContent);
    } else {
      await renderContent();
    }
    // Panggil updateNavLinks setelah setiap render untuk memastikan konsistensi,
    // terutama setelah login/logout yang mungkin tidak langsung me-refresh App instance
    this.updateNavLinks();
  }
}

export default App;
