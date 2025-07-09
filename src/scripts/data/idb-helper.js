import { openDB } from "idb";
import CONFIG from "../config";

const DB_NAME = "ceritakita-db";
const DB_VERSION = 1;

// Tambahkan nama Object Store baru untuk cerita yang tertunda
const OBJECT_STORE_NAMES = {
  STORIES: "stories",
  PENDING_STORIES: "pending-stories",
};

const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(database) {
    // Membuat object store untuk cache cerita
    if (!database.objectStoreNames.contains(OBJECT_STORE_NAMES.STORIES)) {
      database.createObjectStore(OBJECT_STORE_NAMES.STORIES, { keyPath: "id" });
    }
    // Membuat object store untuk cerita yang akan diunggah saat offline
    if (!database.objectStoreNames.contains(OBJECT_STORE_NAMES.PENDING_STORIES)) {
      database.createObjectStore(OBJECT_STORE_NAMES.PENDING_STORIES, { autoIncrement: true, keyPath: "id" });
    }
  },
});

const StoryDb = {
  // --- Metode untuk cache cerita (sudah ada) ---
  async getAllStories() {
    return (await dbPromise).getAll(OBJECT_STORE_NAMES.STORIES);
  },
  async getStory(id) {
    return (await dbPromise).get(OBJECT_STORE_NAMES.STORIES, id);
  },
  async putStory(story) {
    if (!story || !story.id) return;
    return (await dbPromise).put(OBJECT_STORE_NAMES.STORIES, story);
  },
  async putAllStories(stories) {
    if (!stories || stories.length === 0) return;
    const tx = (await dbPromise).transaction(OBJECT_STORE_NAMES.STORIES, "readwrite");
    for (const story of stories) {
      tx.store.put(story);
    }
    await tx.done;
  },
  async deleteStory(id) {
    return (await dbPromise).delete(OBJECT_STORE_NAMES.STORIES, id);
  },
  async clearAllStories() {
    const tx = (await dbPromise).transaction(OBJECT_STORE_NAMES.STORIES, "readwrite");
    await tx.store.clear();
    return tx.done;
  },

  // --- Metode BARU untuk menangani cerita yang tertunda ---
  async addPendingStory(story) {
    return (await dbPromise).add(OBJECT_STORE_NAMES.PENDING_STORIES, story);
  },
  async getAllPendingStories() {
    return (await dbPromise).getAll(OBJECT_STORE_NAMES.PENDING_STORIES);
  },
  async deletePendingStory(id) {
    return (await dbPromise).delete(OBJECT_STORE_NAMES.PENDING_STORIES, id);
  },
};

export default StoryDb;
