"use client";

const DB_NAME = "usagi-session";
const DB_VERSION = 1;
const STORE_NAME = "drafts";
const SESSION_ID_KEY = "usagi-image-session-id";
const LEGACY_IMAGE_KEY = "analysis-images";
const MAX_AGE_MS = 2 * 60 * 60 * 1000;

type ImageEnvelope = {
  version: 2;
  savedAt: number;
  images: string[];
};

function getImageKey() {
  if (typeof window === "undefined") return LEGACY_IMAGE_KEY;
  let sessionId = window.sessionStorage.getItem(SESSION_ID_KEY);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    window.sessionStorage.setItem(SESSION_ID_KEY, sessionId);
  }
  return `analysis-images:${sessionId}`;
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("indexeddb_unavailable"));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) database.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("indexeddb_open_failed"));
  });
}

async function runTransaction<T>(mode: IDBTransactionMode, operation: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const database = await openDatabase();
  try {
    return await new Promise<T>((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, mode);
      const request = operation(transaction.objectStore(STORE_NAME));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error ?? new Error("indexeddb_request_failed"));
      transaction.onabort = () => reject(transaction.error ?? new Error("indexeddb_transaction_aborted"));
    });
  } finally {
    database.close();
  }
}

function isImageEnvelope(value: unknown): value is ImageEnvelope {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const envelope = value as Partial<ImageEnvelope>;
  return envelope.version === 2
    && typeof envelope.savedAt === "number"
    && Array.isArray(envelope.images)
    && envelope.images.every((item) => typeof item === "string");
}

export const imageDraftStore = {
  async read(): Promise<string[]> {
    const key = getImageKey();
    try {
      const value = await runTransaction<unknown>("readonly", (store) => store.get(key));
      if (!isImageEnvelope(value)) return [];
      if (Date.now() - value.savedAt > MAX_AGE_MS) {
        await this.clear();
        return [];
      }
      return value.images;
    } catch {
      return [];
    }
  },

  async write(images: string[]): Promise<void> {
    const envelope: ImageEnvelope = { version: 2, savedAt: Date.now(), images };
    await runTransaction("readwrite", (store) => store.put(envelope, getImageKey()));
    // Remove the pre-v0.5 fixed key when encountered.
    try { await runTransaction("readwrite", (store) => store.delete(LEGACY_IMAGE_KEY)); } catch { /* best effort */ }
  },

  async clear(): Promise<void> {
    try {
      await runTransaction("readwrite", (store) => store.delete(getImageKey()));
    } catch {
      // Clearing temporary local data is best-effort.
    }
  },

  async clearAll(): Promise<void> {
    try {
      await runTransaction("readwrite", (store) => store.clear());
      if (typeof window !== "undefined") window.sessionStorage.removeItem(SESSION_ID_KEY);
    } catch {
      // Clearing temporary local data is best-effort.
    }
  },
};
