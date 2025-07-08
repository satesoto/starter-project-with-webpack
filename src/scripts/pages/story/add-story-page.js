import { addNewStory } from '../../data/api';
import { isLoggedIn } from '../../data/auth';
import { 
  initMap, 
  startCamera, 
  stopCameraStream, 
  captureImage, 
  handleImageUpload, 
  showMessageModal 
} from '../../utils/ui-helpers';
import CONFIG from '../../config';

class AddStoryPage {
  constructor() {
    this.capturedFile = null;
    this.selectedLocation = null;
  }

  async render() {
    if (!isLoggedIn()) {
      window.location.hash = '#/login';
      return '<p>Anda harus login untuk mengakses halaman ini.</p>';
    }
    this.capturedFile = null;
    this.selectedLocation = null;
    stopCameraStream();

    return `
      <section aria-labelledby="add-story-heading" class="add-story-section container max-w-2xl mx-auto">
        <h1 id="add-story-heading" class="text-3xl font-bold text-center mb-8 text-gray-700">Bagikan Cerita Baru Anda</h1>
        <form id="add-story-form" novalidate>
          <div>
            <label for="add-story-description" class="block text-sm font-medium text-gray-700 mb-1">Deskripsi Cerita</label>
            <textarea id="add-story-description" name="description" rows="4" required placeholder="Tuliskan ceritamu di sini..."></textarea>
          </div>

          <div>
            <!-- Label ini sekarang secara logis mengelompokkan tombol-tombol di bawahnya -->
            <p id="photo-group-label" class="block text-sm font-medium text-gray-700">Foto Cerita (Wajib)</p>
            <div class="image-buttons-container mt-1" role="group" aria-labelledby="photo-group-label">
              <button type="button" id="start-camera-button">Buka Kamera</button>
              <!-- Label ini secara eksplisit terhubung ke input file yang tersembunyi -->
              <label for="image-upload-input" class="sr-only">Unggah Gambar</label>
              <input type="file" id="image-upload-input" accept="image/*" class="sr-only">
              <button type="button" id="upload-image-button">Unggah Gambar</button>
            </div>
            <div id="camera-container" class="hidden mt-2">
              <video id="camera-feed" autoplay playsinline class="w-full rounded-md border"></video>
              <div class="mt-2 flex gap-2">
                <button type="button" id="capture-image-button">Ambil Foto</button>
                <button type="button" id="stop-camera-button">Tutup Kamera</button>
              </div>
            </div>
            <img id="captured-image-preview" src="#" alt="Pratinjau gambar" class="hidden mt-4 max-w-full max-h-80 mx-auto rounded-md border"/>
            <p id="image-error-message" class="text-red-500 text-sm mt-1 hidden"></p>
          </div>

          <div>
            <!-- Menggunakan aria-labelledby untuk menghubungkan judul dengan elemen interaktif (peta) -->
            <label id="map-label" class="block text-sm font-medium text-gray-700">Lokasi Cerita (Opsional)</label>
            <p class="location-label-info">Klik pada peta untuk memilih lokasi.</p>
            <div id="add-story-map-container" class="map-container" aria-labelledby="map-label"></div>
            <p id="selected-coords-display" class="text-sm text-gray-600 mt-2">Koordinat belum dipilih.</p>
          </div>
          
          <button type="submit" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400">Bagikan Cerita</button>
        </form>
      </section>
    `;
  }

  async afterRender(appInstance) {
    if (!isLoggedIn()) return;

    initMap(
      'add-story-map-container', CONFIG.DEFAULT_MAP_CONFIG.coords, 'Pilih Lokasi', false, true,
      (coords) => {
        this.selectedLocation = coords;
        document.getElementById('selected-coords-display').textContent = `Koordinat: Lat ${coords.lat.toFixed(5)}, Lon ${coords.lon.toFixed(5)}`;
      },
    );

    const form = document.getElementById('add-story-form');
    const descriptionInput = document.getElementById('add-story-description');
    const imageErrorMessage = document.getElementById('image-error-message');
    const capturedImagePreview = document.getElementById('captured-image-preview');
    const imageUploadInput = document.getElementById('image-upload-input');
    const cameraFeed = document.getElementById('camera-feed');
    const submitButton = form.querySelector('button[type="submit"]');

    const handleFileChange = (file) => {
      this.capturedFile = file;
      if (imageErrorMessage) imageErrorMessage.classList.add('hidden');
    };
    
    document.getElementById('start-camera-button').onclick = () => startCamera(cameraFeed, capturedImagePreview, (msg) => showMessageModal('Kamera Error', msg, 'error'));
    document.getElementById('stop-camera-button').onclick = stopCameraStream;
    document.getElementById('capture-image-button').onclick = () => captureImage(cameraFeed, capturedImagePreview, handleFileChange);
    document.getElementById('upload-image-button').onclick = () => imageUploadInput.click();
    imageUploadInput.onchange = (event) => handleImageUpload(event, capturedImagePreview, handleFileChange);

    form.onsubmit = async (event) => {
      event.preventDefault();
      const description = descriptionInput.value;
      if (!description || !this.capturedFile) {
        showMessageModal('Validasi Gagal', 'Deskripsi dan foto cerita wajib diisi.', 'error');
        return;
      }
      
      submitButton.disabled = true;
      submitButton.textContent = 'Mengunggah...';
      if (appInstance) appInstance.showGlobalLoading();

      try {
        const lat = this.selectedLocation ? this.selectedLocation.lat : null;
        const lon = this.selectedLocation ? this.selectedLocation.lon : null;
        const response = await addNewStory(description, this.capturedFile, lat, lon);
        
        if (response.error) {
          throw new Error(response.message);
        }

        showMessageModal('Cerita Ditambahkan', 'Cerita baru Anda telah berhasil dibagikan!', 'success');
        window.location.hash = '#/';
      } catch (error) {
        showMessageModal('Gagal Menambahkan Cerita', error.message, 'error');
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Bagikan Cerita';
        if (appInstance) appInstance.hideGlobalLoading();
      }
    };
  }
}

export default AddStoryPage;
