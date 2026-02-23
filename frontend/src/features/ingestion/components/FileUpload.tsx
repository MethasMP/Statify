"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { Upload, X, FileText, Cpu, Shield, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { ingestionApi } from "../api/ingestionApi";

interface FileUploadProps {
  onUploadComplete: (id: string) => void;
}

const NEURAL_STEPS = [
  "[INIT] BOOTING_NEURAL_PARSER_V1.0.4",
  "[EXE] ALLOCATING_VM_MEMORY_RESOURCES",
  "[EXE] APPLYING_FISCAL_DNA_MAPPING",
  "[INF] DECRYPTING_PDF_STRUCTURE",
  "[INF] RECOGNIZING_TEMPORAL_PATTERNS",
  "[RES] NEURAL_SYNC_COMPLETE",
];

// ── Waveform Canvas ────────────────────────────────────────────────────────
function Waveform({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef  = useRef<number>(0);
  const timeRef   = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      const speed = active ? 0.07 : 0.015;
      timeRef.current += speed;
      const t = timeRef.current;

      const waves = [
        { amp: height * 0.35, freq: 1.8,  phase: 0,           alpha: 0.85 },
        { amp: height * 0.22, freq: 3.4,  phase: Math.PI / 3, alpha: 0.50 },
        { amp: height * 0.14, freq: 5.8,  phase: Math.PI / 1.5, alpha: 0.28 },
      ];

      waves.forEach(({ amp, freq, phase, alpha }) => {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(0,255,148,${active ? alpha : alpha * 0.35})`;
        ctx.lineWidth   = active ? 1.5 : 1;
        ctx.shadowColor = "#00ff94";
        ctx.shadowBlur  = active ? 10 : 3;

        for (let x = 0; x <= width; x++) {
          const y = height / 2 + amp * Math.sin((x / width) * freq * Math.PI * 2 + t + phase);
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      frameRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(frameRef.current);
  }, [active]);

  return <canvas ref={canvasRef} width={180} height={90} className="w-full h-full" />;
}

// ── Security badge ─────────────────────────────────────────────────────────
function TrustBadge({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-1 h-1 flex-shrink-0 bg-safe" />
      <span className="font-mono text-[7px] text-muted-foreground/50 uppercase tracking-widest whitespace-nowrap">{label}</span>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────
export default function FileUpload({ onUploadComplete }: FileUploadProps) {
  const [file,       setFile]       = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [stepIdx,    setStepIdx]    = useState(0);

  const mutation = useMutation({
    mutationFn: (f: File) => ingestionApi.uploadFile(f),
    onSuccess:  (data)    => onUploadComplete(data.id),
  });

  useEffect(() => {
    if (!mutation.isPending) return;
    const id = setInterval(() => setStepIdx(p => (p + 1) % NEURAL_STEPS.length), 800);
    return () => clearInterval(id);
  }, [mutation.isPending]);

  const handleFile = useCallback((f: File) => {
    const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
    const supported = [
      "xlsx",           // Excel — first-class
      "pdf",            // PDF — first-class
      "xls",            // Legacy Excel — bonus
      "csv",            // CSV — fallback
    ];
    if (supported.includes(ext)) {
      setFile(f);
      mutation.reset();
    }
  }, [mutation]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  };

  return (
    <div className="w-full">
      {/* ── Panel ────────────────────────────────────────────────────────── */}
      <div
        role="region"
        aria-label="File upload zone"
        className={`
          relative border overflow-hidden transition-all duration-500
          ${dragActive
            ? "border-accent/80 shadow-[0_0_32px_rgba(0,255,148,0.10)]"
            : "border-border"}
        `}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
      >
        {/* Top glow line */}
        <div
          className={`absolute top-0 left-0 right-0 h-px transition-all duration-500 pointer-events-none ${
            dragActive ? "bg-accent" : "bg-gradient-to-r from-transparent via-accent/25 to-transparent"
          }`}
        />

        {/* Corner ticks */}
        {(["top-0 left-0", "top-0 right-0", "bottom-0 left-0", "bottom-0 right-0"] as const).map(pos => (
          <span
            key={pos}
            aria-hidden="true"
            className={`absolute ${pos} w-3 h-3 pointer-events-none`}
            style={{
              borderTop:    pos.includes("top")    ? "1px solid rgba(0,255,148,0.5)" : undefined,
              borderBottom: pos.includes("bottom") ? "1px solid rgba(0,255,148,0.5)" : undefined,
              borderLeft:   pos.includes("left")   ? "1px solid rgba(0,255,148,0.5)" : undefined,
              borderRight:  pos.includes("right")  ? "1px solid rgba(0,255,148,0.5)" : undefined,
            }}
          />
        ))}

        <AnimatePresence mode="wait">
          {/* ─── IDLE ─────────────────────────────────────────────────── */}
          {!file && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25 }}
            >
              {/* Three columns */}
              <div className="flex items-stretch min-h-[140px]">

                {/* LEFT — waveform */}
                <div className="flex-shrink-0 w-44 border-r border-border flex items-center justify-center p-4">
                  <Waveform active={dragActive} />
                </div>

                {/* CENTER — CTA */}
                <div className="flex-1 px-8 py-6 flex flex-col justify-center gap-4">
                  <div className="flex items-center gap-3">
                    <Upload
                      className={`w-4 h-4 flex-shrink-0 transition-colors duration-300 ${
                        dragActive ? "text-accent" : "text-accent/50"
                      }`}
                      aria-hidden="true"
                    />
                    <div>
                      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-white">
                        {dragActive ? "RELEASE_TO_BUFFER…" : "INGESTION_PROTOCOL_ACTIVE"}
                      </p>
                      <p className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest mt-0.5">
                        {dragActive ? "File_detected — drop to ingest" : "Drag_drop or click to select"}
                      </p>
                    </div>
                  </div>

                  <label
                    className="
                      inline-flex items-center gap-2 self-start cursor-pointer
                      border border-accent/40 text-accent/70
                      hover:border-accent hover:text-accent hover:bg-accent/5
                      transition-all duration-200
                      font-mono text-[9px] font-bold uppercase tracking-[0.25em]
                      px-5 py-2
                    "
                  >
                    <Zap className="w-3 h-3" aria-hidden="true" />
                    SELECT_INPUT_SOURCE
                    <input
                      type="file"
                      className="sr-only"
                      accept=".xlsx,.xls,.pdf,.csv"
                      aria-label="Choose an Excel or PDF file"
                      onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                    />
                  </label>
                </div>

                {/* RIGHT — format badges */}
                <div className="flex-shrink-0 w-32 border-l border-border flex flex-col items-center justify-center gap-2 py-6 px-4">
                  {[
                    { label: "XLSX", primary: true },
                    { label: "PDF",  primary: true },
                    { label: "CSV",  primary: false },
                  ].map(({ label, primary }) => (
                    <div
                      key={label}
                      className={`
                        w-full text-center border transition-colors duration-200 py-1.5
                        ${primary
                          ? "border-accent/30 hover:border-accent/70"
                          : "border-border/30 hover:border-border"}
                      `}
                    >
                      <span className={`font-mono text-[9px] font-bold tracking-widest ${
                        primary ? "text-accent/60" : "text-muted-foreground/30"
                      }`}>
                        {label}
                      </span>
                    </div>
                  ))}
                  <p className="font-mono text-[7px] text-muted-foreground/30 uppercase tracking-widest text-center mt-1">
                    SUPPORTED
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* ─── FILE SELECTED ────────────────────────────────────────── */}
          {file && (
            <motion.div
              key="selected"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <div className="flex items-stretch min-h-[140px]">

                {/* LEFT — waveform (active during processing) */}
                <div className="flex-shrink-0 w-44 border-r border-border flex items-center justify-center p-4">
                  <Waveform active={mutation.isPending} />
                </div>

                {/* CENTER — file info + actions */}
                <div className="flex-1 px-8 py-6 flex flex-col justify-center gap-5">
                  {/* File row */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex-shrink-0 p-1.5 border border-accent/20 bg-accent/5">
                        <FileText className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-mono text-[10px] font-bold uppercase text-white truncate max-w-[240px]">
                          {file.name}
                        </p>
                        <p className="font-mono text-[8px] text-muted-foreground uppercase mt-0.5">
                          {(file.size / 1024).toFixed(1)}&nbsp;KB · READY_FOR_INGESTION
                        </p>
                      </div>
                    </div>
                    {!mutation.isPending && (
                      <button
                        onClick={() => setFile(null)}
                        className="flex-shrink-0 text-muted-foreground hover:text-danger transition-colors p-1 cursor-pointer"
                        aria-label="Remove file"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Progress / Execute */}
                  {mutation.isPending ? (
                    <div className="space-y-2">
                      <div className="relative h-px w-full bg-border overflow-hidden">
                        <motion.div
                          className="absolute inset-0 bg-accent"
                          initial={{ x: "-100%" }}
                          animate={{ x: "0%" }}
                          transition={{ duration: 5, ease: "linear" }}
                        />
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                          animate={{ x: ["-100%", "200%"] }}
                          transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
                        />
                      </div>
                      <p className="font-mono text-[9px] text-accent/70 flex items-center gap-2">
                        <Cpu className="w-3 h-3 animate-spin flex-shrink-0" aria-hidden="true" />
                        {NEURAL_STEPS[stepIdx]}
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={() => mutation.mutate(file)}
                      className="
                        inline-flex items-center gap-2 self-start cursor-pointer
                        bg-accent text-black font-mono font-bold
                        text-[9px] uppercase tracking-[0.25em]
                        px-6 py-2.5
                        hover:bg-white transition-colors duration-200
                        disabled:opacity-50
                      "
                      disabled={mutation.isPending}
                    >
                      <Shield className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
                      EXE_NEURAL_PARSE_V1
                    </button>
                  )}

                  {mutation.isError && (
                    <p role="alert" className="font-mono text-[9px] text-danger uppercase tracking-widest">
                      ✕&nbsp;{mutation.error instanceof Error ? mutation.error.message : "PROCESS_FAILED"}
                    </p>
                  )}
                </div>

                {/* RIGHT — status */}
                <div className="flex-shrink-0 w-32 border-l border-border flex flex-col items-center justify-center gap-2 px-4">
                  <p className="font-mono text-[7px] text-muted-foreground/40 uppercase tracking-widest">STATUS</p>
                  <div className={`flex items-center gap-1.5 ${mutation.isPending ? "text-accent" : "text-muted-foreground/30"}`}>
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${mutation.isPending ? "bg-accent animate-pulse" : "bg-border"}`}
                    />
                    <span className="font-mono text-[8px] uppercase tracking-widest">
                      {mutation.isPending ? "PROCESSING" : "STANDBY"}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Bottom trust strip ───────────────────────────────────────── */}
        <div className="border-t border-border/40 px-8 py-2.5 flex items-center gap-10 bg-black/25">
          <TrustBadge label="ENCRYPTION_ISO_2026" />
          <div className="w-px h-3 bg-border/60 flex-shrink-0" />
          <TrustBadge label="NEURAL_SANITIZATION" />
          <div className="w-px h-3 bg-border/60 flex-shrink-0" />
          <TrustBadge label="ZERO_DATA_RETENTION" />
        </div>
      </div>
    </div>
  );
}
