import routes from '../routes/routes';
import { getActiveRoute, parseActivePathname } from '../routes/url-parser';
import { isLoggedIn, clearAuthData, getUserName } from '../data/auth';
import { showLoading, showMessageModal, stopCameraStream as globalStopCameraStream } from '../utils/ui-helpers';

// Pages (Views)
import NotFoundPage from './error/not-found-page';
import LoginPage from './auth/login-page';
import RegisterPage from './auth/register-page';
import HomePage from './home/home-page';
import AddStoryPage from './story/add-story-page';
import StoryDetailPage from './story/story-detail-page';

// Presenters
import LoginPresenter from '../presenter/LoginPresenter';
import RegisterPresenter from '../presenter/RegisterPresenter';
import HomePresenter from '../presenter/HomePresenter';
import StoryDetailPresenter from '../presenter/StoryDetailPresenter';

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;
  #appViewContainer = null;
  #navLinksContainer = null;
  #currentPath = '';

  constructor({ content, drawerButton, navigationDrawer }) {
    this.#content = content;
    this.#appViewContainer = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;
    this.#navLinksContainer = document.getElementById('nav-list');

    this._initialAppShell();
    this._setupDrawer();
  }

  _initialAppShell() {
    // Setup listeners for the global message modal
    const messageModal = document.getElementById('message-modal');
    const closeXButton = document.getElementById('message-modal-close-x');
    const closeButton = document.getElementById('message-modal-close-button');
    const closeModal = () => messageModal?.classList.add('hidden');
    
    closeXButton?.addEventListener('click', closeModal);
    closeButton?.addEventListener('click', closeModal);
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !messageModal?.classList.contains('hidden')) {
        closeModal();
      }
    });

    // Correct implementation for the skip-to-content link
    const skipLink = document.querySelector('.skip-link');
    const mainContent = document.querySelector('#main-content');
    
    if (skipLink && mainContent) {
      skipLink.addEventListener('click', (event) => {
        event.preventDefault();       // Prevent URL hash change
        skipLink.blur();              // Remove focus from the link
        mainContent.focus();          // Set focus to the main content area
        mainContent.scrollIntoView(); // Scroll the page to the main content
      });
    }
    
    // Set current year in the footer
    const currentYearElement = document.getElementById('current-year');
    if (currentYearElement) {
      currentYearElement.textContent = new Date().getFullYear();
    }

    this.updateNavLinks();
  }

  _setupDrawer() {
    this.#drawerButton.addEventListener('click', (event) => {
      event.stopPropagation();
      this.#navigationDrawer.classList.toggle('open');
    });

    document.body.addEventListener('click', (event) => {
      if (!this.#navigationDrawer.contains(event.target) && !this.#drawerButton.contains(event.target)) {
        this.#navigationDrawer.classList.remove('open');
      }
    });

    // Close drawer when a link or button inside it is clicked
    this.#navigationDrawer.addEventListener('click', (event) => {
        if (event.target.tagName === 'A' || event.target.tagName === 'BUTTON') {
            this.#navigationDrawer.classList.remove('open');
        }
    });
  }

  updateNavLinks() {
    if (!this.#navLinksContainer) return;
    const loggedIn = isLoggedIn();
    const userName = getUserName();
    let navContent = '';

    if (loggedIn) {
      navContent = `
        <li><span class="text-sm hidden md:inline px-3 py-2">Halo, ${userName || 'Pengguna'}!</span></li>
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
      document.getElementById('logout-button-global')?.addEventListener('click', () => this.handleLogout());
    }
  }

  handleLogout() {
    clearAuthData();
    this.updateNavLinks();
    showMessageModal('Logout Berhasil', 'Anda telah berhasil keluar.', 'success');
    window.location.hash = '#/login';
  }

  showGlobalLoading() {
    showLoading(this.#appViewContainer);
  }

  hideGlobalLoading() {
    const spinner = this.#appViewContainer.querySelector('.spinner');
    spinner?.remove();
  }

  async renderPage() {
    // Stop camera stream if navigating away from add-story page
    if (this.#currentPath.startsWith('#/add-story') && !window.location.hash.startsWith('#/add-story')) {
      globalStopCameraStream();
    }
    this.#currentPath = window.location.hash;

    const url = getActiveRoute();
    const pathSegments = parseActivePathname();
    
    const PageClass = routes[url] || NotFoundPage;
    const pageInstance = new PageClass(pathSegments);

    // Render the page's skeleton HTML first to ensure elements exist in the DOM
    this.#content.innerHTML = await pageInstance.render();
    // Call afterRender to set up internal event listeners for the page
    await pageInstance.afterRender(this);

    // Now that the view is in the DOM, initialize the presenter to populate it with data.
    // This solves timing issues where presenters tried to access elements that didn't exist yet.
    try {
        if (PageClass === LoginPage) {
            new LoginPresenter({ view: pageInstance, app: this });
        } else if (PageClass === RegisterPage) {
            new RegisterPresenter({ view: pageInstance, app: this });
        } else if (PageClass === HomePage) {
            const presenter = new HomePresenter({ view: pageInstance, app: this });
            await presenter._loadStories(); // Manually trigger data loading
        } else if (PageClass === StoryDetailPage) {
            const presenter = new StoryDetailPresenter({ view: pageInstance, app: this, urlParams: pathSegments });
            // The presenter's constructor will trigger data loading.
        }
    } catch(e) {
        console.error("Error during presenter logic execution:", e);
    } 
    
    document.getElementById('main-content')?.focus({ preventScroll: true });
    this.updateNavLinks();
  }
}

export default App;
