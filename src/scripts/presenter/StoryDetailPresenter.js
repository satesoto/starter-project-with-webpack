import { getStoryById } from '../data/api';

class StoryDetailPresenter {
  constructor({ view, app, urlParams }) {
    this._view = view;
    this._app = app;
    this._storyId = urlParams.id;
    
    this._loadStoryDetail();
  }

  async _loadStoryDetail() {
    if (!this._storyId) {
      // Memanggil metode showError yang ada di View
      this._view.showError('Story ID tidak ditemukan di URL.');
      return;
    }

    // View sudah menampilkan state 'loading', jadi tidak perlu loader global.
    try {
      const response = await getStoryById(this._storyId);
      
      // Memanggil metode fillStoryDetails yang ada di View untuk mengisi data
      this._view.fillStoryDetails(response.story);
    } catch (error) {
      // Jika terjadi error, panggil metode showError di View
      this._view.showError(error.message);
    }
  }
}

export default StoryDetailPresenter;
