import { showMessageModal } from '../../utils/ui-helpers';

class RegisterPage {
  constructor() {
    this._registerSubmitHandler = null;
  }

  onRegisterSubmit(handler) {
    this._registerSubmitHandler = handler;
  }
  
  validateForm({ name, email, password }) {
    return name && email && password && password.length >= 8;
  }

  showSuccess(message) {
    showMessageModal('Registration Successful', message, 'success');
  }

  showError(message) {
    showMessageModal('Registration Failed', message, 'error');
  }

  async render() {
    return `
      <section aria-labelledby="register-heading" class="max-w-md mx-auto">
        <h1 id="register-heading" class="text-3xl font-bold text-center mb-8 text-gray-700">Buat Akun Baru</h1>
        <form id="register-form" class="space-y-6" novalidate>
          <div>
            <label for="register-name" class="block text-sm font-medium text-gray-700">Nama</label>
            <input type="text" id="register-name" name="name" required autocomplete="name" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="Nama Anda">
          </div>
          <div>
            <label for="register-email" class="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" id="register-email" name="email" required autocomplete="email" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="email@contoh.com">
          </div>
          <div>
            <label for="register-password" class="block text-sm font-medium text-gray-700">Kata Sandi</label>
            <input type="password" id="register-password" name="password" required minlength="8" autocomplete="new-password" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="Minimal 8 karakter">
          </div>
          <button type="submit" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
            Daftar
          </button>
          <p class="text-sm text-center text-gray-600">Sudah punya akun? <a href="#/login" class="font-medium text-blue-600 hover:text-blue-500">Masuk di sini</a></p>
        </form>
      </section>
    `;
  }

  async afterRender() {
    const registerForm = document.getElementById('register-form');
    registerForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const name = event.target.name.value;
      const email = event.target.email.value;
      const password = event.target.password.value;

      if (this._registerSubmitHandler) {
        this._registerSubmitHandler({ name, email, password });
      }
    });
  }
}

export default RegisterPage;
