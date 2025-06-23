import routes from "../routes/routes";
import { getActiveRoute, parseActivePathname } from "../routes/url-parser";
import { isLoggedIn, clearAuthData, getUserName } from "../data/auth";
import { showLoading, showMessageModal, stopCameraStream as globalStopCameraStream } from "../utils/ui-helpers";
import { unsubscribeFromPushNotification } from "../data/api"; // <-- Impor fungsi unsubscribe

// Pages (Views)
import NotFoundPage from "./error/not-found-page";
import LoginPage from "./auth/login-page";
import RegisterPage from "./auth/register-page";
import HomePage from "./home/home-page";
import AddStoryPage from "./story/add-story-page";
import StoryDetailPage from "./story/story-detail-page";

// Presenters
import LoginPresenter from "../presenter/LoginPresenter";
import RegisterPresenter from "../presenter/RegisterPresenter";
// Hapus impor HomePresenter karena akan dipindah
import HomePresenter from "../presenter/HomePresenter";
import StoryDetailPresenter from "../presenter/StoryDetailPresenter";
import AddStoryPresenter from "../presenter/AddStoryPresenter";

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;
  #appViewContainer = null;
  #navLinksContainer = null;
  #currentPath = "";

  constructor({ content, drawerButton, navigationDrawer }) {
    this.#content = content;
    this.#appViewContainer = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;
    this.#navLinksContainer = document.getElementById("nav-list");

    this._initialAppShell();
    this._setupDrawer();
  }

  _initialAppShell() {
    // Setup listeners for the global message modal
    const messageModal = document.getElementById("message-modal");
    const closeXButton = document.getElementById("message-modal-close-x");
    const closeButton = document.getElementById("message-modal-close-button");
    const closeModal = () => messageModal?.classList.add("hidden");

    closeXButton?.addEventListener("click", closeModal);
    closeButton?.addEventListener("click", closeModal);
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !messageModal?.classList.contains("hidden")) {
        closeModal();
      }
    });

    // Correct implementation for the skip-to-content link
    const skipLink = document.querySelector(".skip-link");
    const mainContent = document.querySelector("#main-content");

    if (skipLink && mainContent) {
      skipLink.addEventListener("click", (event) => {
        event.preventDefault(); // Prevent URL hash change
        skipLink.blur(); // Remove focus from the link
        mainContent.focus(); // Set focus to the main content area
        mainContent.scrollIntoView(); // Scroll the page to the main content
      });
    }

    // Set current year in the footer
    const currentYearElement = document.getElementById("current-year");
    if (currentYearElement) {
      currentYearElement.textContent = new Date().getFullYear();
    }

    this.updateNavLinks();
  }

  _setupDrawer() {
    this.#drawerButton.addEventListener("click", (event) => {
      event.stopPropagation();
      this.#navigationDrawer.classList.toggle("open");
    });

    document.body.addEventListener("click", (event) => {
      if (!this.#navigationDrawer.contains(event.target) && !this.#drawerButton.contains(event.target)) {
        this.#navigationDrawer.classList.remove("open");
      }
    });

    // Close drawer when a link or button inside it is clicked
    this.#navigationDrawer.addEventListener("click", (event) => {
      if (event.target.tagName === "A" || event.target.tagName === "BUTTON") {
        this.#navigationDrawer.classList.remove("open");
      }
    });
  }

  updateNavLinks() {
    if (!this.#navLinksContainer) return;
    const loggedIn = isLoggedIn();
    const userName = getUserName();
    let navContent = "";

    if (loggedIn) {
      navContent = `
        <li><span class="text-sm hidden md:inline px-3 py-2">Halo, ${userName || "Pengguna"}!</span></li>
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

    this.#navLinksContainer.innerHTML = navContent;

    if (loggedIn) {
      document.getElementById("logout-button-global")?.addEventListener("click", () => this.handleLogout());
    }
  }

  // handleLogout() {
  //   clearAuthData();
  //   this.updateNavLinks();
  //   showMessageModal("Logout Berhasil", "Anda telah berhasil keluar.", "success");
  //   window.location.hash = "#/login";
  // }

  async handleLogout() {
    // 1. Lakukan proses logout yang penting bagi pengguna TERLEBIH DAHULU.
    // Ini adalah operasi sinkronus yang cepat dan pasti.
    clearAuthData();
    this.updateNavLinks();
    showMessageModal("Logout Berhasil", "Anda telah berhasil keluar.", "success");
    window.location.hash = "#/login";

    // 2. Lakukan proses 'housekeeping' (unsubscribe) di latar belakang.
    // Proses ini tidak boleh memblokir pengalaman pengguna.
    try {
      if ("serviceWorker" in navigator && "PushManager" in window) {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          // Kirim permintaan ke server untuk berhenti berlangganan
          await unsubscribeFromPushNotification(subscription);
          // Hapus langganan dari browser
          await subscription.unsubscribe();
          console.log("Berhasil unsubscribe dari notifikasi di latar belakang.");
        }
      }
    } catch (error) {
      // Jika gagal, cukup catat di konsol tanpa mengganggu pengguna.
      console.error("Gagal melakukan unsubscribe di latar belakang:", error);
    }
  }

  showGlobalLoading() {
    showLoading(this.#appViewContainer);
  }

  hideGlobalLoading() {
    const spinner = this.#appViewContainer.querySelector(".spinner");
    spinner?.remove();
  }

  async renderPage() {
    if (this.#currentPath && this.#currentPath.startsWith("#/add-story") && !window.location.hash.startsWith("#/add-story")) {
      globalStopCameraStream();
    }
    this.#currentPath = window.location.hash;

    const url = getActiveRoute();
    const pathSegments = parseActivePathname();

    const PageClass = routes[url] || NotFoundPage;
    const pageInstance = new PageClass(pathSegments);

    this.#content.innerHTML = await pageInstance.render();
    await pageInstance.afterRender(this);

    try {
      if (PageClass === LoginPage) {
        new LoginPresenter({ view: pageInstance, app: this });
      } else if (PageClass === RegisterPage) {
        new RegisterPresenter({ view: pageInstance, app: this });
      } else if (PageClass === HomePage) {
        const presenter = new HomePresenter({ view: pageInstance, app: this });
        await presenter._loadStories();
      } else if (PageClass === StoryDetailPage) {
        new StoryDetailPresenter({ view: pageInstance, app: this, urlParams: pathSegments });
      } else if (PageClass === AddStoryPage) {
        new AddStoryPresenter({ view: pageInstance, app: this });
      }
    } catch (e) {
      console.error("Error during presenter logic execution:", e);
    }

    document.getElementById("main-content")?.focus({ preventScroll: true });
    this.updateNavLinks();
  }
}

export default App;
