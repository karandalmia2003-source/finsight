export default function MobileTabs({ value, onChange }) {
  const tabs = [
    { id: "dashboard", label: "Dashboard" },
    { id: "brief", label: "Brief" },
  ];

  return (
    <div className="md:hidden flex border-b border-border bg-white sticky top-0 z-10">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            value === t.id ? "text-accent border-b-2 border-accent" : "text-subtle border-b-2 border-transparent"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
