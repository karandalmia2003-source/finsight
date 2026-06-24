"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { CHART_COLORS } from "../../lib/colors";
import { formatCompactNumber } from "../../lib/format";

// Renders a chart spec returned by the chat API inline inside a chat bubble.
// Expected shape: { chartType: "line"|"bar"|"pie", title, data, xKey, series:[{key,name,color}] }
export default function ChatChart({ chart }) {
  if (!chart || !chart.data || chart.data.length === 0) return null;

  const series = chart.series && chart.series.length > 0
    ? chart.series
    : [{ key: "value", name: chart.title || "Value", color: CHART_COLORS[0] }];

  return (
    <div className="bg-white border border-border rounded-lg shadow-card p-3 mt-2 w-full max-w-md">
      {chart.title && <h4 className="text-xs font-semibold text-ink mb-2">{chart.title}</h4>}
      <ResponsiveContainer width="100%" height={200}>
        {chart.chartType === "pie" ? (
          <PieChart>
            <Pie data={chart.data} dataKey="value" nameKey="name" innerRadius={40} outerRadius={70} paddingAngle={2}>
              {chart.data.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(v, name) => [formatCompactNumber(v), name]} contentStyle={{ borderRadius: 8, fontSize: 11 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
          </PieChart>
        ) : chart.chartType === "bar" ? (
          <BarChart data={chart.data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid stroke="#E5E7EB" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey={chart.xKey} tick={{ fontSize: 11, fill: "#6B7280" }} tickLine={false} axisLine={{ stroke: "#E5E7EB" }} />
            <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} tickLine={false} axisLine={false} tickFormatter={(v) => formatCompactNumber(v)} />
            <Tooltip formatter={(v, name) => [formatCompactNumber(v), name]} contentStyle={{ borderRadius: 8, fontSize: 11 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {series.map((s, i) => (
              <Bar key={s.key} dataKey={s.key} name={s.name} fill={s.color || CHART_COLORS[i % CHART_COLORS.length]} radius={[3, 3, 0, 0]} />
            ))}
          </BarChart>
        ) : (
          <LineChart data={chart.data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid stroke="#E5E7EB" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey={chart.xKey} tick={{ fontSize: 11, fill: "#6B7280" }} tickLine={false} axisLine={{ stroke: "#E5E7EB" }} />
            <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} tickLine={false} axisLine={false} tickFormatter={(v) => formatCompactNumber(v)} />
            <Tooltip formatter={(v, name) => [formatCompactNumber(v), name]} contentStyle={{ borderRadius: 8, fontSize: 11 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {series.map((s, i) => (
              <Line key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke={s.color || CHART_COLORS[i % CHART_COLORS.length]} strokeWidth={2} dot={{ r: 2.5 }} />
            ))}
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
