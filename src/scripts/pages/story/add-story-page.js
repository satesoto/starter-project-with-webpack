import { addNewStory } from '../../data/api';
import { isLoggedIn } from '../../data/auth';
import { initMap, startCamera, stopCameraStream, captureImage, handleImageUpload, showMessageModal } from '../../utils/ui-helpers';
import CONFIG from '../../config';

export default class AddStoryPage {
  constructor() {
    this.capturedFile = null;
    this.selectedLocation = null;
    this.cameraStreamRef = null; // Untuk menyimpan referensi stream kamera
  }

  async render() {
    if (!isLoggedIn()) {
      window.location.hash = '#/login';
      return '<p>Anda harus login untuk mengakses halaman ini.</p>';
    }
    // Reset state saat render ulang halaman
    this.capturedFile = null;
    this.selectedLocation = null;
    stopCameraStream(); // Pastikan kamera mati saat render awal / navigasi

    return `
      <section aria-labelledby="add-story-heading" class="add-story-section container max-w-2xl mx-auto">
        <h2 id="add-story-heading">Bagikan Cerita Baru Anda</h2>
        <form id="add-story-form">
          <div>
            <label for="add-story-description">Deskripsi Cerita</label>
            <textarea id="add-story-description" name="description" rows="4" required placeholder="Tuliskan ceritamu di sini..."></textarea>
          </div>

          <div>
            <label>Foto Cerita (Wajib)</label>
            <div class="image-buttons-container">
              <button type="button" id="start-camera-button">Buka Kamera</button>
              <input type="file" id="image-upload-input" accept="image/*" class="hidden">
              <button type="button" id="upload-image-button">Unggah Gambar</button>
            </div>
            <div id="camera-container" class="hidden">
              <video id="camera-feed" autoplay playsinline></video>
              <div class="mt-2 flex gap-2">
                <button type="button" id="capture-image-button">Ambil Foto</button>
                <button type="button" id="stop-camera-button">Tutup Kamera</button>
              </div>
            </div>
            <img id="captured-image-preview" src="#" alt="Pratinjau gambar" class="hidden"/>
            <p id="image-error-message" class="text-red-500 text-sm mt-1 hidden">Foto wajib diisi.</p>
          </div>

          <div>
            <label>Lokasi Cerita (Opsional)</label>
            <p class="location-label-info">Klik pada peta untuk memilih lokasi.</p>
            <div id="add-story-map-container" class="map-container"></div>
            <p id="selected-coords-display">Koordinat belum dipilih.</p>
          </div>
          
          <button type="submit">Bagikan Cerita</button>
        </form>
      </section>
    `;
  }

  async afterRender(appInstance) {
    if (!isLoggedIn()) return;

    const form = document.getElementById('add-story-form');
    const descriptionInput = document.getElementById('add-story-description');
    
    const startCameraButton = document.getElementById('start-camera-button');
    const uploadImageButton = document.getElementById('upload-image-button');
    const imageUploadInput = document.getElementById('image-upload-input');
    const cameraFeed = document.getElementById('camera-feed');
    const capturedImagePreview = document.getElementById('captured-image-preview');
    const captureImageButton = document.getElementById('capture-image-button');
    const stopCameraButton = document.getElementById('stop-camera-button');
    const imageErrorMessage = document.getElementById('image-error-message');
    const coordsDisplay = document.getElementById('selected-coords-display');

    // Inisialisasi Peta
    initMap(
      'add-story-map-container', 
      CONFIG.DEFAULT_MAP_CONFIG.coords, 
      'Pilih Lokasi', 
      false, 
      true,
      (coords) => {
        this.selectedLocation = coords;
        if(coordsDisplay) coordsDisplay.textContent = `Koordinat: Lat ${coords.lat.toFixed(5)}, Lon ${coords.lon.toFixed(5)}`;
      }
    );

    // Event Listener Kamera & Upload
    if (startCameraButton) {
      startCameraButton.onclick = async () => {
        this.cameraStreamRef = await startCamera(cameraFeed, capturedImagePreview, (errMsg) => showMessageModal('Kamera Error', errMsg, 'error'));
      };
    }
    if (stopCameraButton) {
      stopCameraButton.onclick = () => {
        stopCameraStream(); // Menggunakan global stopCameraStream yang menyimpan referensi stream
        this.cameraStreamRef = null;
      };
    }
    if (captureImageButton) {
      captureImageButton.onclick = () => {
        captureImage(cameraFeed, capturedImagePreview, (file) => {
          this.capturedFile = file;
          if(imageErrorMessage) imageErrorMessage.classList.add('hidden');
        });
        this.cameraStreamRef = null; // Stream dihentikan di dalam captureImage
      };
    }
    if (uploadImageButton) {
      uploadImageButton.onclick = () => imageUploadInput.click();
    }
    if (imageUploadInput) {
      imageUploadInput.onchange = (event) => {
        handleImageUpload(event, capturedImagePreview, (file) => {
          this.capturedFile = file;
          if(imageErrorMessage) imageErrorMessage.classList.add('hidden');
        });
         this.cameraStreamRef = null; // Hentikan kamera jika ada
      };
    }

    // Event Listener Form Submit
    if (form) {
      form.onsubmit = async (event) => {
        event.preventDefault();
        if (appInstance) appInstance.showGlobalLoading();

        if (!this.capturedFile) {
          if(imageErrorMessage) {
            imageErrorMessage.textContent = 'Foto cerita wajib diunggah atau diambil.';
            imageErrorMessage.classList.remove('hidden');
          }
          showMessageModal('Validasi Gagal', 'Foto cerita wajib diisi.', 'error');
          if (appInstance) appInstance.hideGlobalLoading();
          return;
        }
        if(imageErrorMessage) imageErrorMessage.classList.add('hidden');

        const description = descriptionInput.value;
        const lat = this.selectedLocation ? this.selectedLocation.lat : null;
        const lon = this.selectedLocation ? this.selectedLocation.lon : null;

        try {
          const response = await addNewStory(description, this.capturedFile, lat, lon);
          if (response.error) throw new Error(response.message);
          showMessageModal('Cerita Ditambahkan', 'Cerita baru Anda telah berhasil dibagikan!', 'success');
          // Reset form atau state lokal
          this.capturedFile = null;
          this.selectedLocation = null;
          if (capturedImagePreview) {
            capturedImagePreview.classList.add('hidden');
            capturedImagePreview.src = '#';
          }
          if (form) form.reset();
          if(coordsDisplay) coordsDisplay.textContent = 'Koordinat belum dipilih.';
          
          window.location.hash = '#/';
        } catch (error) {
          showMessageModal('Gagal Menambahkan Cerita', error.message, 'error');
        } finally {
          if (appInstance) appInstance.hideGlobalLoading();
        }
      };
    }
     // Panggil stopCameraStream saat halaman akan di-unload (navigasi)
    // Ini bisa dihandle di App.js sebelum renderPage baru,
    // tapi untuk memastikan, kita tambahkan juga di sini.
    // Sebenarnya sudah dihandle di render() method class ini.
  }
}