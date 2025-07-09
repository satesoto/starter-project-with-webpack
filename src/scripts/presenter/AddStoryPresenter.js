import { addNewStory } from "../data/api";
import { showMessageModal } from "../utils/ui-helpers";
import StoryDb from "../data/idb-helper";

class AddStoryPresenter {
  constructor({ view, app }) {
    this._view = view;
    this._app = app;
    this._isSubmitting = false;

    this._view.onFormSubmit(this._handleFormSubmit.bind(this));
  }

  async _handleFormSubmit({ description, photo, lat, lon }) {
    if (this._isSubmitting) return;

    if (!description || !photo) {
      showMessageModal("Validasi Gagal", "Deskripsi dan foto cerita wajib diisi.", "error");
      return;
    }

    this._isSubmitting = true;
    this._view.updateSubmitButton(true); // Nonaktifkan tombol
    this._app.showGlobalLoading();

    try {
      const response = await addNewStory(description, photo, lat, lon);
      if (response.error) {
        throw new Error(response.message);
      }
      this._app.hideGlobalLoading(); // Sembunyikan loading sebelum navigasi
      showMessageModal("Cerita Ditambahkan", "Cerita baru Anda telah berhasil dibagikan!", "success");
      window.location.hash = "#/";
    } catch (error) {
      console.error("Gagal mengunggah cerita:", error.message);

      // Cek apakah error karena offline atau bukan
      if (navigator.onLine === false || error.message.includes("Failed to fetch")) {
        await this._saveForSync({ description, photo, lat, lon });
      } else {
        // Jika error lain, tampilkan pesan error biasa
        this._app.hideGlobalLoading();
        showMessageModal("Gagal Mengunggah Cerita", error.message, "error");
        this._view.updateSubmitButton(false); // Aktifkan kembali tombol jika gagal dan tidak offline
      }
    } finally {
      this._isSubmitting = false;
    }
  }

  async _saveForSync(storyData) {
    await StoryDb.addPendingStory(storyData);
    if ("serviceWorker" in navigator && "SyncManager" in window) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.sync.register("add-new-story-sync");
      });
    }
    this._app.hideGlobalLoading();
    showMessageModal("Mode Offline", "Cerita disimpan dan akan diunggah saat kembali online.", "info");
    window.location.hash = "#/";
  }
}

export default AddStoryPresenter;
