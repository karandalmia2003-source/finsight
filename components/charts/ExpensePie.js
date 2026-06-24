"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { CHART_COLORS } from "../../lib/colors";
import { formatCompactNumber } from "../../lib/format";
import { EmptyChart } from "./RevenueLineChart";

export default function ExpensePie({ data, currency, docName }) {
  if (!data || data.length === 0) {
    return <EmptyChart title="Expense Breakdown" />;
  }

  return (
    <div className="bg-white border border-border rounded-xl shadow-card p-4">
      <h3 className="text-sm font-semibold text-ink mb-1">Expense Breakdown</h3>
      {docName && <p className="text-xs text-subtle mb-2">{docName}</p>}
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={2}>
            {data.map((_, i) => (
              <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(v, name) => [formatCompactNumber(v) + (currency ? ` ${currency}` : ""), name]}
            contentStyle={{ borderRadius: 8, borderColor: "#E5E7EB", fontSize: 12 }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
