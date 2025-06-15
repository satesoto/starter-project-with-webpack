// src/scripts/presenter/RegisterPresenter.js
import { registerUser } from "../data/api";

class RegisterPresenter {
  constructor({ view, app }) {
    this._view = view;
    this._app = app;

    this._view.onRegisterSubmit(this._register.bind(this));
  }

  async _register({ name, email, password }) {
    if (!this._view.validateForm({ name, email, password })) {
      this._view.showError("All fields are required.");
      return;
    }

    this._app.showGlobalLoading();
    try {
      const response = await registerUser(name, email, password);
      if (response.error) {
        throw new Error(
          response.message || "Registration failed. Please try again."
        );
      }
      this._view.showSuccess("Account created successfully. Please log in.");
      window.location.hash = "#/login";
    } catch (error) {
      this._view.showError(error.message);
    } finally {
      this._app.hideGlobalLoading();
    }
  }
}

export default RegisterPresenter;
