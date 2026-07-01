const dbName = "sessionfocus.audio.v1";
const storeName = "audio_chunks";

export type StoredAudioChunk = {
  key: string;
  sessionId: string;
  index: number;
  blob: Blob;
  type: string;
  createdAt: string;
};

function openAudioDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(storeName)) {
        const store = db.createObjectStore(storeName, { keyPath: "key" });
        store.createIndex("sessionId", "sessionId", { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveAudioChunk(sessionId: string, index: number, blob: Blob): Promise<void> {
  const db = await openAudioDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    tx.objectStore(storeName).put({
      key: `${sessionId}:${index}`,
      sessionId,
      index,
      blob,
      type: blob.type || "audio/webm",
      createdAt: new Date().toISOString()
    } satisfies StoredAudioChunk);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function loadAudioChunks(sessionId: string): Promise<StoredAudioChunk[]> {
  const db = await openAudioDb();
  const chunks = await new Promise<StoredAudioChunk[]>((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const index = tx.objectStore(storeName).index("sessionId");
    const request = index.getAll(sessionId);
    request.onsuccess = () => resolve(request.result as StoredAudioChunk[]);
    request.onerror = () => reject(request.error);
  });
  db.close();
  return chunks.sort((a, b) => a.index - b.index);
}

export async function clearAudioChunks(sessionId: string): Promise<void> {
  const db = await openAudioDb();
  const chunks = await loadAudioChunks(sessionId);
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    chunks.forEach((chunk) => store.delete(chunk.key));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function createAudioUrl(sessionId: string): Promise<{ url: string; type: string; size: number } | null> {
  const chunks = await loadAudioChunks(sessionId);
  if (chunks.length === 0) return null;
  const type = chunks.find((chunk) => chunk.type)?.type ?? "audio/webm";
  const blob = new Blob(
    chunks.map((chunk) => chunk.blob),
    { type }
  );
  return { url: URL.createObjectURL(blob), type, size: blob.size };
}
