import MetricCard from "./MetricCard";
import RiskGauge from "./charts/RiskGauge";
import RevenueLineChart from "./charts/RevenueLineChart";
import ProfitRevenueBar from "./charts/ProfitRevenueBar";
import ExpensePie from "./charts/ExpensePie";
import GrossMarginLine from "./charts/GrossMarginLine";
import YoYBarChart from "./charts/YoYBarChart";
import {
  buildRevenueSeries,
  buildProfitRevenueData,
  buildGrossMarginData,
  buildYoYData,
  buildExpenseData,
} from "../lib/aggregate";
import { formatCurrency, formatPct } from "../lib/format";

export default function Dashboard({ documents, activeDoc }) {
  if (!activeDoc) return null;
  const m = activeDoc.extracted?.metrics || {};
  const currency = activeDoc.extracted?.currency || "USD";

  const revenueSeries = buildRevenueSeries(documents);
  const profitRevenueData = buildProfitRevenueData(documents);
  const grossMarginData = buildGrossMarginData(documents);
  const yoyData = buildYoYData(documents);
  const expenseData = buildExpenseData(activeDoc);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <MetricCard label="Gross Margin" value={formatPct(m.grossMarginPct)} accent />
        <MetricCard label="YoY Revenue Growth" value={formatPct(m.yoyRevenueGrowthPct, { signed: true })} />
        <MetricCard label="Net Income" value={formatCurrency(m.netIncome, currency)} />
        <MetricCard label="Operating Expenses" value={formatCurrency(m.operatingExpenses, currency)} />
        <div className="col-span-2 sm:col-span-1">
          <RiskGauge riskScore={activeDoc.brief?.riskScore} riskLevel={activeDoc.brief?.riskLevel} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RevenueLineChart data={revenueSeries} currency={currency} />
        <ProfitRevenueBar data={profitRevenueData} currency={currency} />
        <ExpensePie data={expenseData} currency={currency} docName={activeDoc.name} />
        <GrossMarginLine data={grossMarginData} />
        <div className="lg:col-span-2">
          <YoYBarChart data={yoyData} />
        </div>
      </div>
    </div>
  );
}
