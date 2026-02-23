"use client";

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, UploadCloud, Zap, TrendingUp, AlertTriangle, ChevronRight } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────
interface ParsedRow {
  date: string;
  description: string;
  amount: number;
}

interface CategorySummary {
  name: string;
  total: number;
  count: number;
  percent: number;
}

interface HealthReport {
  totalSpend: number;
  totalIncome: number;
  topCategories: CategorySummary[];
  biggestExpense: ParsedRow | null;
  anomalies: ParsedRow[];
  transactionCount: number;
}

// ── CSV Parser ────────────────────────────────────────────────────────────
const CATEGORY_RULES: Record<string, string[]> = {
  "FOOD & DINING":    ["coffee", "cafe", "restaurant", "food", "eat", "pizza", "burger", "sushi", "grab food", "mcdonald", "kfc"],
  "TRANSPORT":        ["grab", "uber", "taxi", "fuel", "petrol", "bts", "mrt", "toll", "parking", "gas station"],
  "SHOPPING":         ["shopee", "lazada", "amazon", "central", "mall", "fashion", "clothing", "nike", "adidas"],
  "UTILITIES":        ["electric", "water", "internet", "true", "ais", "dtac", "telecom", "phone bill", "utility"],
  "HEALTH":           ["hospital", "clinic", "pharmacy", "doctor", "dental", "medicine", "health"],
  "ENTERTAINMENT":    ["netflix", "spotify", "youtube", "cinema", "movie", "game", "steam", "apple music"],
  "TRANSFER":         ["transfer", "โอน", "ชำระ", "payment", "pay to"],
};

function categorize(description: string): string {
  const lower = description.toLowerCase();
  for (const [cat, keywords] of Object.entries(CATEGORY_RULES)) {
    if (keywords.some(k => lower.includes(k))) return cat;
  }
  return "OTHER";
}

function parseCSV(raw: string): ParsedRow[] {
  const lines = raw.trim().split("\n").filter(Boolean);
  const rows: ParsedRow[] = [];

  for (const line of lines) {
    // Support comma and tab delimiters
    const cols = line.split(/,|\t/).map(c => c.trim().replace(/^"|"$/g, ""));
    if (cols.length < 3) continue;

    // Find amount column — look for a numeric value
    const amountIdx = cols.findIndex((c, i) => i > 0 && !isNaN(parseFloat(c.replace(/,/g, ""))));
    if (amountIdx === -1) continue;

    const amount = parseFloat(cols[amountIdx].replace(/,/g, ""));
    if (isNaN(amount)) continue;

    rows.push({
      date: cols[0],
      description: cols.find((c, i) => i !== 0 && i !== amountIdx && c.length > 2) || "Unknown",
      amount,
    });
  }
  return rows;
}

function generateReport(rows: ParsedRow[]): HealthReport {
  const expenses = rows.filter(r => r.amount < 0);
  const income   = rows.filter(r => r.amount > 0);

  // Category summary
  const catMap: Record<string, { total: number; count: number }> = {};
  for (const r of expenses) {
    const cat = categorize(r.description);
    if (!catMap[cat]) catMap[cat] = { total: 0, count: 0 };
    catMap[cat].total += Math.abs(r.amount);
    catMap[cat].count++;
  }
  const totalSpend = expenses.reduce((s, r) => s + Math.abs(r.amount), 0);
  const topCategories: CategorySummary[] = Object.entries(catMap)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 3)
    .map(([name, { total, count }]) => ({
      name, total, count, percent: totalSpend > 0 ? (total / totalSpend) * 100 : 0,
    }));

  // Biggest single expense
  const biggestExpense = expenses.reduce<ParsedRow | null>((max, r) =>
    !max || Math.abs(r.amount) > Math.abs(max.amount) ? r : max, null);

  // Simple anomaly: transactions > 2 standard deviations from mean
  const amounts = expenses.map(r => Math.abs(r.amount));
  const mean = amounts.reduce((s, a) => s + a, 0) / (amounts.length || 1);
  const std  = Math.sqrt(amounts.reduce((s, a) => s + (a - mean) ** 2, 0) / (amounts.length || 1));
  const anomalies = expenses.filter(r => Math.abs(r.amount) > mean + 2 * std).slice(0, 3);

  return {
    totalSpend,
    totalIncome: income.reduce((s, r) => s + r.amount, 0),
    topCategories,
    biggestExpense,
    anomalies,
    transactionCount: rows.length,
  };
}

// ── Page ──────────────────────────────────────────────────────────────────
export default function HealthCheckPage() {
  const [csv, setCsv]           = useState("");
  const [report, setReport]     = useState<HealthReport | null>(null);
  const [error, setError]       = useState("");
  const [processing, setProcessing] = useState(false);
  const [email, setEmail]       = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const handleAnalyze = useCallback(async () => {
    if (!csv.trim()) { setError("Paste your CSV data first."); return; }
    setError("");
    setProcessing(true);
    await new Promise(r => setTimeout(r, 800)); // simulate processing
    const rows = parseCSV(csv);
    if (rows.length === 0) {
      setError("Could not parse any transactions. Make sure your CSV has date, description, and amount columns.");
      setProcessing(false);
      return;
    }
    setReport(generateReport(rows));
    setProcessing(false);
  }, [csv]);

  const handleEmailReport = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    // Stub — wire to Resend/Mailchimp
    const list = JSON.parse(localStorage.getItem("statify_health_leads") || "[]") as string[];
    localStorage.setItem("statify_health_leads", JSON.stringify([...list, email]));
    setEmailSent(true);
  }, [email]);

  const savingsOpportunity = useMemo(() => {
    if (!report?.topCategories[0]) return null;
    const top = report.topCategories[0];
    return { category: top.name, saving: top.total * 0.2 };
  }, [report]);

  return (
    <main className="min-h-screen bg-background text-foreground font-mono">
      {/* Nav */}
      <nav className="border-b border-border px-8 py-4 flex items-center gap-6 bg-background/80 backdrop-blur sticky top-0 z-40">
        <a href="/" className="flex items-center gap-2 text-accent hover:text-white transition-colors text-[10px] uppercase tracking-widest">
          <ArrowLeft className="w-3 h-3" />
          STATIFY_OS
        </a>
        <span className="text-muted-foreground text-[9px] tracking-[0.3em] uppercase">/ BANK_HEALTH_CHECK</span>
        <span className="ml-auto text-[8px] border border-accent/20 text-accent/50 px-2 py-0.5 uppercase tracking-widest">FREE_TOOL</span>
      </nav>

      <div className="max-w-4xl mx-auto px-8 py-16">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <p className="text-[9px] tracking-[0.5em] text-accent uppercase mb-4 animate-pulse">FREE_NEURAL_ANALYSIS</p>
          <h1 className="text-5xl font-black uppercase tracking-tight leading-none mb-6">
            BANK STATEMENT<br />
            <span className="text-accent glow-accent">HEALTH CHECK</span>
          </h1>
          <p className="text-muted-foreground text-sm uppercase tracking-[0.2em] max-w-lg mx-auto leading-relaxed">
            Paste your CSV transactions. Get AI-powered spending insights in 3 seconds. No account required.
          </p>
        </motion.div>

        {!report ? (
          /* Input Panel */
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="card-utilitarian border-accent/20">
            <div className="flex items-center gap-3 mb-6">
              <UploadCloud className="w-4 h-4 text-accent" />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em]">PASTE_CSV_DATA</span>
            </div>

            {/* Sample format hint */}
            <div className="bg-black/40 border border-border p-4 mb-6 text-[9px] text-muted-foreground">
              <p className="text-accent/60 mb-2">EXPECTED_FORMAT:</p>
              <p>2025-01-15, Grab Ride, -320.00</p>
              <p>2025-01-16, Shopee Purchase, -2400.00</p>
              <p>2025-01-17, Salary, 45000.00</p>
            </div>

            <textarea
              value={csv}
              onChange={e => setCsv(e.target.value)}
              className="w-full h-64 bg-muted/10 border border-border p-4 text-[11px] font-mono resize-none outline-none focus:border-accent/50 transition-colors placeholder:text-muted-foreground/30"
              placeholder={"2025-01-15, Grab Coffee, -85.00\n2025-01-16, Shopee, -1200.00\n2025-01-17, Salary, 45000.00\n..."}
              aria-label="Paste CSV transactions"
              spellCheck={false}
            />

            {error && (
              <p className="mt-3 text-danger text-[10px] uppercase tracking-widest flex items-center gap-2">
                <AlertTriangle className="w-3 h-3" /> {error}
              </p>
            )}

            <button
              onClick={handleAnalyze}
              disabled={processing}
              className="mt-6 w-full bg-accent text-black font-black py-4 text-[11px] uppercase tracking-[0.3em] hover:bg-white transition-colors disabled:opacity-50 flex items-center justify-center gap-3"
            >
              <Zap className="w-4 h-4" />
              {processing ? "RUNNING_NEURAL_SEQUENCE..." : "ANALYZE_NOW — FREE"}
            </button>
          </motion.div>
        ) : (
          /* Report Panel */
          <AnimatePresence>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

              {/* Summary bar */}
              <div className="grid grid-cols-3 gap-px bg-border border border-border">
                {[
                  { label: "Transactions", value: report.transactionCount },
                  { label: "Total_Spend",  value: `${report.totalSpend.toLocaleString()} ฿`, accent: true },
                  { label: "Total_Income", value: `+${report.totalIncome.toLocaleString()} ฿`, safe: true },
                ].map(m => (
                  <div key={m.label} className="bg-muted/10 p-6">
                    <p className="text-[8px] uppercase tracking-widest text-muted-foreground mb-2">{m.label}</p>
                    <p className={`text-2xl font-black ${m.accent ? "text-danger" : m.safe ? "text-safe" : "text-foreground"}`}>{m.value}</p>
                  </div>
                ))}
              </div>

              {/* Top categories */}
              <div className="card-utilitarian">
                <div className="flex items-center gap-3 mb-6">
                  <TrendingUp className="w-4 h-4 text-accent" />
                  <h2 className="text-[10px] font-bold uppercase tracking-[0.3em]">TOP_SPENDING_CATEGORIES</h2>
                </div>
                <div className="space-y-4">
                  {report.topCategories.map((cat, i) => (
                    <div key={cat.name}>
                      <div className="flex justify-between mb-1">
                        <span className="text-[10px] uppercase tracking-widest text-foreground/80">
                          {i === 0 ? "⚡ " : ""}{cat.name}
                        </span>
                        <span className="text-[10px] font-bold">{cat.total.toLocaleString()} ฿ ({cat.percent.toFixed(0)}%)</span>
                      </div>
                      <div className="h-[2px] bg-border w-full">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${cat.percent}%` }}
                          transition={{ duration: 0.8, delay: i * 0.2 }}
                          className="h-full bg-accent"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Anomalies + savings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {report.anomalies.length > 0 && (
                  <div className="card-utilitarian border-danger/20 bg-danger/[0.02]">
                    <div className="flex items-center gap-3 mb-4">
                      <AlertTriangle className="w-4 h-4 text-danger" />
                      <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-danger">ANOMALIES_DETECTED</h2>
                    </div>
                    <div className="space-y-3">
                      {report.anomalies.map((a, i) => (
                        <div key={i} className="border-l-2 border-danger/40 pl-3">
                          <p className="text-[10px] text-foreground/70 truncate">{a.description}</p>
                          <p className="text-[11px] font-bold text-danger">{Math.abs(a.amount).toLocaleString()} ฿</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {savingsOpportunity && (
                  <div className="card-utilitarian border-accent/20 bg-accent/[0.02]">
                    <p className="text-[8px] uppercase tracking-widest text-accent/60 mb-3">SAVINGS_OPPORTUNITY</p>
                    <p className="text-[10px] text-muted-foreground mb-4 leading-relaxed">
                      Reducing <strong className="text-foreground">{savingsOpportunity.category}</strong> spending by 20% could save you:
                    </p>
                    <p className="text-3xl font-black text-accent">{savingsOpportunity.saving.toLocaleString(undefined, { maximumFractionDigits: 0 })} ฿</p>
                    <p className="text-[8px] text-muted-foreground mt-1 uppercase">/ month</p>
                  </div>
                )}
              </div>

              {/* CTA — Email full report */}
              <div className="card-utilitarian border-accent/30 bg-accent/[0.02] text-center">
                <p className="text-[9px] tracking-[0.3em] text-accent uppercase mb-2">UNLOCK_FULL_REPORT</p>
                <h3 className="text-lg font-black uppercase mb-3">Want the complete neural breakdown?</h3>
                <p className="text-muted-foreground text-[11px] mb-6 uppercase tracking-wider leading-relaxed">
                  Upload your PDF statement to Statify_OS for outlier detection, merchant DNA analysis, and trend forecasting.
                </p>

                {!emailSent ? (
                  <form onSubmit={handleEmailReport} className="flex gap-0 max-w-sm mx-auto mb-4">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="YOUR_EMAIL..."
                      className="flex-1 bg-white/5 border border-white/10 border-r-0 px-4 py-3 text-[11px] outline-none focus:border-accent/50 transition-colors uppercase placeholder:text-white/20"
                      aria-label="Email for full report"
                    />
                    <button type="submit" className="bg-accent text-black font-bold text-[10px] px-5 py-3 uppercase tracking-widest hover:bg-white transition-colors">
                      SEND
                    </button>
                  </form>
                ) : (
                  <p className="text-accent text-[10px] uppercase tracking-widest mb-4 animate-pulse">✓ Check your inbox shortly.</p>
                )}

                <a
                  href="/"
                  className="inline-flex items-center gap-2 border border-accent text-accent text-[10px] uppercase tracking-widest px-6 py-3 hover:bg-accent hover:text-black transition-all"
                >
                  LAUNCH_FULL_PARSER <ChevronRight className="w-3 h-3" />
                </a>
              </div>

              {/* Reset */}
              <button
                onClick={() => { setReport(null); setCsv(""); setEmailSent(false); setEmail(""); }}
                className="text-[9px] text-muted-foreground uppercase tracking-widest hover:text-accent transition-colors w-full text-center"
              >
                ← Analyze another statement
              </button>

            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </main>
  );
}
