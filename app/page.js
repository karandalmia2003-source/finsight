"use client";

import { useEffect, useState, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import Dashboard from "../components/Dashboard";
import Brief from "../components/Brief";
import StressTest from "../components/StressTest";
import SurpriseTable from "../components/SurpriseTable";
import CompareModal from "../components/CompareModal";
import ChatPanel from "../components/ChatPanel";
import MobileTabs from "../components/MobileTabs";
import { buildComparisonMetrics } from "../lib/compare";
import {
  getAllDocuments,
  saveDocument,
  deleteDocument,
  getChatHistory,
  saveChatHistory,
  getComparisons,
  saveComparisons,
} from "../lib/storage";

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      const base64 = String(result).split(",")[1] || "";
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function Page() {
  const [documents, setDocuments] = useState([]);
  const [activeDocId, setActiveDocId] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isChatSending, setIsChatSending] = useState(false);
  const [error, setError] = useState(null);
  const [mobileTab, setMobileTab] = useState("dashboard");
  const [hydrated, setHydrated] = useState(false);

  // Stress-test + earnings-surprise loading/error state, keyed by document id
  // (since several documents could each have a check in flight).
  const [stressState, setStressState] = useState({});
  const [surpriseState, setSurpriseState] = useState({});

  // Cross-document comparison
  const [comparisons, setComparisons] = useState([]);
  const [showCompare, setShowCompare] = useState(false);
  const [compareResult, setCompareResult] = useState(null);
  const [isComparing, setIsComparing] = useState(false);
  const [compareError, setCompareError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [docs, history, savedComparisons] = await Promise.all([
          getAllDocuments(),
          getChatHistory(),
          getComparisons(),
        ]);
        setDocuments(docs);
        setChatMessages(history || []);
        setComparisons(savedComparisons || []);
        if (docs.length > 0) setActiveDocId(docs[docs.length - 1].id);
      } catch (e) {
        console.error("Failed to load session from storage", e);
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  const activeDoc = documents.find((d) => d.id === activeDocId) || null;

  // Earnings surprise detector: an additional Claude call (web search
  // enabled) that runs right after a document finishes processing, and can
  // also be re-run manually from the SurpriseTable panel.
  const runSurprise = useCallback(async (doc) => {
    const docId = doc.id;
    setSurpriseState((prev) => ({ ...prev, [docId]: { isRunning: true, error: null } }));
    try {
      const res = await fetch("/api/surprise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ extracted: doc.extracted }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to run earnings surprise check.");

      const updatedDoc = { ...doc, surprise: { ...data, generatedAt: new Date().toISOString() } };
      setDocuments((prev) => prev.map((d) => (d.id === docId ? updatedDoc : d)));
      await saveDocument(updatedDoc);
      setSurpriseState((prev) => ({ ...prev, [docId]: { isRunning: false, error: null } }));
    } catch (e) {
      setSurpriseState((prev) => ({
        ...prev,
        [docId]: { isRunning: false, error: e.message || "Something went wrong." },
      }));
    }
  }, []);

  const handleUpload = useCallback(
    async (file) => {
      setError(null);
      if (file.type !== "application/pdf") {
        setError("Only PDF files are supported.");
        return;
      }
      const MAX_BYTES = 30 * 1024 * 1024;
      if (file.size > MAX_BYTES) {
        setError("File is too large (max 30MB).");
        return;
      }

      setIsAnalyzing(true);
      try {
        const base64 = await fileToBase64(file);
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ base64, filename: file.name }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to analyze document.");

        const doc = {
          id: crypto.randomUUID(),
          name: file.name,
          uploadedAt: new Date().toISOString(),
          extracted: data.extracted,
          brief: data.brief,
          stressTests: [],
          surprise: null,
        };

        await saveDocument(doc);
        setDocuments((prev) => [...prev, doc]);
        setActiveDocId(doc.id);

        // Fire-and-forget: don't block the upload flow on the (slower,
        // web-search-backed) surprise check.
        runSurprise(doc);
      } catch (e) {
        setError(e.message || "Something went wrong analyzing this document.");
      } finally {
        setIsAnalyzing(false);
      }
    },
    [runSurprise]
  );

  const handleDelete = useCallback(
    async (id) => {
      await deleteDocument(id);
      setDocuments((prev) => {
        const next = prev.filter((d) => d.id !== id);
        if (activeDocId === id) {
          setActiveDocId(next.length > 0 ? next[next.length - 1].id : null);
        }
        return next;
      });
    },
    [activeDocId]
  );

  const handleSend = useCallback(
    async (text) => {
      setError(null);
      const userMsg = { role: "user", content: text };
      const nextMessages = [...chatMessages, userMsg];
      setChatMessages(nextMessages);
      setIsChatSending(true);
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: nextMessages, documents }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to get a response.");

        const assistantMsg = {
          role: "assistant",
          content: data.content,
          chart: data.type === "chart" ? data.chart : undefined,
        };
        const finalMessages = [...nextMessages, assistantMsg];
        setChatMessages(finalMessages);
        await saveChatHistory(finalMessages);
      } catch (e) {
        const errMsg = { role: "assistant", content: e.message || "Something went wrong.", isError: true };
        const finalMessages = [...nextMessages, errMsg];
        setChatMessages(finalMessages);
        await saveChatHistory(finalMessages);
      } finally {
        setIsChatSending(false);
      }
    },
    [chatMessages, documents]
  );

  // Assumption stress-tester: appends each run to the active document's own
  // stressTests history and persists it alongside the document record.
  const handleRunStressTest = useCallback(
    async (assumption) => {
      if (!activeDoc) return;
      const doc = activeDoc;
      const docId = doc.id;
      setStressState((prev) => ({ ...prev, [docId]: { isRunning: true, error: null } }));
      try {
        const res = await fetch("/api/stress-test", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ assumption, extracted: doc.extracted, brief: doc.brief }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to run stress test.");

        const entry = {
          id: crypto.randomUUID(),
          assumption,
          result: data,
          createdAt: new Date().toISOString(),
        };
        const updatedDoc = { ...doc, stressTests: [...(doc.stressTests || []), entry] };
        setDocuments((prev) => prev.map((d) => (d.id === docId ? updatedDoc : d)));
        await saveDocument(updatedDoc);
        setStressState((prev) => ({ ...prev, [docId]: { isRunning: false, error: null } }));
      } catch (e) {
        setStressState((prev) => ({
          ...prev,
          [docId]: { isRunning: false, error: e.message || "Something went wrong." },
        }));
      }
    },
    [activeDoc]
  );

  // Cross-document comparison: deltas are computed deterministically in
  // lib/compare.js; Claude only supplies the one-line "what drove this"
  // commentary per metric. Results persist to a "comparisons" list in
  // IndexedDB alongside the existing document data.
  const handleCompare = useCallback(
    async (idA, idB) => {
      const docA = documents.find((d) => d.id === idA);
      const docB = documents.find((d) => d.id === idB);
      if (!docA || !docB) return;

      setIsComparing(true);
      setCompareError(null);
      try {
        const metrics = buildComparisonMetrics(docA, docB);
        const res = await fetch("/api/compare", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            metrics,
            docA: { name: docA.name, extracted: docA.extracted },
            docB: { name: docB.name, extracted: docB.extracted },
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to compare documents.");

        const entry = {
          id: crypto.randomUUID(),
          idA,
          idB,
          nameA: docA.name,
          nameB: docB.name,
          metrics,
          commentary: data.commentary || [],
          generatedAt: new Date().toISOString(),
        };
        setCompareResult(entry);
        const nextComparisons = [...comparisons, entry];
        setComparisons(nextComparisons);
        await saveComparisons(nextComparisons);
      } catch (e) {
        setCompareError(e.message || "Something went wrong comparing these documents.");
      } finally {
        setIsComparing(false);
      }
    },
    [documents, comparisons]
  );

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        documents={documents}
        activeDocId={activeDocId}
        onSelect={setActiveDocId}
        onUpload={handleUpload}
        onDelete={handleDelete}
        onCompareClick={() => {
          setCompareError(null);
          setShowCompare(true);
        }}
        isAnalyzing={isAnalyzing}
        error={error}
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        <MobileTabs value={mobileTab} onChange={setMobileTab} />

        <div className="flex-1 overflow-y-auto">
          {!hydrated ? (
            <div className="p-6 text-sm text-subtle">Loading session…</div>
          ) : !activeDoc ? (
            <EmptyState />
          ) : (
            <div className="p-4 md:p-6 space-y-6 max-w-6xl mx-auto">
              <div className={mobileTab === "dashboard" ? "block" : "hidden md:block"}>
                <Dashboard documents={documents} activeDoc={activeDoc} />
              </div>

              <SurpriseTable
                doc={activeDoc}
                onRun={() => runSurprise(activeDoc)}
                isRunning={surpriseState[activeDoc.id]?.isRunning || false}
                error={surpriseState[activeDoc.id]?.error || null}
              />

              <div className={mobileTab === "brief" ? "block" : "hidden md:block"}>
                <Brief brief={activeDoc.brief} docName={activeDoc.name} />
              </div>

              <StressTest
                doc={activeDoc}
                onRun={handleRunStressTest}
                isRunning={stressState[activeDoc.id]?.isRunning || false}
                error={stressState[activeDoc.id]?.error || null}
              />

              <ChatPanel
                messages={chatMessages}
                onSend={handleSend}
                disabled={documents.length === 0}
                isSending={isChatSending}
              />
            </div>
          )}
        </div>
      </main>

      {showCompare && (
        <CompareModal
          documents={documents}
          onClose={() => setShowCompare(false)}
          onRunCompare={handleCompare}
          isComparing={isComparing}
          result={compareResult}
          error={compareError}
        />
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center p-8">
      <h2 className="text-lg font-semibold text-ink mb-2">Upload your first financial document</h2>
      <p className="text-sm text-subtle max-w-sm">
        Drop a 10-K, earnings release, P&amp;L, or investor update into the sidebar to generate a
        structured brief and a live dashboard.
      </p>
    </div>
  );
}
