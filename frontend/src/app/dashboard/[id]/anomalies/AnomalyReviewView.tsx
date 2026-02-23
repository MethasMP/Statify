"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import { ingestionApi } from "@/features/ingestion/api/ingestionApi";
import type { Anomaly } from "@/features/ingestion/types";

const SEVERITY_CONFIG = {
  HIGH:   { color: "text-danger",  bg: "bg-danger/10",  border: "border-danger/30",  dot: "bg-danger" },
  MEDIUM: { color: "text-warning", bg: "bg-warning/10", border: "border-warning/30", dot: "bg-warning" },
  LOW:    { color: "text-safe",    bg: "bg-safe/10",    border: "border-safe/20",    dot: "bg-safe" },
};

function AnomalyCard({ anomaly, uploadId }: { anomaly: Anomaly; uploadId: string }) {
  const qc = useQueryClient();
  const cfg = SEVERITY_CONFIG[anomaly.severity as keyof typeof SEVERITY_CONFIG];

  const mutation = useMutation({
    mutationFn: (status: "confirmed" | "dismissed") =>
      ingestionApi.updateAnomalyStatus(anomaly.id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["anomalies", uploadId] }),
  });

  const isResolved = anomaly.status !== "open";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: isResolved ? 0.4 : 1, y: 0 }}
      className={`border ${cfg.border} ${cfg.bg} relative overflow-hidden transition-opacity`}
    >
      <div className={`absolute top-0 left-0 bottom-0 w-0.5 ${cfg.dot}`} />

      <div className="px-6 py-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            <AlertTriangle className={`w-4 h-4 flex-shrink-0 ${cfg.color}`} />
            <div>
              <p className={`font-mono text-[10px] font-bold uppercase tracking-widest ${cfg.color}`}>
                {anomaly.ruleName}
              </p>
              <p className={`font-mono text-[8px] ${cfg.color} opacity-60 uppercase tracking-widest mt-0.5`}>
                Severity: {anomaly.severity}
              </p>
            </div>
          </div>

          {/* Status chip */}
          <span className={`font-mono text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 border ${
            anomaly.status === "confirmed" ? "border-safe/40 text-safe"
              : anomaly.status === "dismissed" ? "border-muted-foreground/20 text-muted-foreground/40"
              : `${cfg.border} ${cfg.color}`
          }`}>
            {anomaly.status}
          </span>
        </div>

        {/* Transaction context */}
        <div className="border border-border/40 bg-background/40 p-3 mb-4 font-mono">
          <p className="text-[8px] text-muted-foreground/50 uppercase tracking-widest mb-1">Transaction</p>
          <div className="flex items-center justify-between gap-4">
            <span className="text-[10px] text-foreground/80 truncate">{anomaly.transaction.description}</span>
            <span className={`text-[11px] font-bold tabular-nums flex-shrink-0 ${
              anomaly.transaction.amount < 0 ? "text-danger" : "text-safe"
            }`}>
              {anomaly.transaction.amount < 0 ? "" : "+"}
              {anomaly.transaction.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} THB
            </span>
          </div>
          <p className="text-[8px] text-muted-foreground/40 mt-1">{anomaly.transaction.txnDate}</p>
        </div>

        {/* Detail */}
        <p className="font-mono text-[9px] text-muted-foreground/70 mb-4">{anomaly.detail}</p>

        {/* Actions */}
        {!isResolved && (
          <div className="flex gap-2">
            <button
              onClick={() => mutation.mutate("confirmed")}
              disabled={mutation.isPending}
              className="flex items-center gap-1.5 border border-danger/40 text-danger/70 hover:border-danger hover:text-danger hover:bg-danger/5 transition-all font-mono text-[8px] uppercase tracking-widest px-4 py-1.5 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle className="w-3 h-3" />
              Confirm Duplicate
            </button>
            <button
              onClick={() => mutation.mutate("dismissed")}
              disabled={mutation.isPending}
              className="flex items-center gap-1.5 border border-border text-muted-foreground/60 hover:border-muted-foreground hover:text-foreground transition-all font-mono text-[8px] uppercase tracking-widest px-4 py-1.5 cursor-pointer disabled:opacity-50"
            >
              <XCircle className="w-3 h-3" />
              Dismiss
            </button>
          </div>
        )}

        {isResolved && (
          <p className="font-mono text-[8px] text-muted-foreground/40 uppercase tracking-widest">
            Resolved {anomaly.reviewedAt ? `· ${new Date(anomaly.reviewedAt).toLocaleDateString()}` : ""}
          </p>
        )}
      </div>
    </motion.div>
  );
}

export default function AnomalyReviewView({ id }: { id: string }) {
  const { data: anomalies } = useSuspenseQuery<Anomaly[]>({
    queryKey: ["anomalies", id],
    queryFn: () => ingestionApi.getAnomalies(id),
  });

  const open = anomalies.filter(a => a.status === "open");
  const resolved = anomalies.filter(a => a.status !== "open");

  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <a href={`/dashboard/${id}`} className="text-muted-foreground hover:text-accent transition-colors cursor-pointer">
          <ArrowLeft className="w-4 h-4" />
        </a>
        <div>
          <p className="font-mono text-[8px] text-muted-foreground/50 uppercase tracking-[0.4em]">ANOMALY_REVIEW</p>
          <h1 className="font-mono text-xl font-black uppercase">
            {open.length} Open
            {open.length > 0 && <span className="text-warning ml-2">·</span>}
            <span className="text-muted-foreground/40 font-normal text-sm ml-2">{resolved.length} resolved</span>
          </h1>
        </div>
      </div>

      {anomalies.length === 0 && (
        <div className="border border-border text-center py-20 font-mono">
          <CheckCircle className="w-8 h-8 text-safe mx-auto mb-3" />
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">No anomalies detected</p>
        </div>
      )}

      {/* Open anomalies */}
      {open.length > 0 && (
        <section className="mb-8">
          <p className="font-mono text-[8px] text-muted-foreground/50 uppercase tracking-[0.4em] mb-4">
            Requires Review
          </p>
          <div className="space-y-3">
            <AnimatePresence>
              {open.map(a => <AnomalyCard key={a.id} anomaly={a} uploadId={id} />)}
            </AnimatePresence>
          </div>
        </section>
      )}

      {/* Resolved anomalies */}
      {resolved.length > 0 && (
        <section>
          <p className="font-mono text-[8px] text-muted-foreground/30 uppercase tracking-[0.4em] mb-4">
            Archived ({resolved.length})
          </p>
          <div className="space-y-2">
            {resolved.map(a => <AnomalyCard key={a.id} anomaly={a} uploadId={id} />)}
          </div>
        </section>
      )}
    </div>
  );
}
