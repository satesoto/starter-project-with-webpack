import CONFIG from '../config';
import { getAuthToken } from './auth';

/**
 * A robust fetch wrapper for API calls that includes Authorization headers
 * and provides consistent error handling.
 * @param {string} endpoint The API endpoint (e.g., '/stories').
 * @param {object} options The options for the fetch call.
 * @returns {Promise<any>} The JSON response from the API.
 */
async function fetchWithAuth(endpoint, options = {}) {
  const url = `${CONFIG.BASE_URL}${endpoint}`;
  const token = getAuthToken();
  
  const headers = { ...options.headers };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // The browser automatically sets the correct Content-Type for FormData.
  // Manually setting it can break the request.
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(url, { ...options, headers });
    const responseJson = await response.json();

    // The Dicoding API uses the 'error' property in the JSON body
    // to signify an application-level error, even with a 2xx status.
    if (responseJson.error) {
      throw new Error(responseJson.message || 'An unknown API error occurred.');
    }
    
    // If there is no 'error' property, the request was successful.
    return responseJson;
  } catch (error) {
    // This block catches:
    // 1. Network errors (e.g., user is offline).
    // 2. Errors from response.json() if the server returns non-JSON text.
    // 3. Errors explicitly thrown from the `if (responseJson.error)` check.
    console.error(`API call to ${endpoint} failed:`, error);
    
    // Re-throw the error so the presenter layer can catch it and show a message to the user.
    throw error;
  }
}

export async function registerUser(name, email, password) {
  return fetchWithAuth('/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
}

export async function loginUser(email, password) {
  return fetchWithAuth('/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function getAllStories(page = 1, size = 20, location = 0) {
  return fetchWithAuth(`/stories?page=${page}&size=${size}&location=${location}`);
}

export async function getStoryById(id) {
  return fetchWithAuth(`/stories/${id}`);
}

export async function addNewStory(description, photoFile, lat, lon) {
  const formData = new FormData();
  formData.append('description', description);
  formData.append('photo', photoFile);

  // The API expects floating point numbers for lat and lon.
  if (lat !== null && lon !== null && !isNaN(lat) && !isNaN(lon)) {
    formData.append('lat', parseFloat(lat));
    formData.append('lon', parseFloat(lon));
  }
  
  return fetchWithAuth('/stories', {
    method: 'POST',
    body: formData,
  });
}
