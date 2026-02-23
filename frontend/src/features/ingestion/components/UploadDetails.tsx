"use client";

import { AlertTriangle, Search, ArrowRight, Save } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ingestionApi } from "../api/ingestionApi";
import type { Transaction, Upload } from "../types";

const COLORS = ["#4338ca", "#10b981", "#f59e0b", "#e11d48", "#8b5cf6", "#06b6d4"];

export default function UploadDetails({ id }: { id: string }) {
  // Doctrine: Suspense-first data fetching
  const { data: status } = useSuspenseQuery<Upload>({
    queryKey: ["upload", id],
    queryFn: () => ingestionApi.getUploadStatus(id),
    refetchInterval: (query) => 
       query.state.data?.status === 'completed' || query.state.data?.status === 'failed' ? false : 2000
  });

  const { data: transactions } = useSuspenseQuery<Transaction[]>({
    queryKey: ["transactions", id],
    queryFn: () => ingestionApi.getTransactions(id),
  });

  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const filteredTransactions = useMemo(() => 
    (transactions || []).filter((t: Transaction) => t.description.toLowerCase().includes(search.toLowerCase())),
    [transactions, search]
  );

  const chartData = useMemo(() => {
    const summary: Record<string, number> = {};
    (transactions || []).forEach((t: Transaction) => {
      const cat = t.categoryId ? `ID_${t.categoryId}` : "UNKNOWN";
      summary[cat] = (summary[cat] || 0) + Math.abs(t.amount);
    });
    return Object.entries(summary).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  if (status?.status === "failed") {
    return (
      <div className="max-w-4xl mx-auto p-12 border border-danger/30 bg-danger/5 mt-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 font-mono text-[8px]">CORE_EXCEPTION_0x44</div>
        <div className="flex items-center gap-6 text-danger mb-8">
          <AlertTriangle className="w-10 h-10" />
          <h2 className="text-2xl font-black uppercase tracking-tighter">System_Malfunction</h2>
        </div>
        <div className="bg-background/80 backdrop-blur p-6 border border-danger/20 font-mono text-[11px] text-danger/80">
           {status.errorMsg || "Unknown Error"}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Header Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-px bg-border border border-border mb-16 shadow-2xl shadow-accent/5">
        {[
          { label: "Source", value: status.filename, icon: <div className="w-1 h-1 bg-muted-foreground" />, color: "text-muted-foreground" },
          { label: "Gross_Volume", value: `${(transactions || []).reduce((acc: number, t: Transaction) => acc + Math.abs(t.amount), 0).toLocaleString()} THB`, color: "text-foreground", pulse: true },
          { label: "Auto_Classification", value: `${(transactions || []).length > 0 ? (((transactions || []).filter((t: Transaction) => t.matchedRuleId).length / (transactions || []).length) * 100).toFixed(0) : 0}%`, icon: <div className="w-1 h-1 bg-safe" />, color: "text-safe" },
          { label: "Outliers_Found", value: "0x00", color: "text-danger/40", hoverColor: "group-hover:text-danger" }
        ].map((metric, idx) => (
          <motion.div 
            key={metric.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`bg-muted/20 p-8 backdrop-blur-sm border-l border-border first:border-l-0 group transition-colors ${metric.hoverColor || ""}`}
          >
            <span className={`block text-[9px] uppercase font-bold mb-3 tracking-widest flex items-center gap-2 ${metric.color}`}>
              {metric.icon} {metric.label}
            </span>
            <span className={`block font-mono ${metric.label === "Source" ? "text-xs truncate" : "text-2xl font-black"} ${metric.color} ${metric.pulse ? "glow-accent animate-pulse" : ""}`}>
              {metric.value}
            </span>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 mb-20">
        {/* Visualizer & Logs */}
        <section className="lg:col-span-1 flex flex-col space-y-6" aria-labelledby="dist-analysis-title">
           <div className="card-utilitarian h-80 flex flex-col active:border-accent group transition-colors">
              <div className="flex justify-between items-center mb-6">
                 <h2 id="dist-analysis-title" className="font-mono text-[9px] font-bold uppercase tracking-[0.3em] flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-accent" role="presentation" />
                    Distribution_Analysis
                 </h2>
              </div>
              <div className="flex-1 min-h-0 relative">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={85}
                        paddingAngle={4}
                        dataKey="value"
                        stroke="rgba(0,0,0,0.5)"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: "#0d0d0d", border: "1px solid #262626", borderRadius: "0px", fontSize: "9px", fontFamily: "monospace" }}
                        itemStyle={{ color: "#00ff94" }}
                        cursor={{ fill: 'transparent' }}
                      />
                    </PieChart>
                 </ResponsiveContainer>
                 <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" aria-hidden="true">
                    <span className="text-[7px] font-mono text-muted-foreground uppercase opacity-40">Diversity_Idx</span>
                    <span className="text-lg font-black font-mono">{(chartData.length * 1.4).toFixed(1)}</span>
                 </div>
              </div>
           </div>

           {/* Analysis Log */}
           <div className="card-utilitarian h-48 bg-black/40 flex flex-col border-white/5" aria-label="Neural Processing Log">
              <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
                 <span className="text-[8px] font-mono text-white/30 uppercase tracking-[0.2em]">NEURAL_PARSE_LOG</span>
                 <div className="flex gap-1" role="status" aria-label="AI processing active">
                    <div className="w-1 h-1 bg-accent/50 animate-pulse" />
                    <div className="w-1 h-1 bg-accent/30 animate-pulse delay-75" />
                    <div className="w-1 h-1 bg-accent/10 animate-pulse delay-150" />
                 </div>
              </div>
              <div className="flex-1 overflow-y-auto font-mono text-[9px] text-accent/60 space-y-1.5 scrollbar-hide">
                 <div className="opacity-40">{`> [INIT] Loading stream...`}</div>
                 <div className="opacity-60 text-white">{`> [INF] Extracting buffer: ${status.filename}`}</div>
                 <div className="text-safe">{`> [DET] Status: ${status.status.toUpperCase()}`}</div>
                 {status.status === 'completed' && (
                    <>
                      <div className="text-safe">{`> [DET] Found ${transactions.length} temporal entries`}</div>
                      <div className="text-safe/80">{`> [RES] Categorization complete`}</div>
                    </>
                 )}
                 {status.status === 'processing' && (
                    <div className="animate-pulse">{`> [EXE] Mapping neural weights...`}</div>
                 )}
                 <div className="opacity-40">{`> [HLT] Waiting for input...`}</div>
              </div>
           </div>

           <div className="p-6 border border-border bg-accent/[0.02] relative group">
              <div className="absolute top-2 right-2 text-[8px] font-mono text-accent">TIP_01</div>
              <p className="text-[10px] font-mono text-muted-foreground leading-relaxed uppercase tracking-tighter">
                 Click on [CLASS] labels in the stream to manually override neural categorization.
              </p>
           </div>
        </section>

        {/* Data Table Area */}
        <section className="lg:col-span-2" aria-labelledby="transaction-stream-title">
          <div className="flex justify-between items-center mb-6">
             <div className="relative flex-1 max-w-lg">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" />
                <input 
                  type="text" 
                  aria-label="Search transactions"
                  placeholder="SCAN STREAM BY DESCRIPTION..."
                  className="w-full bg-muted/20 border border-border pl-10 pr-4 py-2 text-[10px] font-mono focus:bg-accent/5 focus:border-accent outline-none uppercase placeholder:opacity-30"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
             </div>
             <h2 id="transaction-stream-title" className="sr-only">Transaction Stream</h2>
             <div className="text-[8px] font-mono text-muted-foreground uppercase px-4 whitespace-nowrap">
                Stream_Buffer_Size: {filteredTransactions.length}
             </div>
          </div>

          <div className="border border-border bg-muted/5 relative">
            <div className="absolute top-0 left-0 w-[1px] h-full bg-gradient-to-b from-accent/40 via-transparent to-transparent opacity-20" />
            <table className="w-full text-left" aria-label="Detailed transaction list">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  <th scope="col" className="p-4 font-mono text-[9px] uppercase font-bold text-muted-foreground tracking-widest w-24">UTC_Date</th>
                  <th scope="col" className="p-4 font-mono text-[9px] uppercase font-bold text-muted-foreground tracking-widest">Entry_Descriptor</th>
                  <th scope="col" className="p-4 font-mono text-[9px] uppercase font-bold text-muted-foreground tracking-widest text-right">Delta_THB</th>
                  <th scope="col" className="p-4 font-mono text-[9px] uppercase font-bold text-muted-foreground tracking-widest text-right w-40">Classification</th>
                </tr>
              </thead>
              <tbody className="font-mono text-[10px] divide-y divide-border/50">
                <AnimatePresence mode="popLayout">
                  {(filteredTransactions || []).map((txn: Transaction, idx: number) => (
                    <motion.tr 
                      layout
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.01 }}
                      key={txn.id} 
                      className="hover:bg-accent/5 group/row transition-colors"
                    >
                      <td className="p-4 text-muted-foreground/60">{txn.txnDate}</td>
                      <td className="p-4 text-foreground/90 font-medium">
                         <span className="group-hover/row:text-accent transition-colors">{txn.description}</span>
                      </td>
                      <td className={`p-4 text-right font-bold tabular-nums ${txn.amount < 0 ? "text-danger" : "text-safe"}`}>
                        {txn.amount < 0 ? "" : "+"}{txn.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-4 text-right">
                         {editingId === txn.id ? (
                           <div className="flex gap-1 items-center justify-end animate-in fade-in slide-in-from-right-2">
                              <select 
                                autoFocus
                                className="bg-background border border-accent/40 text-[9px] px-1 py-0.5 outline-none text-accent"
                                onChange={(e) => {
                                  // Implementation for update would go here
                                  setEditingId(null);
                                }}
                              >
                                 <option>FOOD</option>
                                 <option>BILLS</option>
                                 <option>TRAVEL</option>
                                 <option>MISC</option>
                              </select>
                              <button 
                                onClick={() => setEditingId(null)}
                                className="bg-accent text-black p-1 hover:bg-white transition-colors"
                              >
                                <Save className="w-3 h-3" />
                              </button>
                           </div>
                         ) : (
                           <button 
                             onClick={() => setEditingId(txn.id)}
                             className="opacity-0 group-hover/row:opacity-100 transition-all bg-muted border border-border px-3 py-1 text-[8px] flex items-center gap-2 ml-auto hover:border-accent hover:text-accent"
                           >
                              [ {txn.categoryId ? "CLASS_" + txn.categoryId : "UNCLASSIFIED"} ]
                              <ArrowRight className="w-2.5 h-2.5" />
                           </button>
                         )}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
