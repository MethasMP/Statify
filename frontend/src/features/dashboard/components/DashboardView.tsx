"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from "recharts";
import {
  AlertTriangle, TrendingUp, TrendingDown, Activity,
  Search, ArrowRight, Check, X, ExternalLink, Download,
} from "lucide-react";
import { ingestionApi } from "../../ingestion/api/ingestionApi";
import type { Transaction, Anomaly, Category, Summary } from "../../ingestion/types";

const CAT_COLORS: Record<string, string> = {
  "1": "#ef4444", "2": "#f59e0b", "3": "#10b981",
  "4": "#3b82f6", "5": "#8b5cf6", "6": "#6366f1",
  "7": "#059669", "8": "#94a3b8",
};

// ── Summary Cards ──────────────────────────────────────────────────────────
function SummaryCards({ summary }: { summary: Summary }) {
  const cards = [
    {
      label: "Total Income",
      value: `+${summary.totalIncome.toLocaleString("th-TH", { minimumFractionDigits: 2 })}`,
      subtext: "THB",
      color: "text-safe",
      icon: <TrendingUp className="w-3.5 h-3.5" />,
      borderColor: "border-safe/20",
    },
    {
      label: "Total Expenses",
      value: `-${summary.totalExpense.toLocaleString("th-TH", { minimumFractionDigits: 2 })}`,
      subtext: "THB",
      color: "text-danger",
      icon: <TrendingDown className="w-3.5 h-3.5" />,
      borderColor: "border-danger/20",
    },
    {
      label: "Net Balance",
      value: (summary.netBalance >= 0 ? "+" : "") +
        summary.netBalance.toLocaleString("th-TH", { minimumFractionDigits: 2 }),
      subtext: "THB",
      color: summary.netBalance >= 0 ? "text-safe" : "text-danger",
      icon: <Activity className="w-3.5 h-3.5" />,
      borderColor: "border-accent/20",
    },
    {
      label: "Anomalies Found",
      value: String(summary.anomalyCount),
      subtext: summary.anomalyCount > 0 ? "Review recommended" : "All clear",
      color: summary.anomalyCount > 0 ? "text-warning" : "text-muted-foreground",
      icon: <AlertTriangle className="w-3.5 h-3.5" />,
      borderColor: summary.anomalyCount > 0 ? "border-warning/30" : "border-border",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border border border-border mb-10">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          className={`bg-background p-6 relative border-l border-border first:border-l-0 group`}
        >
          <div className={`absolute top-0 left-0 right-0 h-px ${card.borderColor} bg-gradient-to-r from-transparent via-current to-transparent`} />
          <div className={`flex items-center gap-2 mb-3 ${card.color} opacity-60`}>
            {card.icon}
            <span className="font-mono text-[8px] uppercase tracking-[0.3em]">{card.label}</span>
          </div>
          <div className={`font-mono text-xl font-black tabular-nums ${card.color}`}>
            {card.value}
          </div>
          <div className="font-mono text-[8px] text-muted-foreground/50 mt-1 uppercase tracking-wider">
            {card.subtext}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ── Category Donut ─────────────────────────────────────────────────────────
function CategoryDonut({
  summary, categories, onCategoryFilter,
}: {
  summary: Summary;
  categories: Category[];
  onCategoryFilter: (id: number | null) => void;
}) {
  const data = Object.entries(summary.byCategory).map(([catId, value]) => {
    const cat = categories.find(c => String(c.id) === catId);
    return { name: cat?.name ?? `Cat ${catId}`, value: Number(value), catId: Number(catId) };
  }).filter(d => d.value > 0);

  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="card-utilitarian h-80 flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-mono text-[9px] font-bold uppercase tracking-[0.3em] flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-accent" />
          Expense Breakdown
        </h2>
        <button
          onClick={() => onCategoryFilter(null)}
          className="font-mono text-[8px] text-muted-foreground hover:text-accent transition-colors uppercase"
        >
          [CLEAR]
        </button>
      </div>
      <div className="flex flex-1 min-h-0 gap-4">
        <div className="flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
                onClick={(d) => onCategoryFilter(d.catId)}
                style={{ cursor: "pointer" }}
              >
                {data.map((entry) => (
                  <Cell key={entry.catId} fill={CAT_COLORS[String(entry.catId)] ?? "#6366f1"} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: "#0d0d0d", border: "1px solid #262626", fontSize: "9px", fontFamily: "monospace", borderRadius: 0 }}
                itemStyle={{ color: "#00ff94" }}
                formatter={(v: number) => [`${v.toLocaleString()} THB`]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-col justify-center gap-1.5 w-28">
          {data.slice(0, 6).map(d => (
            <button
              key={d.catId}
              onClick={() => onCategoryFilter(d.catId)}
              className="flex items-center gap-1.5 text-left hover:opacity-80 transition-opacity"
            >
              <div className="w-2 h-2 flex-shrink-0 rounded-full" style={{ background: CAT_COLORS[String(d.catId)] }} />
              <span className="font-mono text-[8px] text-muted-foreground truncate">{d.name}</span>
              <span className="font-mono text-[8px] text-muted-foreground/50 ml-auto">
                {total > 0 ? ((d.value / total) * 100).toFixed(0) : 0}%
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Weekly Bar Chart ───────────────────────────────────────────────────────
function WeeklyBarChart({ transactions }: { transactions: Transaction[] }) {
  const weeklyData = useMemo(() => {
    const weeks: Record<string, { week: string; income: number; expense: number }> = {};
    transactions.forEach(t => {
      const d = new Date(t.txnDate);
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      const key = weekStart.toISOString().slice(0, 10);
      if (!weeks[key]) weeks[key] = { week: key.slice(5), income: 0, expense: 0 };
      if (t.amount > 0) weeks[key].income += t.amount;
      else weeks[key].expense += Math.abs(t.amount);
    });
    return Object.values(weeks).sort((a, b) => a.week.localeCompare(b.week));
  }, [transactions]);

  return (
    <div className="card-utilitarian h-80 flex flex-col">
      <h2 className="font-mono text-[9px] font-bold uppercase tracking-[0.3em] flex items-center gap-2 mb-4">
        <div className="w-1.5 h-1.5 bg-accent" />
        Income vs Expenses (Weekly)
      </h2>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={weeklyData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="1 3" stroke="#262626" />
            <XAxis dataKey="week" tick={{ fontSize: 8, fontFamily: "monospace", fill: "#a3a3a3" }} />
            <YAxis tick={{ fontSize: 8, fontFamily: "monospace", fill: "#a3a3a3" }} />
            <Tooltip
              contentStyle={{ backgroundColor: "#0d0d0d", border: "1px solid #262626", fontSize: "9px", fontFamily: "monospace", borderRadius: 0 }}
              formatter={(v: number) => [`${v.toLocaleString()} THB`]}
            />
            <Legend wrapperStyle={{ fontSize: "8px", fontFamily: "monospace" }} />
            <Bar dataKey="income" name="Income" fill="#00ff94" />
            <Bar dataKey="expense" name="Expense" fill="#ff0055" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ── Transaction Table ──────────────────────────────────────────────────────
function TransactionTable({
  transactions, categories, categoryFilter,
}: {
  transactions: Transaction[];
  categories: Category[];
  categoryFilter: number | null;
}) {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [amountMin, setAmountMin] = useState("");
  const [amountMax, setAmountMax] = useState("");
  const [anomalyOnly, setAnomalyOnly] = useState(false);

  const overrideMutation = useMutation({
    mutationFn: ({ txnId, catId }: { txnId: string; catId: number }) =>
      ingestionApi.overrideCategory(txnId, catId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["transactions"] }),
  });

  const filtered = useMemo(() => {
    let list = transactions;
    if (categoryFilter) list = list.filter(t => t.categoryId === categoryFilter);
    if (search) list = list.filter(t => t.description.toLowerCase().includes(search.toLowerCase()));
    if (amountMin) list = list.filter(t => Math.abs(t.amount) >= Number(amountMin));
    if (amountMax) list = list.filter(t => Math.abs(t.amount) <= Number(amountMax));
    return list;
  }, [transactions, categoryFilter, search, amountMin, amountMax]);

  return (
    <div>
      {/* Filter bar */}
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
          <input
            type="text"
            placeholder="SEARCH DESCRIPTION..."
            className="w-full bg-muted/20 border border-border pl-8 pr-3 py-1.5 text-[9px] font-mono focus:border-accent outline-none uppercase placeholder:opacity-30"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <input
          type="number"
          placeholder="MIN_AMT"
          className="w-24 bg-muted/20 border border-border px-2 py-1.5 text-[9px] font-mono focus:border-accent outline-none"
          value={amountMin}
          onChange={e => setAmountMin(e.target.value)}
        />
        <input
          type="number"
          placeholder="MAX_AMT"
          className="w-24 bg-muted/20 border border-border px-2 py-1.5 text-[9px] font-mono focus:border-accent outline-none"
          value={amountMax}
          onChange={e => setAmountMax(e.target.value)}
        />
        <div className="font-mono text-[8px] text-muted-foreground ml-auto">
          {filtered.length} / {transactions.length} rows
        </div>
      </div>

      <div className="border border-border">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border bg-muted/20">
              {["Date", "Description", "Amount (THB)", "Category"].map(h => (
                <th key={h} className="p-3 font-mono text-[8px] uppercase font-bold text-muted-foreground tracking-widest">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="font-mono text-[9px] divide-y divide-border/40">
            <AnimatePresence mode="popLayout">
              {filtered.map((txn, idx) => {
                const cat = categories.find(c => c.id === txn.categoryId);
                return (
                  <motion.tr
                    key={txn.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: Math.min(idx * 0.005, 0.15) }}
                    className="hover:bg-accent/5 group/row transition-colors"
                  >
                    <td className="p-3 text-muted-foreground/60 whitespace-nowrap">{txn.txnDate}</td>
                    <td className="p-3 max-w-[240px]">
                      <span className="truncate block group-hover/row:text-accent transition-colors">
                        {txn.description}
                      </span>
                      {txn.override && (
                        <span className="text-[7px] text-warning/60 uppercase tracking-widest">overridden</span>
                      )}
                    </td>
                    <td className={`p-3 font-bold tabular-nums text-right ${txn.amount < 0 ? "text-danger" : "text-safe"}`}>
                      {txn.amount < 0 ? "" : "+"}{txn.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3">
                      {editingId === txn.id ? (
                        <div className="flex gap-1 items-center">
                          <select
                            autoFocus
                            className="bg-background border border-accent/40 text-[8px] px-1 py-0.5 outline-none text-accent"
                            defaultValue={txn.categoryId ?? ""}
                            onChange={e => {
                              overrideMutation.mutate({ txnId: txn.id, catId: Number(e.target.value) });
                              setEditingId(null);
                            }}
                          >
                            {categories.map(c => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                          <button onClick={() => setEditingId(null)} className="text-muted-foreground hover:text-danger">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setEditingId(txn.id)}
                          className="flex items-center gap-1.5 opacity-0 group-hover/row:opacity-100 transition-opacity"
                        >
                          <span
                            className="px-2 py-0.5 text-[7px] uppercase font-bold tracking-wider"
                            style={{ backgroundColor: cat ? cat.color + "22" : "#26262680", color: cat?.color ?? "#a3a3a3" }}
                          >
                            {cat?.name ?? "UNCLASSIFIED"}
                          </span>
                          <ArrowRight className="w-2.5 h-2.5 text-muted-foreground" />
                        </button>
                      )}
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-16 text-center font-mono text-[9px] text-muted-foreground/40 uppercase tracking-widest">
            No transactions match current filters.
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────
export default function DashboardView({ id }: { id: string }) {
  const [categoryFilter, setCategoryFilter] = useState<number | null>(null);

  const { data: summary } = useSuspenseQuery<Summary>({
    queryKey: ["summary", id],
    queryFn: () => ingestionApi.getSummary(id),
  });
  const { data: transactions } = useSuspenseQuery<Transaction[]>({
    queryKey: ["transactions", id, categoryFilter],
    queryFn: () => ingestionApi.getTransactions(id, categoryFilter ? { categoryId: categoryFilter } : undefined),
  });
  const { data: categories } = useSuspenseQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: ingestionApi.getCategories,
  });

  return (
    <div className="max-w-7xl mx-auto p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="font-mono text-[8px] text-muted-foreground/50 uppercase tracking-[0.4em] mb-1">
            FINANCIAL_SUMMARY
          </p>
          <h1 className="font-mono text-xl font-black uppercase tracking-tight">
            Dashboard <span className="text-accent text-sm font-normal">#{id.slice(0, 8)}</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={`/dashboard/${id}/anomalies`}
            className="font-mono text-[8px] border border-warning/40 text-warning/70 hover:border-warning hover:text-warning px-4 py-2 transition-colors flex items-center gap-2 uppercase tracking-widest"
          >
            <AlertTriangle className="w-3 h-3" />
            Review Anomalies
            {summary.anomalyCount > 0 && (
              <span className="bg-warning text-black text-[7px] font-bold px-1 rounded-full">
                {summary.anomalyCount}
              </span>
            )}
          </a>
          <a
            href={`/api/v1/uploads/${id}/report`}
            target="_blank"
            className="font-mono text-[8px] bg-accent text-black hover:bg-white px-4 py-2 transition-colors flex items-center gap-2 uppercase tracking-widest font-bold"
          >
            <Download className="w-3 h-3" />
            Export PDF
          </a>
        </div>
      </div>

      {/* Summary cards */}
      <SummaryCards summary={summary} />

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        <CategoryDonut
          summary={summary}
          categories={categories}
          onCategoryFilter={setCategoryFilter}
        />
        <WeeklyBarChart transactions={transactions} />
      </div>

      {/* Transaction Table */}
      <div className="mb-4 flex items-center gap-3">
        <h2 className="font-mono text-[9px] font-bold uppercase tracking-[0.3em] flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-accent" />
          Transactions
        </h2>
        {categoryFilter && (
          <span className="font-mono text-[8px] text-accent/70 border border-accent/30 px-2 py-0.5">
            {categories.find(c => c.id === categoryFilter)?.name ?? "Filter Active"}
          </span>
        )}
      </div>
      <TransactionTable
        transactions={transactions}
        categories={categories}
        categoryFilter={categoryFilter}
      />
    </div>
  );
}
