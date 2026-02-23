import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Statify_OS | System Architecture & Capability Tour",
  description:
    "A deep-dive into how Statify_OS parses, classifies, and surfaces financial intelligence using the NEURAL_PARSE engine. Explore our architecture and subscription tiers.",
};

export default function ShowcasePage() {
  return (
    <main
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        background: "#0d0d0d",
        color: "#f2f2f2",
        minHeight: "100vh",
        backgroundImage:
          "radial-gradient(circle at 50% 50%, rgba(0,255,148,0.04) 0%, transparent 65%), linear-gradient(rgba(255,255,255,0.01) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.01) 1px, transparent 1px)",
        backgroundSize: "100% 100%, 40px 40px, 40px 40px",
      }}
    >
      {/* Nav */}
      <nav
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          padding: "1rem 3rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "sticky",
          top: 0,
          background: "rgba(13,13,13,0.85)",
          backdropFilter: "blur(20px)",
          zIndex: 50,
        }}
      >
        <a
          href="/"
          style={{ color: "#00ff94", textDecoration: "none", fontSize: "0.75rem", letterSpacing: "0.2em", textTransform: "uppercase" }}
        >
          ← STATIFY_OS
        </a>
        <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.6rem", letterSpacing: "0.4em" }}>
          SYSTEM_ARCHITECTURE_TOUR
        </span>
      </nav>

      {/* Slide 01 — Hero */}
      <Section accent="PROTOCOL_INIT_0xFF">
        <BigTitle>STATIFY_OS</BigTitle>
        <Sub>
          The world&apos;s most advanced AI bank statement parser. Neural
          architecture designed for 2026 financial complexity.
        </Sub>
        <a href="#neural-parse" style={ctaStyle}>
          BEGIN_TOUR ↓
        </a>
      </Section>

      {/* Slide 02 — Neural Parse */}
      <Section id="neural-parse" accent="MODULE_02 / NEURAL_PARSE_ENGINE">
        <Eyebrow>Core Technology</Eyebrow>
        <h2 style={h2Style}>NEURAL_PARSE_ENGINE</h2>
        <Card>
          <p style={{ color: "#f2f2f2", lineHeight: 1.8, marginBottom: "2rem" }}>
            Proprietary NLP layer identifies transaction patterns across
            fragmented PDF layouts with{" "}
            <strong style={{ color: "#00ff94" }}>99.8% semantic accuracy</strong>
            . We don&apos;t just extract text — we decode intent.
          </p>
          <div style={{ display: "flex", gap: "3rem" }}>
            <Metric value="< 3s" label="Parse_Time" />
            <Metric value="99.8%" label="Accuracy" />
            <Metric value="< 40ms" label="Latency" />
          </div>
        </Card>
      </Section>

      {/* Slide 03 — Protocol Sequence */}
      <Section id="how-it-works" accent="MODULE_03 / PROTOCOL_SEQUENCE">
        <Eyebrow>How It Works</Eyebrow>
        <h2 style={h2Style}>THREE_PHASE_EXECUTION</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.06)", maxWidth: "900px", margin: "3rem auto 0" }}>
          {[
            { step: "01", label: "INGEST", desc: "PDF or CSV decoded, page structure mapped, binary stream normalized." },
            { step: "02", label: "CLASSIFY", desc: "Cross-referenced against merchant DNA fingerprints. Fiscal patterns inferred." },
            { step: "03", label: "SURFACE", desc: "Velocity anomalies flagged. Duplicate signals suppressed. Live stream rendered." },
          ].map((s) => (
            <div
              key={s.step}
              style={{
                background: "rgba(13,13,13,0.8)",
                padding: "2.5rem",
                borderLeft: "2px solid #00ff94",
              }}
            >
              <p style={{ fontSize: "0.6rem", letterSpacing: "0.4em", color: "rgba(0,255,148,0.4)", marginBottom: "1.5rem" }}>
                {s.step}_EXEC
              </p>
              <h3 style={{ fontSize: "1rem", fontWeight: 900, marginBottom: "1rem", letterSpacing: "0.2em" }}>{s.label}</h3>
              <p style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", lineHeight: 1.7 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Slide 04 — Pricing */}
      <Section id="pricing" accent="MODULE_04 / SUBSCRIPTION_PROTOCOL">
        <Eyebrow>Tiers</Eyebrow>
        <h2 style={h2Style}>SUBSCRIPTION_PROTOCOL</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", maxWidth: "800px", margin: "3rem auto 0" }}>
          <PricingCard
            name="COMMUNITY_CORE"
            price="$0"
            features={["CSV Ingestion", "Basic Categorization", "3 Exports / Month", "Community Support"]}
            accent={false}
          />
          <PricingCard
            name="NEURAL_OVERDRIVE"
            price="$29/mo"
            features={["Smart PDF Parsing", "AI Outlier Detection", "Unlimited Exports", "Custom Neural Rules", "Priority API"]}
            accent={true}
          />
        </div>
      </Section>

      {/* Final CTA */}
      <Section accent="MISSION_CRITICAL">
        <BigTitle style={{ fontSize: "4rem" }}>READY?</BigTitle>
        <Sub>Upload your first statement. Zero setup. Instant results.</Sub>
        <a href="/" style={ctaStyle}>
          LAUNCH_STATIFY_OS →
        </a>
      </Section>
    </main>
  );
}

/* ── Utility Components ───────────────────────────────────────────────── */

function Section({ children, accent, id }: { children: React.ReactNode; accent?: string; id?: string }) {
  return (
    <section
      id={id}
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        padding: "6rem 4rem",
        position: "relative",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
      }}
    >
      {accent && (
        <p
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "0.6rem",
            letterSpacing: "0.4em",
            color: "rgba(0,255,148,0.5)",
            textTransform: "uppercase",
            marginBottom: "2rem",
          }}
        >
          {accent}
        </p>
      )}
      {children}
    </section>
  );
}

function BigTitle({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <h1
      style={{
        fontFamily: "'Clash Display', 'JetBrains Mono', monospace",
        fontSize: "6rem",
        fontWeight: 900,
        textTransform: "uppercase",
        letterSpacing: "-0.02em",
        lineHeight: 0.9,
        filter: "drop-shadow(0 0 20px rgba(0,255,148,0.25))",
        ...style,
      }}
    >
      {children}
    </h1>
  );
}

const h2Style: React.CSSProperties = {
  fontSize: "2.5rem",
  fontWeight: 900,
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  color: "#00ff94",
  marginBottom: "1rem",
};

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontSize: "0.65rem",
        letterSpacing: "0.5em",
        color: "rgba(255,255,255,0.25)",
        textTransform: "uppercase",
        marginBottom: "1rem",
      }}
    >
      {children}
    </p>
  );
}

function Sub({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        color: "rgba(255,255,255,0.4)",
        maxWidth: "560px",
        margin: "1.5rem auto",
        fontSize: "0.9rem",
        lineHeight: 1.7,
        textTransform: "uppercase",
        letterSpacing: "0.1em",
      }}
    >
      {children}
    </p>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(0,255,148,0.12)",
        padding: "3rem",
        maxWidth: "700px",
        margin: "2rem auto 0",
        textAlign: "left",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0, left: 0, right: 0,
          height: "2px",
          background: "linear-gradient(90deg, transparent, #00ff94, transparent)",
        }}
      />
      {children}
    </div>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div style={{ borderLeft: "2px solid #00ff94", paddingLeft: "1rem" }}>
      <p style={{ fontSize: "1.6rem", fontWeight: 900, color: "#fff", margin: 0 }}>{value}</p>
      <p style={{ fontSize: "0.6rem", letterSpacing: "0.3em", color: "rgba(255,255,255,0.3)", margin: "0.25rem 0 0", textTransform: "uppercase" }}>{label}</p>
    </div>
  );
}

function PricingCard({ name, price, features, accent }: { name: string; price: string; features: string[]; accent: boolean }) {
  return (
    <div
      style={{
        background: accent ? "rgba(0,255,148,0.03)" : "rgba(255,255,255,0.02)",
        border: `1px solid ${accent ? "rgba(0,255,148,0.35)" : "rgba(255,255,255,0.06)"}`,
        padding: "2.5rem",
        textAlign: "left",
        position: "relative",
      }}
    >
      {accent && (
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "linear-gradient(90deg,transparent,#00ff94,transparent)" }} />
      )}
      <p style={{ fontSize: "0.6rem", letterSpacing: "0.3em", color: accent ? "#00ff94" : "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: "0.5rem" }}>{name}</p>
      <p style={{ fontSize: "2rem", fontWeight: 900, marginBottom: "1.5rem" }}>{price}</p>
      <ul style={{ listStyle: "none", padding: 0, margin: "0 0 2rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {features.map((f) => (
          <li key={f} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ width: "4px", height: "4px", background: accent ? "#00ff94" : "rgba(255,255,255,0.2)", flexShrink: 0 }} />
            <span style={{ fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)" }}>{f}</span>
          </li>
        ))}
      </ul>
      <a
        href="/"
        style={{
          display: "block",
          textAlign: "center",
          padding: "0.75rem",
          fontSize: "0.65rem",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          textDecoration: "none",
          fontWeight: 700,
          background: accent ? "#00ff94" : "transparent",
          color: accent ? "#000" : "rgba(255,255,255,0.4)",
          border: accent ? "none" : "1px solid rgba(255,255,255,0.12)",
          transition: "all 0.2s",
        }}
      >
        {accent ? "UPGRADE_SYSTEM" : "DEPLOY_FREE"}
      </a>
    </div>
  );
}

const ctaStyle: React.CSSProperties = {
  display: "inline-block",
  marginTop: "2rem",
  padding: "0.75rem 2.5rem",
  background: "#00ff94",
  color: "#000",
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: "0.7rem",
  fontWeight: 700,
  letterSpacing: "0.2em",
  textTransform: "uppercase",
  textDecoration: "none",
};
