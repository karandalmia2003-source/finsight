"use client";

import { RISK_COLORS, RISK_LABELS } from "../../lib/colors";

// Hand-rolled semicircle gauge (Recharts has no native gauge primitive).
// Three colored zones (low / medium / high) with a needle positioned by riskScore (0-100).
export default function RiskGauge({ riskScore, riskLevel }) {
  const score = typeof riskScore === "number" ? Math.max(0, Math.min(100, riskScore)) : 50;
  const level = riskLevel || (score < 33 ? "low" : score < 66 ? "medium" : "high");

  const cx = 100;
  const cy = 100;
  const r = 80;

  const polarToCartesian = (angleDeg) => {
    const angleRad = (Math.PI / 180) * angleDeg;
    return { x: cx + r * Math.cos(angleRad), y: cy - r * Math.sin(angleRad) };
  };

  const arcPath = (startDeg, endDeg) => {
    const start = polarToCartesian(startDeg);
    const end = polarToCartesian(endDeg);
    return `M ${start.x} ${start.y} A ${r} ${r} 0 0 0 ${end.x} ${end.y}`;
  };

  // Semicircle spans 180deg (left) to 0deg (right).
  const zones = [
    { from: 180, to: 120, color: RISK_COLORS.low },
    { from: 120, to: 60, color: RISK_COLORS.medium },
    { from: 60, to: 0, color: RISK_COLORS.high },
  ];

  const needleAngle = 180 - (score / 100) * 180;
  const needleTip = polarToCartesian(needleAngle);

  return (
    <div className="bg-white border border-border rounded-xl shadow-card p-4 flex flex-col items-center">
      <h3 className="text-sm font-semibold text-ink self-start mb-1">Risk Meter</h3>
      <svg viewBox="0 0 200 120" className="w-full max-w-[220px]">
        {zones.map((z, i) => (
          <path key={i} d={arcPath(z.from, z.to)} stroke={z.color} strokeWidth={16} fill="none" strokeLinecap="butt" />
        ))}
        <line x1={cx} y1={cy} x2={needleTip.x} y2={needleTip.y} stroke="#0A0A0A" strokeWidth={3} strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={5} fill="#0A0A0A" />
      </svg>
      <div className="text-center -mt-2">
        <div className="text-2xl font-bold text-ink">{Math.round(score)}</div>
        <div className="text-sm font-medium" style={{ color: RISK_COLORS[level] }}>
          {RISK_LABELS[level] || "Unknown"}
        </div>
      </div>
    </div>
  );
}
