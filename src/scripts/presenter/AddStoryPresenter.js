import { addNewStory } from "../data/api";

class AddStoryPresenter {
  constructor({ view, app }) {
    this._view = view;
    this._app = app;
    this._isSubmitting = false;
    this._view.onFormSubmit(this._handleFormSubmit.bind(this));
  }

  async _handleFormSubmit({ description }) {
    if (this._isSubmitting) return;
    const photoFile = this._view.getPhotoFile();
    const location = this._view.getLocation();
    if (!description || !photoFile) {
      this._view.showError("Deskripsi dan foto cerita wajib diisi.");
      return;
    }
    this._isSubmitting = true;
    this._view.updateSubmitButton(true);
    this._app.showGlobalLoading();
    try {
      const lat = location ? location.lat : null;
      const lon = location ? location.lon : null;
      await addNewStory(description, photoFile, lat, lon);
      this._view.showSuccess("Cerita Anda telah berhasil dibagikan!");
      window.location.hash = "#/";
    } catch (error) {
      this._view.showError(error.message || "Gagal mengunggah cerita.");
    } finally {
      this._isSubmitting = false;
      this._view.updateSubmitButton(false);
      this._app.hideGlobalLoading();
    }
  }
}

export default AddStoryPresenter;
