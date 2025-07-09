import { Workbox } from "workbox-window";
import { subscribeToPushNotification } from "../data/api"; // Impor fungsi baru
import { showMessageModal } from "./ui-helpers"; // Impor untuk notifikasi

const VAPID_PUBLIC_KEY = "BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const swRegister = async () => {
  if (!("serviceWorker" in navigator)) {
    console.log("Service Worker tidak didukung di browser ini.");
    return;
  }

  const wb = new Workbox("/sw.js");
  try {
    await wb.register();
    console.log("Service worker berhasil didaftarkan.");
  } catch (error) {
    console.log("Gagal mendaftarkan service worker.", error);
  }
};

const requestNotificationPermission = async () => {
  if (!("Notification" in window) || !("serviceWorker" in navigator)) {
    showMessageModal("Fitur Tidak Didukung", "Browser Anda tidak mendukung notifikasi.", "error");
    return;
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    showMessageModal("Izin Ditolak", "Anda tidak mengizinkan notifikasi.", "info");
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    // Kirim subscription ke server
    await subscribeToPushNotification(subscription);
    showMessageModal("Berhasil", "Anda berhasil berlangganan notifikasi.", "success");
  } catch (error) {
    console.error("Gagal berlangganan notifikasi:", error);
    showMessageModal("Gagal", `Gagal berlangganan notifikasi: ${error.message}`, "error");
  }
};

export { swRegister, requestNotificationPermission };
