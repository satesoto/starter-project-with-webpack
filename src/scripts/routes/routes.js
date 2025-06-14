// Hapus import halaman about dari starter
// import AboutPage from '../pages/about/about-page';

// Impor halaman-halaman baru untuk Aplikasi CeritaKita
import HomePage from '../pages/home/home-page'; // Ini akan menjadi list cerita
import LoginPage from '../pages/auth/login-page';
import RegisterPage from '../pages/auth/register-page';
import AddStoryPage from '../pages/story/add-story-page';
import StoryDetailPage from '../pages/story/story-detail-page';
import NotFoundPage from '../pages/error/not-found-page';
import AboutPage from '../pages/about/about-page'; // &lt;-- Tambahkan impor ini


const routes = {
  '/': HomePage, // Menggunakan kelasnya langsung, bukan instance
  '/login': LoginPage,
  '/register': RegisterPage,
  '/add-story': AddStoryPage,
  '/story/:id': StoryDetailPage, // Rute dengan parameter ID
  '/about': AboutPage
  // Tambahkan NotFoundPage jika URL tidak cocok (akan dihandle di App.js)
};

export default routes;