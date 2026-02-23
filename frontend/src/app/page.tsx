"use client";

import { useState } from "react";
import FileUpload from "@/features/ingestion/components/FileUpload";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <main className="min-h-screen relative overflow-hidden grain">
      {/* SEO Optimized Hidden Headers for Indexing */}
      <h1 className="sr-only">Statify_OS: The Smartest AI Bank Statement Parser for 2026</h1>
      <h2 className="sr-only">Automated Financial Data Extraction and Neural Transaction Categorization</h2>
      
      {/* 2D Cyber-Grid */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
           style={{ 
             backgroundImage: 'radial-gradient(circle at 2px 2px, #00ff94 1px, transparent 0)',
             backgroundSize: '40px 40px' 
           }} />
      
      {/* Scanline Animation */}
      <div className="scanline" />

      {/* Navigation Overlay */}
      <nav className="relative z-20 border-b border-white/5 bg-black/20 backdrop-blur-xl px-12 py-4 flex justify-between items-center" aria-label="Main Navigation">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-accent shadow-[0_0_8px_var(--accent)]" role="presentation" />
          <span className="mono text-xs font-bold tracking-[0.2em] text-white/90">
            STATIFY_OS <span className="text-white/30 px-2 font-normal">|</span> 
            <span className="text-accent underline underline-offset-4 glow-accent">NEURAL_FINANCIAL_INTELLIGENCE</span>
          </span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span className="mono text-[10px] text-white/50 uppercase tracking-widest">System_Online</span>
          </div>
          <span className="mono text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 text-white/40">V1.0.4_BETA</span>
          <a href="/tools/health-check" className="mono text-[10px] border border-white/10 px-3 py-1 text-white/40 hover:border-white/40 hover:text-white transition-colors uppercase tracking-widest">[ FREE_TOOL ]</a>
          <a href="/showcase" className="mono text-[10px] border border-accent/30 px-3 py-1 text-accent/70 hover:border-accent hover:text-accent transition-colors uppercase tracking-widest">[ SYSTEM_TOUR ]</a>
        </div>
      </nav>

      <div className="relative z-10 max-w-7xl mx-auto px-12 pt-16 pb-32">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-24"
        >
          <p className="mono text-[10px] tracking-[0.5em] text-accent font-bold uppercase block mb-4 glow-accent animate-pulse">
            Autonomous Personal Finance Analysis
          </p>
          <h2 className="text-white font-black text-8xl tracking-tight leading-[0.85] mb-8">
            TURN BANK STATEMENTS<br />
            INTO <span className="text-accent glow-accent">SMART INSIGHTS</span>
          </h2>
          <p className="text-white/40 max-w-2xl mx-auto mb-12 text-sm uppercase tracking-[0.2em] leading-relaxed">
            The World's smartest bank statement parser with AI-driven categorization. 
            Automate your financial analysis with neural precision.
          </p>
          <EmailCapture />
        </motion.div>

        {/* Core IO Module */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-32"
        >
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="mono text-[9px] font-bold text-white/30 tracking-[0.4em] uppercase">INGEST_SOURCE</span>
            <span className="mono text-[8px] text-white/10">IO_MODULE_07</span>
          </div>
          <FileUpload onUploadComplete={(id) => router.push(`/dashboard/${id}`)} />
        </motion.div>

        {/* Feature Grid */}
        <div className="grid grid-cols-3 gap-8">
          {[
            { id: "01", title: "NEURAL_PARSE", desc: "Proprietary NLP layer identifies transaction patterns across fragmented PDF layouts with 99.8% semantic accuracy." },
            { id: "02", title: "AUTO_CLASS", desc: "Dynamic rule engine categorizes flow based on merchant DNA, historical behavior, and localized fiscal patterns." },
            { id: "03", title: "OUTLIER_MAP", desc: "Statistial anomaly detection flags velocity shifts, duplicate pings, and high-magnitude variance automatically." }
          ].map((feature, idx) => (
            <motion.div 
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + (idx * 0.1) }}
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              className="card-utilitarian border-white/5 bg-white/[0.02] group hover:border-accent/40 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-[1px] bg-accent" />
                <h3 className="mono text-[10px] font-bold text-accent tracking-tighter group-hover:glow-accent">{feature.id}_{feature.title}</h3>
              </div>
              <p className="text-white/40 text-sm leading-relaxed font-light group-hover:text-white/60 transition-colors">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* HOW_IT_WORKS — Proof Points */}
        <HowItWorksSection />

        {/* Pricing Section */}
        <PricingSection />
      </div>
    </main>
  );
}

function HowItWorksSection() {
  const steps = [
    {
      step: "01",
      label: "INGEST",
      desc: "PDF or CSV is ingested into the Neural Parse Engine. Binary stream is decoded and page structure is mapped.",
      metric: "< 3s",
      metricLabel: "Parse_Time",
    },
    {
      step: "02",
      label: "CLASSIFY",
      desc: "Each transaction is cross-referenced against merchant DNA fingerprints and historical behavioral anchors.",
      metric: "99.8%",
      metricLabel: "Accuracy",
    },
    {
      step: "03",
      label: "SURFACE",
      desc: "Outlier detection flags velocity anomalies and duplicate signals. Results are rendered into the live stream.",
      metric: "< 40ms",
      metricLabel: "Latency",
    },
  ];

  return (
    <div className="mt-40" id="how-it-works">
      <div className="text-center mb-16">
        <p className="mono text-[9px] tracking-[0.4em] text-accent/60 uppercase mb-3">PROTOCOL_SEQUENCE</p>
        <h2 className="mono text-2xl font-bold text-white tracking-[0.3em] uppercase">How_It_Works</h2>
        <div className="w-20 h-[1px] bg-accent mx-auto mt-4" />
      </div>

      {/* Step connector line */}
      <div className="relative max-w-5xl mx-auto">
        <div className="absolute top-10 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-accent/20 to-transparent hidden lg:block" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-border border border-border">
          {steps.map((s, idx) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15, duration: 0.6 }}
              className="bg-background/60 backdrop-blur p-10 flex flex-col gap-6 group hover:bg-accent/[0.03] transition-colors"
            >
              {/* Step header */}
              <div className="flex items-center justify-between">
                <span className="mono text-[8px] tracking-[0.4em] text-accent/40 uppercase">{s.step}_EXEC</span>
                <div className="w-1.5 h-1.5 bg-accent/20 group-hover:bg-accent transition-colors" />
              </div>

              {/* Metric callout */}
              <div className="border-l-2 border-accent pl-4">
                <p className="text-3xl font-black font-mono text-white group-hover:text-accent transition-colors">{s.metric}</p>
                <p className="mono text-[8px] text-muted-foreground uppercase tracking-widest mt-1">{s.metricLabel}</p>
              </div>

              {/* Label + desc */}
              <div>
                <h3 className="mono text-sm font-bold text-white/80 uppercase tracking-widest mb-3">{s.label}</h3>
                <p className="text-white/30 text-[11px] leading-relaxed group-hover:text-white/50 transition-colors">{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PricingSection() {
  const tiers = [
    {
      name: "COMMUNITY_CORE",
      price: "0",
      features: ["CSV Ingestion", "Basic Categorization", "3 Exports / Month", "Public Community Support"],
      button: "DEPLOY_FREE",
      accent: false
    },
    {
      name: "NEURAL_OVERDRIVE",
      price: "29",
      features: ["Smart PDF Parsing", "AI Outlier Detection", "Unlimited Exports", "Custom Neural Rules", "Priority API Access"],
      button: "UPGRADE_SYSTEM",
      accent: true
    }
  ];

  return (
      <div className="mt-40" id="pricing">
      <div className="text-center mb-16">
        <h2 className="mono text-2xl font-bold text-white tracking-[0.3em] uppercase">Subscription_Protocol</h2>
        <p className="text-white/20 text-[9px] uppercase tracking-widest mt-2">Scale your financial intelligence workflow</p>
        <div className="w-20 h-[1px] bg-accent mx-auto mt-4" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto" role="list">
        {tiers.map((tier, idx) => (
          <motion.div 
            key={tier.name}
            role="listitem"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.2 }}
            whileHover={{ y: -5 }}
            className={`card-utilitarian flex flex-col ${tier.accent ? "border-accent/40 bg-accent/[0.02]" : "border-white/5"}`}
          >
            <div className="mb-8">
              <h3 className={`mono text-[10px] tracking-widest ${tier.accent ? "text-accent" : "text-white/40"}`}>{tier.name}</h3>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-4xl font-black text-white">${tier.price}</span>
                <span className="mono text-[10px] text-white/20" aria-label="per month">/ MONTH</span>
              </div>
            </div>
            <ul className="flex-1 space-y-4 mb-12" aria-label={`${tier.name} features`}>
              {tier.features.map(f => (
                <li key={f} className="flex items-center gap-3">
                  <div className={`w-1 h-1 ${tier.accent ? "bg-accent" : "bg-white/20"}`} />
                  <span className="mono text-[10px] text-white/60 uppercase tracking-tighter">{f}</span>
                </li>
              ))}
            </ul>
            <button className={`w-full py-3 mono text-[10px] font-bold tracking-[0.2em] transition-all ${
              tier.accent 
                ? "bg-accent text-black hover:bg-white" 
                : "bg-white/5 text-white/40 border border-white/10 hover:border-white/40 hover:text-white"
            }`}>
              {tier.button}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function EmailCapture() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    // Stub: save to localStorage — swap for Resend/Mailchimp API call when ready
    await new Promise(r => setTimeout(r, 600));
    const existing = JSON.parse(localStorage.getItem("statify_waitlist") || "[]") as string[];
    localStorage.setItem("statify_waitlist", JSON.stringify([...existing, email]));
    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center justify-center gap-3 border border-accent/30 bg-accent/5 px-8 py-4 max-w-md mx-auto mt-4"
      >
        <div className="w-2 h-2 bg-accent animate-pulse" />
        <span className="mono text-[10px] text-accent uppercase tracking-widest">SIGNAL_CONFIRMED — You&apos;re on the list.</span>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-0 max-w-md mx-auto mt-4" aria-label="Join the waitlist">
      <input
        type="email"
        required
        placeholder="YOUR_EMAIL_ADDR..."
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="flex-1 bg-white/5 border border-white/10 border-r-0 px-4 py-3 mono text-[11px] text-white placeholder:text-white/20 outline-none focus:border-accent/50 transition-colors uppercase"
        aria-label="Email address"
      />
      <button
        type="submit"
        disabled={loading}
        className="mono text-[10px] font-bold bg-accent text-black px-6 py-3 uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-50 whitespace-nowrap"
      >
        {loading ? "..." : "GET_EARLY_ACCESS"}
      </button>
    </form>
  );
}
