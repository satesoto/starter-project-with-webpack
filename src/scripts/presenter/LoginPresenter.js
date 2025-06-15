// src/scripts/presenter/LoginPresenter.js
import { loginUser } from "../data/api";
import { saveAuthData } from "../data/auth";

class LoginPresenter {
  constructor({ view, app }) {
    this._view = view;
    this._app = app;

    this._view.onLoginSubmit(this._login.bind(this));
  }

  async _login({ email, password }) {
    if (!this._view.validateForm({ email, password })) {
      this._view.showError("Email and password are required.");
      return;
    }

    this._app.showGlobalLoading();
    try {
      const response = await loginUser(email, password);
      if (response.error || !response.loginResult) {
        throw new Error(
          response.message || "Login failed. Please check your credentials."
        );
      }

      saveAuthData(response.loginResult.token, response.loginResult.name);
      this._view.showSuccess(`Welcome back, ${response.loginResult.name}!`);

      this._app.updateNavLinks();
      window.location.hash = "#/";
    } catch (error) {
      this._view.showError(error.message);
    } finally {
      this._app.hideGlobalLoading();
    }
  }
}

export default LoginPresenter;
