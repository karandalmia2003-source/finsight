// Server-backed persistence, scoped to the signed-in user. This used to be
// a pure-client IndexedDB module; the exported function names and shapes
// are kept identical so the rest of the app (app/page.js in particular)
// didn't need to change. Under the hood every call now hits a Postgres-
// backed API route, so documents, chat history, and comparisons survive
// across devices and browsers, not just the uploading browser.

async function jsonFetch(url, opts) {
    const res = await fetch(url, {
          ...opts,
          headers: { "Content-Type": "application/json", ...(opts?.headers || {}) },
    });

  if (res.status === 401) {
        if (typeof window !== "undefined") window.location.href = "/login";
        throw new Error("Not authenticated.");
  }

  const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Request failed.");
    return data;
}

export async function getAllDocuments() {
    const { documents } = await jsonFetch("/api/documents");
    return documents || [];
}

export async function saveDocument(doc) {
    await jsonFetch("/api/documents", {
          method: "POST",
          body: JSON.stringify({ document: doc }),
    });
}

export async function deleteDocument(id) {
    await jsonFetch(`/api/documents/${id}`, { method: "DELETE" });
}

export async function getChatHistory() {
    const { value } = await jsonFetch("/api/meta/chatHistory");
    return value || [];
}

export async function saveChatHistory(messages) {
    await jsonFetch("/api/meta/chatHistory", {
          method: "PUT",
          body: JSON.stringify({ value: messages }),
    });
}

// Cross-document comparisons span any number of documents, so they don't
// naturally belong to a single document record. Stored as a single list
// under the generic meta store instead, the same pattern used for chat
// history. Stress-test results, by contrast, belong to one document and
// are stored as a field directly on that document's own record (just call
// saveDocument again after appending to doc.stressTests).
export async function getComparisons() {
    const { value } = await jsonFetch("/api/meta/comparisons");
    return value || [];
}

export async function saveComparisons(list) {
    await jsonFetch("/api/meta/comparisons", {
          method: "PUT",
          body: JSON.stringify({ value: list }),
    });
}

// No longer meaningful server-side (there's no "session" to clear — data
// belongs to the account until the user deletes it) but kept as a no-op so
// any existing call sites don't break.
export async function clearSession() {}
