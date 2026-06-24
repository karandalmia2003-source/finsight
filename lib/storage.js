// IndexedDB-backed persistence so uploaded documents, extracted data, and chat
// history survive a page refresh. Runs client-side only.

const DB_NAME = "finsight-db";
const DB_VERSION = 1;
const DOCS_STORE = "documents";
const META_STORE = "meta";

function openDB() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB is not available in this environment."));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(DOCS_STORE)) {
        db.createObjectStore(DOCS_STORE, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(META_STORE)) {
        db.createObjectStore(META_STORE, { keyPath: "key" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function getAllDocuments() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DOCS_STORE, "readonly");
    const req = tx.objectStore(DOCS_STORE).getAll();
    req.onsuccess = () =>
      resolve(
        (req.result || []).sort(
          (a, b) => new Date(a.uploadedAt) - new Date(b.uploadedAt)
        )
      );
    req.onerror = () => reject(req.error);
  });
}

export async function saveDocument(doc) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DOCS_STORE, "readwrite");
    tx.objectStore(DOCS_STORE).put(doc);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function deleteDocument(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DOCS_STORE, "readwrite");
    tx.objectStore(DOCS_STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getChatHistory() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(META_STORE, "readonly");
    const req = tx.objectStore(META_STORE).get("chatHistory");
    req.onsuccess = () => resolve(req.result ? req.result.value : []);
    req.onerror = () => reject(req.error);
  });
}

export async function saveChatHistory(messages) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(META_STORE, "readwrite");
    tx.objectStore(META_STORE).put({ key: "chatHistory", value: messages });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// Cross-document comparisons span two documents, so they don't naturally
// belong to a single document record. Stored as a single list under the
// generic meta store instead, the same pattern already used for chat
// history. Stress-test results, by contrast, belong to one document and are
// stored as a field directly on that document's own record (just call
// saveDocument again after appending to doc.stressTests).
export async function getComparisons() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(META_STORE, "readonly");
    const req = tx.objectStore(META_STORE).get("comparisons");
    req.onsuccess = () => resolve(req.result ? req.result.value : []);
    req.onerror = () => reject(req.error);
  });
}

export async function saveComparisons(list) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(META_STORE, "readwrite");
    tx.objectStore(META_STORE).put({ key: "comparisons", value: list });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function clearSession() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([DOCS_STORE, META_STORE], "readwrite");
    tx.objectStore(DOCS_STORE).clear();
    tx.objectStore(META_STORE).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
