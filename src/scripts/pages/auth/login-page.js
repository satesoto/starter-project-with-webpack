import { loginUser } from '../../data/api';
import { saveAuthData } from '../../data/auth';
import { showMessageModal } from '../../utils/ui-helpers';
import App from '../app'; // Untuk memanggil updateNavLinks dan navigasi

export default class LoginPage {
  async render() {
    return `
      <section aria-labelledby="login-heading" class="max-w-md mx-auto">
        <h2 id="login-heading" class="text-3xl font-bold text-center mb-8 text-gray-700">Masuk ke Akun Anda</h2>
        <form id="login-form" class="space-y-6">
          <div>
            <label for="login-email" class="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" id="login-email" name="email" required autocomplete="email" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="email@contoh.com">
          </div>
          <div>
            <label for="login-password" class="block text-sm font-medium text-gray-700">Kata Sandi</label>
            <input type="password" id="login-password" name="password" required autocomplete="current-password" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="••••••••">
          </div>
          <button type="submit" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
            Masuk
          </button>
          <p class="text-sm text-center text-gray-600">Belum punya akun? <a href="#/register" class="font-medium text-blue-600 hover:text-blue-500">Daftar di sini</a></p>
        </form>
      </section>
    `;
  }

  async afterRender(appInstance) { // Terima instance App
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const email = event.target.email.value;
        const password = event.target.password.value;
        
        // Tampilkan loading (mungkin perlu dihandle global oleh appInstance)
        if (appInstance) appInstance.showGlobalLoading();

        try {
          const response = await loginUser(email, password);
          if (response.error || !response.loginResult) {
            throw new Error(response.message || 'Login gagal. Periksa kembali email dan kata sandi Anda.');
          }
          saveAuthData(response.loginResult.token, response.loginResult.name);
          showMessageModal('Login Berhasil', `Selamat datang kembali, ${response.loginResult.name}!`, 'success');
          if (appInstance) appInstance.updateNavLinks(); // Panggil updateNavLinks dari App
          window.location.hash = '#/'; // Navigasi
        } catch (error) {
          showMessageModal('Login Gagal', error.message, 'error');
        } finally {
           if (appInstance) appInstance.hideGlobalLoading();
        }
      });
    }
  }
}