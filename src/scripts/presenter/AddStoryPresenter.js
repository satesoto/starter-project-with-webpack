import { addNewStory } from '../data/api';

class AddStoryPresenter {
  constructor({ view, app }) {
    this._view = view;
    this._app = app;
    this._capturedFile = null;
    this._selectedLocation = null;
    this._isSubmitting = false;

    this._view.onFormSubmit(this._handleFormSubmit.bind(this));
    this._view.onImageCaptured((file) => {
      this._capturedFile = file;
    });
    this._view.onLocationSelected((coords) => {
      this._selectedLocation = coords;
    });
  }

  async _handleFormSubmit({ description }) {
    if (this._isSubmitting) return;

    if (!description) {
      this._view.showError('Deskripsi cerita tidak boleh kosong.');
      return;
    }
    if (!this._capturedFile) {
      this._view.showError('Foto cerita wajib diisi.');
      return;
    }

    this._isSubmitting = true;
    this._view.updateSubmitButton(true); // Disable button
    this._app.showGlobalLoading();

    try {
      const lat = this._selectedLocation ? this._selectedLocation.lat : null;
      const lon = this._selectedLocation ? this._selectedLocation.lon : null;

      const response = await addNewStory(description, this._capturedFile, lat, lon);

      if (response.error) {
        throw new Error(response.message);
      }

      this._view.showSuccess('Cerita Anda telah berhasil dibagikan!');
      window.location.hash = '#/';
    } catch (error) {
      this._view.showError(error.message || 'Gagal mengunggah cerita. Silakan coba lagi.');
    } finally {
      this._isSubmitting = false;
      this._view.updateSubmitButton(false); // Re-enable button
      this._app.hideGlobalLoading();
    }
  }
}

export default AddStoryPresenter;
