import { getAllStories as fetchAllStories } from "../data/api";
import StoryDb from "../data/idb-helper";

class HomePresenter {
  constructor({ view, app }) {
    this._view = view;
    this._app = app;
  }

  async _loadStories() {
    try {
      // Coba ambil dari jaringan dulu
      const response = await fetchAllStories();
      this._view.showStories(response.listStory);
      // Jika berhasil, simpan ke IndexedDB
      await StoryDb.putAllStories(response.listStory);
    } catch (error) {
      // Jika jaringan gagal, coba ambil dari IndexedDB
      console.log("Gagal mengambil dari jaringan, mencoba dari IndexedDB...");
      const storiesFromDb = await StoryDb.getAllStories();
      if (storiesFromDb && storiesFromDb.length > 0) {
        this._view.showStories(storiesFromDb);
        this._view.showError("Anda sedang offline. Menampilkan data yang tersimpan."); // Beri pesan
      } else {
        // Jika keduanya gagal, tampilkan error
        this._view.showError(error.message || "Tidak ada data yang bisa ditampilkan.");
      }
    }
  }
}

export default HomePresenter;
