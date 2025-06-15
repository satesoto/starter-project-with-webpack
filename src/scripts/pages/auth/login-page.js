// src/scripts/pages/auth/login-page.js
import { showMessageModal } from '../../utils/ui-helpers';

class LoginPage {
  constructor() {
    this._loginSubmitHandler = null;
  }

  onLoginSubmit(handler) {
    this._loginSubmitHandler = handler;
  }

  validateForm({ email, password }) {
    return email && password;
  }

  showSuccess(message) {
    showMessageModal('Login Successful', message, 'success');
  }

  showError(message) {
    showMessageModal('Login Failed', message, 'error');
  }

  async render() {
    return `
      <section aria-labelledby="login-heading" class="max-w-md mx-auto">
        <h1 id="login-heading" class="text-3xl font-bold text-center mb-8 text-gray-700">Masuk ke Akun Anda</h1>
        <form id="login-form" class="space-y-6" novalidate>
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

  async afterRender() {
    const loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit', (event) => {
      event.preventDefault();
      
      const email = event.target.email.value;
      const password = event.target.password.value;
      
      if (this._loginSubmitHandler) {
        this._loginSubmitHandler({ email, password });
      }
    });
  }
}

export default LoginPage;
