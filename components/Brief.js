export default function Brief({ brief, docName }) {
  if (!brief) {
    return (
      <div className="bg-white border border-border rounded-xl shadow-card p-6 text-sm text-subtle">
        No brief available for this document.
      </div>
    );
  }

  return (
    <div className="bg-white border border-border rounded-xl shadow-card p-5 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-ink">Structured Brief</h2>
        {docName && <span className="text-xs text-subtle truncate max-w-[50%]">{docName}</span>}
      </div>

      <Section title="1. Snapshot">
        <p className="text-sm text-ink leading-relaxed">{brief.snapshot}</p>
      </Section>

      <Section title="2. Risks">
        <ol className="space-y-2">
          {(brief.risks || []).map((r, i) => (
            <li key={i} className="flex gap-2 text-sm text-ink leading-relaxed">
              <span className="font-semibold text-accent">{i + 1}.</span>
              <span>{r}</span>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="3. Trends">
        <p className="text-sm text-ink leading-relaxed">{brief.trends}</p>
      </Section>

      <Section title="4. CFO Questions">
        <ol className="space-y-2">
          {(brief.cfoQuestions || []).map((q, i) => (
            <li key={i} className="flex gap-2 text-sm text-ink leading-relaxed">
              <span className="font-semibold text-accent">{i + 1}.</span>
              <span>{q}</span>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="5. Bottom Line">
        <div className="bg-surface border border-border rounded-lg p-4">
          <p className="text-sm text-ink leading-relaxed">{brief.bottomLine}</p>
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-subtle uppercase tracking-wide mb-2">{title}</h3>
      {children}
    </div>
  );
}
