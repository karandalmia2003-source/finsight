export default function MetricCard({ label, value, sublabel, accent = false }) {
  return (
    <div className="bg-white border border-border rounded-xl shadow-card p-4 flex flex-col gap-1 min-w-0">
      <span className="text-xs font-medium text-subtle uppercase tracking-wide truncate">{label}</span>
      <span className={`text-2xl font-bold truncate ${accent ? "text-accent" : "text-ink"}`}>{value}</span>
      {sublabel && <span className="text-xs text-subtle truncate">{sublabel}</span>}
    </div>
  );
}
