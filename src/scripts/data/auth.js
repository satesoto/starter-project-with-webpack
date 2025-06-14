import CONFIG from '../config';

export function saveAuthData(token, name) {
  sessionStorage.setItem(CONFIG.AUTH_TOKEN_KEY, token);
  sessionStorage.setItem(CONFIG.USER_NAME_KEY, name);
}

export function getAuthToken() {
  return sessionStorage.getItem(CONFIG.AUTH_TOKEN_KEY);
}

export function getUserName() {
  return sessionStorage.getItem(CONFIG.USER_NAME_KEY);
}

export function clearAuthData() {
  sessionStorage.removeItem(CONFIG.AUTH_TOKEN_KEY);
  sessionStorage.removeItem(CONFIG.USER_NAME_KEY);
}

export function isLoggedIn() {
  return !!getAuthToken();
}