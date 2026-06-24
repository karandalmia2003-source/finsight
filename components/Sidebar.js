"use client";

import { useRef, useState } from "react";
import { UploadIcon, TrashIcon, DocumentIcon } from "./icons";
import { RISK_COLORS } from "../lib/colors";
import { formatDate } from "../lib/format";

export default function Sidebar({
    documents,
    activeDocId,
    onSelect,
    onUpload,
    onDelete,
    onCompareClick,
    isAnalyzing,
    error,
    userEmail,
    onLogout,
}) {
    const inputRef = useRef(null);
    const [dragOver, setDragOver] = useState(false);

  const handleFiles = (files) => {
        const file = files?.[0];
        if (file) onUpload(file);
  };

  return (
        <aside className="w-full md:w-72 flex-shrink-0 bg-surface border-r border-border h-full flex flex-col">
          <div className="p-4 border-b border-border">
            <h1 className="text-lg font-bold text-ink tracking-tight">FinSight</h1>
          <p className="text-xs text-subtle mt-0.5">AI financial document analyzer</p>
    </div>

      <div className="p-3">
            <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
                        e.preventDefault();
                        setDragOver(false);
                        handleFiles(e.dataTransfer.files);
          }}
          onClick={() => inputRef.current?.click()}
          className={`cursor-pointer rounded-lg border-2 border-dashed p-4 flex flex-col items-center gap-1.5 text-center transition-colors ${
                        dragOver ? "border-accent bg-blue-50" : "border-border bg-white"
          }`}
        >
          <UploadIcon className="w-5 h-5 text-accent" />
                    <span className="text-xs font-medium text-ink">
        {isAnalyzing ? "Analyzing..." : "Upload financial PDF"}
</span>
          <span className="text-[11px] text-subtle">10-K, earnings release, P&amp;L, investor update</span>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            disabled={isAnalyzing}
            onChange={(e) => handleFiles(e.target.files)}
          />
              </div>
{error && (
            <p className="text-[11px] text-risk-high mt-2 leading-snug">{error}</p>
         )}
</div>

      <div className="px-3 pb-2">
          <h2 className="text-[11px] font-semibold text-subtle uppercase tracking-wide px-1">
            Document Library ({documents.length})
  </h2>
  </div>

{documents.length >= 2 && (
          <div className="px-3 pb-2">
            <button
             onClick={onCompareClick}
             className="w-full text-xs font-semibold text-accent border border-accent/30 bg-blue-50 hover:bg-blue-100 rounded-lg px-3 py-2 transition-colors"
           >
                           Compare Documents
               </button>
               </div>
       )}

      <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-2">
      {documents.length === 0 && !isAnalyzing && (
                  <p className="text-xs text-subtle px-1">No documents uploaded yet.</p>
        )}
{documents.map((doc) => (
            <div
                           key={doc.id}
            onClick={() => onSelect(doc.id)}
            className={`group relative rounded-lg border p-3 cursor-pointer transition-colors ${
                            doc.id === activeDocId
                              ? "border-accent bg-blue-50"
                              : "border-border bg-white hover:border-accent/50"
            }`}
          >
            <div className="flex items-start gap-2">
                          <DocumentIcon className="w-4 h-4 text-subtle mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-ink truncate">{doc.name}</p>
                <p className="text-[11px] text-subtle">{formatDate(doc.uploadedAt)}</p>
{doc.brief?.riskLevel && (
                    <span
                     className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                     style={{
                                             color: RISK_COLORS[doc.brief.riskLevel],
                                             backgroundColor: `${RISK_COLORS[doc.brief.riskLevel]}1A`,
                     }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: RISK_COLORS[doc.brief.riskLevel] }}
                    />
{doc.brief.riskLevel.toUpperCase()}
</span>
                )}
</div>
              <button
                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(doc.id);
                }}
                className="opacity-0 group-hover:opacity-100 text-subtle hover:text-risk-high transition-opacity flex-shrink-0"
                aria-label="Delete document"
              >
                                  <TrashIcon className="w-3.5 h-3.5" />
                  </button>
                  </div>
                  </div>
        ))}
{isAnalyzing && (
            <div className="rounded-lg border border-border bg-white p-3 animate-pulse">
              <p className="text-sm text-subtle">Analyzing document...</p>
  </div>
         )}
</div>

{(userEmail || onLogout) && (
          <div className="border-t border-border p-3 flex items-center justify-between gap-2">
            <p className="text-[11px] text-subtle truncate">{userEmail}</p>
           <button
             onClick={onLogout}
             className="text-[11px] font-medium text-subtle hover:text-risk-high transition-colors flex-shrink-0"
           >
                           Sign out
               </button>
               </div>
       )}
</aside>
  );
}
