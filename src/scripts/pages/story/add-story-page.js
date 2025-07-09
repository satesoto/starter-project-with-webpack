import { isLoggedIn } from "../../data/auth";
import { initMap, startCamera, stopCameraStream, captureImage, handleImageUpload, showMessageModal } from "../../utils/ui-helpers";
import CONFIG from "../../config";

class AddStoryPage {
  constructor() {
    this._formSubmitHandler = null;
    this.capturedFile = null;
    this.selectedLocation = null;
  }

  // Metode yang akan dipanggil oleh Presenter
  onFormSubmit(handler) {
    this._formSubmitHandler = handler;
  }

  // Metode untuk mengontrol UI dari Presenter
  updateSubmitButton(disabled) {
    const submitButton = document.querySelector('#add-story-form button[type="submit"]');
    submitButton.disabled = disabled;
    submitButton.textContent = disabled ? "Mengunggah..." : "Bagikan Cerita";
  }

  async render() {
    if (!isLoggedIn()) {
      window.location.hash = "#/login";
      return "<p>Anda harus login untuk mengakses halaman ini.</p>";
    }
    // Reset state setiap kali render
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
            <p id="photo-group-label" class="block text-sm font-medium text-gray-700">Foto Cerita (Wajib)</p>
            <div class="image-buttons-container mt-1">
              <button type="button" id="start-camera-button">Buka Kamera</button>
              
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
          </div>

          <div>
            <label id="map-label" class="block text-sm font-medium text-gray-700">Lokasi Cerita (Opsional)</label>
            <div id="add-story-map-container" class="map-container" aria-labelledby="map-label"></div>
            <p id="selected-coords-display" class="text-sm text-gray-600 mt-2">Koordinat belum dipilih.</p>
          </div>
          
          <button type="submit" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400">Bagikan Cerita</button>
        </form>
      </section>
    `;
  }

  async afterRender() {
    if (!isLoggedIn()) return;

    // Inisialisasi peta
    initMap("add-story-map-container", CONFIG.DEFAULT_MAP_CONFIG.coords, "Pilih Lokasi", false, true, (coords) => {
      this.selectedLocation = coords;
      document.getElementById("selected-coords-display").textContent = `Koordinat: Lat ${coords.lat.toFixed(5)}, Lon ${coords.lon.toFixed(5)}`;
    });

    const form = document.getElementById("add-story-form");
    const imageUploadInput = document.getElementById("image-upload-input");
    const uploadImageButton = document.getElementById("upload-image-button");
    const capturedImagePreview = document.getElementById("captured-image-preview");
    const cameraFeed = document.getElementById("camera-feed");

    // **PERBAIKAN UNTUK UNGGAH GAMBAR**
    uploadImageButton.addEventListener("click", () => {
      imageUploadInput.click(); // Memicu klik pada input file yang tersembunyi
    });

    // Setup event listeners untuk kamera dan file
    document.getElementById("start-camera-button").onclick = () =>
      startCamera(cameraFeed, capturedImagePreview, (msg) => showMessageModal("Kamera Error", msg, "error"));
    document.getElementById("stop-camera-button").onclick = stopCameraStream;
    document.getElementById("capture-image-button").onclick = () =>
      captureImage(cameraFeed, capturedImagePreview, (file) => {
        this.capturedFile = file;
      });
    imageUploadInput.onchange = (event) =>
      handleImageUpload(event, capturedImagePreview, (file) => {
        this.capturedFile = file;
      });

    // Form submit hanya akan meneruskan data ke Presenter
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (this._formSubmitHandler) {
        this._formSubmitHandler({
          description: form.elements.description.value,
          photo: this.capturedFile,
          lat: this.selectedLocation ? this.selectedLocation.lat : null,
          lon: this.selectedLocation ? this.selectedLocation.lon : null,
        });
      }
    });
  }
}

export default AddStoryPage;
