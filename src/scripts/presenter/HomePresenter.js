import { getAllStories } from '../data/api';

class HomePresenter {
  constructor({ view, app }) {
    this._view = view;
    this._app = app;
  }

  /**
   * This method is called by app.js after the initial view is rendered.
   * It fetches the stories and tells the view to display them or show an error.
   */
  async _loadStories() {
    try {
      const response = await getAllStories();
      this._view.showStories(response.listStory);
    } catch (error) {
      this._view.showError(error.message);
    }
  }
}

export default HomePresenter;
