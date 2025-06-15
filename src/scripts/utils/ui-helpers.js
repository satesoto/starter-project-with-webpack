import L from 'leaflet';
import CONFIG from '../config';

// Import Leaflet assets
import 'leaflet/dist/leaflet.css';
import markerIconPng from 'leaflet/dist/images/marker-icon.png';
import markerIcon2xPng from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadowPng from 'leaflet/dist/images/marker-shadow.png';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIconPng,
  iconRetinaUrl: markerIcon2xPng,
  shadowUrl: markerShadowPng,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});


let currentMapInstance = null;
let currentCameraStream = null;


export function showLoading(appViewContainer) {
  if (appViewContainer) {
    appViewContainer.innerHTML = '<div class="spinner" aria-label="Memuat konten..."></div>';
  }
}

export function hideLoading(appViewContainer) { // Opsional, jika render tidak otomatis menghapus
  if (appViewContainer) {
    const spinner = appViewContainer.querySelector('.spinner');
    if (spinner) spinner.remove();
  }
}

export function showMessageModal(title, text, type = 'info') {
  const modal = document.getElementById('message-modal');
  const modalTitle = document.getElementById('message-modal-title');
  const modalText = document.getElementById('message-modal-text');
  
  if (modal && modalTitle && modalText) {
    modalTitle.textContent = title;
    modalText.textContent = text;

    modalTitle.className = 'text-xl font-semibold '; // Reset class
    if (type === 'error') modalTitle.classList.add('text-red-600');
    else if (type === 'success') modalTitle.classList.add('text-green-600');
    else modalTitle.classList.add('text-gray-800'); // Default

    modal.classList.remove('hidden');
    const closeButton = modal.querySelector('#message-modal-close-button');
    if (closeButton) closeButton.focus();
  }
}

export function initMap(containerId, centerCoords, popupText = 'Lokasi', isDisplayOnly = true, isClickableForAdd = false, onMapClickCallback = null) {
  if (currentMapInstance) {
    currentMapInstance.remove();
    currentMapInstance = null;
  }
  const mapContainer = document.getElementById(containerId);
  if (!mapContainer || !L) {
    console.error(`Elemen map dengan ID '${containerId}' tidak ditemukan atau Leaflet tidak termuat.`);
    return null;
  }
   // Pastikan container terlihat sebelum inisialisasi
  if (mapContainer.offsetParent === null) {
    console.warn(`Kontainer map '${containerId}' tidak terlihat saat init. Map mungkin tidak terender dengan benar.`);
  }

  currentMapInstance = L.map(containerId).setView(centerCoords, CONFIG.DEFAULT_MAP_CONFIG.zoom);
  L.tileLayer(CONFIG.DEFAULT_MAP_CONFIG.tileLayer, {
    maxZoom: 19,
    attribution: CONFIG.DEFAULT_MAP_CONFIG.attribution,
  }).addTo(currentMapInstance);

  let marker;
  if (isDisplayOnly || (isClickableForAdd && centerCoords[0] !== CONFIG.DEFAULT_MAP_CONFIG.coords[0])) {
    marker = L.marker(centerCoords).addTo(currentMapInstance);
    if (popupText) marker.bindPopup(popupText).openPopup();
  }

  if (isClickableForAdd) {
    currentMapInstance.on('click', (e) => {
      const coords = { lat: e.latlng.lat, lon: e.latlng.lng };
      if (marker) {
        marker.setLatLng(e.latlng);
      } else {
        marker = L.marker(e.latlng).addTo(currentMapInstance);
      }
      const popupContent = `Lokasi dipilih: ${coords.lat.toFixed(5)}, ${coords.lon.toFixed(5)}`;
      marker.bindPopup(popupContent).openPopup();
      if (onMapClickCallback) onMapClickCallback(coords);
    });
  }
  // Invalidate size untuk memastikan map render dengan benar, terutama setelah transisi/perubahan DOM
  setTimeout(() => {
    if (currentMapInstance) currentMapInstance.invalidateSize();
  }, 150);
  return currentMapInstance;
}

export async function startCamera(videoElement, previewElement, errorCallback) {
  stopCameraStream(); // Hentikan stream yang ada
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    try {
      currentCameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoElement) {
        videoElement.srcObject = currentCameraStream;
        videoElement.parentElement.classList.remove('hidden'); // Tampilkan container kamera
      }
      if (previewElement) previewElement.classList.add('hidden'); // Sembunyikan preview
      return currentCameraStream;
    } catch (err) {
      console.error("Error mengakses kamera: ", err);
      if (errorCallback) errorCallback(`Tidak bisa mengakses kamera: ${err.message}. Pastikan Anda memberikan izin.`);
      if (videoElement) videoElement.parentElement.classList.add('hidden');
      return null;
    }
  } else {
    if (errorCallback) errorCallback('Browser Anda tidak mendukung akses kamera.');
    return null;
  }
}

export function stopCameraStream() {
  if (currentCameraStream) {
    currentCameraStream.getTracks().forEach(track => track.stop());
    currentCameraStream = null;
    const cameraContainer = document.getElementById('camera-container'); // Asumsi ID ini ada
    if (cameraContainer) cameraContainer.classList.add('hidden');
    const videoEl = document.getElementById('camera-feed'); // Asumsi ID ini ada
    if(videoEl) videoEl.srcObject = null;
  }
}

export function captureImage(videoElement, previewElement, callbackWithFile) {
  if (currentCameraStream && videoElement && previewElement) {
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    
    previewElement.src = canvas.toDataURL('image/jpeg');
    previewElement.classList.remove('hidden');
    
    canvas.toBlob(blob => {
      if (blob && callbackWithFile) {
        const file = new File([blob], "captured_story_image.jpg", { type: "image/jpeg" });
        callbackWithFile(file);
      }
    }, 'image/jpeg');
    stopCameraStream();
  }
}

export function handleImageUpload(event, previewElement, callbackWithFile) {
  const file = event.target.files?.[0];
  if (file && previewElement && callbackWithFile) {
    callbackWithFile(file); // Langsung panggil callback dengan file
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        previewElement.src = e.target.result.toString();
        previewElement.classList.remove('hidden');
      }
    }
    reader.readAsDataURL(file);
    stopCameraStream(); // Pastikan kamera mati jika pengguna mengunggah
  }
}