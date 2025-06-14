import CONFIG from '../config';
import { getAuthToken } from './auth'; // Impor getAuthToken

async function fetchWithAuth(endpoint, options = {}) {
  const url = `${CONFIG.BASE_URL}${endpoint}`;
  const token = getAuthToken();
  
  const headers = { ...options.headers };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    // Handle 201 Created with no content
    if (response.status === 201 && (response.headers.get("content-length") === "0" || !response.headers.get("content-length"))) {
        return { message: "Operasi berhasil." };
    }
    return response.json();
  } catch (error) {
    console.error(`API call failed: ${error.message}`, { url, options });
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

export async function getAllStories(page = 1, size = 10, location = 0) {
  // Parameter location=1 untuk cerita dengan lokasi, 0 untuk semua
  return fetchWithAuth(`/stories?page=${page}&size=${size}&location=${location}`);
}

export async function getStoryById(id) {
  return fetchWithAuth(`/stories/${id}`);
}

export async function addNewStory(description, photoFile, lat, lon) {
  const formData = new FormData();
  formData.append('description', description);
  formData.append('photo', photoFile);
  if (lat !== null && lon !== null && !isNaN(lat) && !isNaN(lon)) {
    formData.append('lat', lat);
    formData.append('lon', lon);
  }
  
  return fetchWithAuth('/stories', {
    method: 'POST',
    body: formData,
  });
}