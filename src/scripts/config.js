const CONFIG = {
  BASE_URL: 'https://story-api.dicoding.dev/v1',
  AUTH_TOKEN_KEY: 'STORY_APP_AUTH_TOKEN',
  USER_NAME_KEY: 'STORY_APP_USER_NAME',
  DEFAULT_MAP_CONFIG: {
    coords: [-6.200000, 106.816666], // Jakarta
    zoom: 13,
    tileLayer: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
};

export default CONFIG;