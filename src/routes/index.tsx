import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { createClient } from "@supabase/supabase-js";
import { loadStripe } from "@stripe/stripe-js";

// ---------- Config ----------
const SUPABASE_URL = "https://zbeuyxmldtdghvgqcpar.supabase.co";
const SUPABASE_ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiZXV5eG1sZHRkZ2h2Z3FjcGFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyMjc1NjEsImV4cCI6MjA5NTgwMzU2MX0.owcRoURxatFL4tap48dEPe8CM_e3F47WLkhSzQ9l61M";
const EDGE_FN = `${SUPABASE_URL}/functions/v1/generate-audit`;
const STRIPE_PK = "pk_live_51TAqA9LPcYxQfZIIPZ3uZDTBk2ClCmt8gs263meKOmN0DfwnDFoLjKqPCaBGLLcRUObOot8FXD0hWYHFQuIpHS7i00nhLpZAR4";
  "pk_live_51TAqA9LPcYxQfZIIPZ3uZDTBk2ClCmt8gs263meKOmN0DfwnDFoLjKqPCaBGLLcRUObOot8FXD0hWYHFQuIpHS7i00nhLpZAR4";
const PRICE_ID = "price_1TdBm3LPcYxQfZIIiks7iWWX";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);
const stripePromise = loadStripe(STRIPE_PK);

// ---------- Logo ----------
const LogoSVG = ({ className = "" }: { className?: string }) => (
  <img
    src="https://raw.githubusercontent.com/DiamondM-png/audit-my-cards/main/public/images/logo.png"
    alt="MyCardAudit"
    className={className}
    style={{ height: "60px", width: "auto" }}
  />
);

// ---------- Stripe checkout ----------
async function startCheckout() {
  try {
    const stripe = await stripePromise;
    if (!stripe) throw new Error("Stripe failed to load");
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    // @ts-expect-error redirectToCheckout still works at runtime in client-only mode
    const { error } = await stripe.redirectToCheckout({
      lineItems: [{ price: PRICE_ID, quantity: 1 }],
      mode: "payment",
      successUrl: `${origin}/?payment=success`,
      cancelUrl: `${origin}/`,
    });
    if (error) alert(error.message);
  } catch (e) {
    alert((e as Error).message);
  }
}

// ---------- Fade-in hook ----------
function useFadeIn<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
          obs.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    el.style.opacity = "0";
    el.style.transform = "translateY(24px)";
    el.style.transition = "opacity 0.8s ease, transform 0.8s ease";
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useFadeIn<HTMLDivElement>();
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

// ---------- Industry image with fallback ----------
const INDUSTRIES: { label: string; emoji: string; url: string }[] = [
  { label: "Contractors", emoji: "🔨", url: "https://raw.githubusercontent.com/DiamondM-png/audit-my-cards/main/public/images/contractor.png" },
  { label: "Healthcare", emoji: "🩺", url: "https://raw.githubusercontent.com/DiamondM-png/audit-my-cards/main/public/images/healthcare.png" },
  { label: "Restaurants", emoji: "🍽️", url: "https://raw.githubusercontent.com/DiamondM-png/audit-my-cards/main/public/images/restaurant.png" },
  { label: "Retail", emoji: "🛍️", url: "https://raw.githubusercontent.com/DiamondM-png/audit-my-cards/main/public/images/retail.png" },
  { label: "Trucking", emoji: "🚛", url: "https://raw.githubusercontent.com/DiamondM-png/audit-my-cards/main/public/images/trucking.png" },
  { label: "Real Estate", emoji: "🏢", url: "https://raw.githubusercontent.com/DiamondM-png/audit-my-cards/main/public/images/realestate.png" },
];

function IndustryCard({ label, emoji, url }: { label: string; emoji: string; url: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="relative overflow-hidden rounded-xl aspect-[4/3] group">
      {!failed ? (
        <img
          src={url}
          alt={label}
          onError={() => setFailed(true)}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      ) : (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center text-6xl"
          style={{ background: "linear-gradient(135deg,#0A1628 0%,#112240 100%)" }}
        >
          <span>{emoji}</span>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628] via-[#0A1628]/40 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <span className="inline-block text-white font-display text-2xl font-bold border-b-2 border-[#C9A84C] pb-1">
          {label}
        </span>
      </div>
    </div>
  );
}

// ---------- Audit Tool ----------
const BUSINESS_TYPES = [
  "General Contractor",
  "Medical / Dental",
  "Restaurant / Food Service",
  "Retail / E-commerce",
  "Trucking / Logistics",
  "Real Estate",
  "Professional Services",
  "Other",
];

const SPEND_CATEGORIES = [
  { key: "travel", label: "Travel (flights, hotels)" },
  { key: "gas", label: "Gas / Fuel" },
  { key: "dining", label: "Dining / Meals" },
  { key: "office_supplies", label: "Office Supplies" },
  { key: "advertising", label: "Advertising / Marketing" },
  { key: "shipping", label: "Shipping" },
  { key: "utilities", label: "Utilities / Internet" },
  { key: "other", label: "Other Business Spend" },
];

type Report = {
  monthlySpend: number;
  annualSpend: number;
  currentAnnualRewards: number;
  projectedAnnualRewards: number;
  delta: number;
  recommendations: { name: string; reason: string; rate: string }[];
  actionPlan: string[];
};

function fallbackReport(spend: Record<string, number>, currentRate: number): Report {
  const monthlySpend = Object.values(spend).reduce((a, b) => a + (Number(b) || 0), 0);
  const annualSpend = monthlySpend * 12;
  const currentAnnualRewards = Math.round(annualSpend * (currentRate / 100));
  const projectedAnnualRewards = Math.round(annualSpend * 0.035);
  return {
    monthlySpend,
    annualSpend,
    currentAnnualRewards,
    projectedAnnualRewards,
    delta: projectedAnnualRewards - currentAnnualRewards,
    recommendations: [
      { name: "Chase Ink Business Preferred", reason: "3X on travel, shipping, advertising, internet", rate: "3X categories + 1X base" },
      { name: "Amex Business Gold", reason: "4X on top 2 spend categories monthly", rate: "4X top-2 / 1X base" },
      { name: "Capital One Spark Cash Plus", reason: "Flat 2% cash back, no category caps", rate: "2% unlimited" },
    ],
    actionPlan: [
      "Apply for the highest-multiplier card matching your largest spend bucket this week",
      "Route bonus-category spend through the new card immediately",
      "Add a flat 2% catch-all card for everything outside bonus categories",
    ],
  };
}

function AuditTool() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [businessType, setBusinessType] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [spend, setSpend] = useState<Record<string, number>>({});
  const [currentCard, setCurrentCard] = useState("");
  const [currentRate, setCurrentRate] = useState<number>(1);
  const [report, setReport] = useState<Report | null>(null);

  const setSpendVal = (k: string, v: string) =>
    setSpend((s) => ({ ...s, [k]: Number(v) || 0 }));

  async function generate() {
    if (!businessType || !email) {
      alert("Please complete the previous step.");
      setStep(1);
      return;
    }
    setStep(3);
    const payload = {
      business_type: businessType,
      business_name: businessName,
      email,
      spend_inputs: { ...spend, current_card: currentCard, current_rate: currentRate },
      payment_status: "paid",
    };

    // Save submission (best-effort)
    try {
      await supabase.from("audit_submissions").insert(payload);
    } catch (e) {
      console.error("Supabase insert failed", e);
    }

    // Call edge function
    let r: Report | null = null;
    try {
      const res = await fetch(EDGE_FN, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_ANON}`,
          apikey: SUPABASE_ANON,
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        if (data && (data.recommendations || data.report)) {
          r = (data.report ?? data) as Report;
        }
      }
    } catch (e) {
      console.error("Edge function failed", e);
    }

    if (!r) r = fallbackReport(spend, currentRate);
    setReport(r);
    setStep(4);
  }

  return (
    <section className="bg-[#0A1628] text-white py-20 px-4">
      <div className="max-w-[560px] mx-auto">
        <div className="flex justify-center gap-3 mb-10">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="h-2.5 w-2.5 rounded-full transition-colors"
              style={{ background: step >= n ? "#C9A84C" : "#1f2d44" }}
            />
          ))}
        </div>

        {step === 1 && (
          <div>
            <h2 className="font-display text-4xl font-bold mb-2">Your Business</h2>
            <p className="text-[#8892A4] mb-8">Tell us who you are. This takes 30 seconds.</p>
            <div className="space-y-5">
              <Field label="Business Type *">
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="input"
                >
                  <option value="">Select…</option>
                  {BUSINESS_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </Field>
              <Field label="Business Name (optional)">
                <input
                  className="input"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Acme LLC"
                />
              </Field>
              <Field label="Email *">
                <input
                  type="email"
                  className="input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@business.com"
                />
              </Field>
            </div>
            <button
              onClick={() => {
                if (!businessType || !email) return alert("Business type and email are required.");
                setStep(2);
              }}
              className="btn-gold w-full mt-8"
            >
              Next: Monthly Spend →
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="font-display text-4xl font-bold mb-2">Monthly Spend</h2>
            <p className="text-[#8892A4] mb-8">Estimate is fine. We're looking for the shape of your spend.</p>
            <div className="grid grid-cols-2 gap-4">
              {SPEND_CATEGORIES.map((c) => (
                <Field key={c.key} label={c.label}>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8892A4]">$</span>
                    <input
                      type="number"
                      min={0}
                      className="input pl-7"
                      value={spend[c.key] ?? ""}
                      onChange={(e) => setSpendVal(c.key, e.target.value)}
                      placeholder="0"
                    />
                  </div>
                </Field>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <Field label="Current Card">
                <input
                  className="input"
                  value={currentCard}
                  onChange={(e) => setCurrentCard(e.target.value)}
                  placeholder="e.g. Chase Ink Cash"
                />
              </Field>
              <Field label="Current Rewards Rate (%)">
                <input
                  type="number"
                  min={0}
                  step={0.1}
                  className="input"
                  value={currentRate}
                  onChange={(e) => setCurrentRate(Number(e.target.value) || 0)}
                />
              </Field>
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setStep(1)} className="btn-ghost flex-1">
                ← Back
              </button>
              <button onClick={generate} className="btn-gold flex-[2]">
                Generate My Report →
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="text-center py-16">
            <div className="mx-auto h-16 w-16 border-4 border-[#C9A84C]/30 border-t-[#C9A84C] rounded-full animate-spin" />
            <h2 className="font-display text-3xl font-bold mt-8">Analyzing Your Card Strategy…</h2>
            <p className="text-[#8892A4] mt-3">
              Our AI is reviewing your spend profile against 200+ business cards.
            </p>
          </div>
        )}

        {step === 4 && report && (
          <ReportView report={report} email={email} />
        )}
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-[#E2C172] mb-2">{label}</span>
      {children}
    </label>
  );
}

function ReportView({ report, email }: { report: Report; email: string }) {
  return (
    <div className="max-w-[560px] mx-auto">
      <div className="text-center mb-10">
        <div className="inline-block text-xs tracking-[0.25em] text-[#C9A84C] mb-3">YOUR CUSTOM REPORT</div>
        <h2 className="font-display text-4xl font-bold">Card Strategy for {email}</h2>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <Stat label="Annual Spend" value={`$${report.annualSpend.toLocaleString()}`} />
        <Stat label="Current Rewards" value={`$${report.currentAnnualRewards.toLocaleString()}`} />
        <Stat label="Projected Rewards" value={`$${report.projectedAnnualRewards.toLocaleString()}`} accent />
        <Stat label="Annual Gain" value={`+$${Math.max(report.delta, 0).toLocaleString()}`} accent />
      </div>

      <h3 className="font-display text-2xl font-bold mb-4">Recommended Card Stack</h3>
      <div className="space-y-3 mb-8">
        {report.recommendations.map((c) => (
          <div key={c.name} className="bg-[#112240] border border-[#C9A84C]/30 rounded-xl p-5">
            <div className="flex items-start justify-between gap-3">
              <h4 className="font-display text-xl font-bold text-white">{c.name}</h4>
              <span className="shrink-0 text-xs px-2 py-1 rounded bg-[#C9A84C]/15 text-[#E2C172]">{c.rate}</span>
            </div>
            <p className="text-[#8892A4] mt-2 text-sm">{c.reason}</p>
          </div>
        ))}
      </div>

      <h3 className="font-display text-2xl font-bold mb-4">Your 3-Step Action Plan</h3>
      <ol className="space-y-3 mb-10">
        {report.actionPlan.map((s, i) => (
          <li key={i} className="flex gap-4 bg-[#112240] rounded-xl p-4">
            <span className="h-8 w-8 shrink-0 rounded-full bg-[#C9A84C] text-[#0A1628] font-bold flex items-center justify-center">
              {i + 1}
            </span>
            <span className="text-white/90 pt-1">{s}</span>
          </li>
        ))}
      </ol>

      <p className="text-xs text-[#8892A4] leading-relaxed border-t border-white/10 pt-6">
        Disclaimer: This report is informational and does not constitute financial advice. Card terms, rewards rates, and
        availability are subject to change by the issuer. All sales final. No refunds.
        <br />
        <br />
        © 2026 Diamond Media Publishing LLC
      </p>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-xl p-5 border ${accent ? "border-[#C9A84C] bg-[#C9A84C]/10" : "border-white/10 bg-[#112240]"}`}>
      <div className="text-xs uppercase tracking-wider text-[#8892A4]">{label}</div>
      <div className={`font-display text-3xl font-bold mt-1 ${accent ? "text-[#E2C172]" : "text-white"}`}>{value}</div>
    </div>
  );
}

// ---------- Landing sections ----------
function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 bg-[#0A1628] border-b border-[#C9A84C]/25">
      <div className="max-w-7xl mx-auto px-5 py-3 flex items-center justify-between">
        <a href="/" aria-label="My Card Audit home" className="flex items-center">
          <LogoSVG />
        </a>
        <button onClick={startCheckout} className="hidden md:inline-flex btn-gold">
          Get My Audit — $147
        </button>
        <button
          className="md:hidden text-white p-2"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? <path d="M6 6l12 12M6 18L18 6" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
          </svg>
        </button>
      </div>
      {open && (
        <div className="md:hidden px-5 pb-4">
          <button
            onClick={() => {
              setOpen(false);
              startCheckout();
            }}
            className="btn-gold w-full"
          >
            Get My Audit — $147
          </button>
        </div>
      )}
    </header>
  );
}

function Hero() {
  return (
    <section className="bg-[#0A1628] text-white py-24 px-5 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          background:
            "radial-gradient(600px circle at 80% 20%, rgba(201,168,76,0.18), transparent 60%), radial-gradient(500px circle at 10% 90%, rgba(201,168,76,0.10), transparent 60%)",
        }}
      />
      <Reveal className="max-w-5xl mx-auto text-center relative">
        <span className="inline-block text-[11px] tracking-[0.3em] text-[#C9A84C] border border-[#C9A84C]/60 rounded-full px-4 py-1.5">
          AI-POWERED AUDIT
        </span>
        <h1 className="font-display text-5xl md:text-[64px] leading-[1.05] font-black mt-7">
          You're Leaving <span className="text-[#C9A84C]">Thousands</span>
          <br />
          on the Table Every Month
        </h1>
        <p className="text-lg text-[#8892A4] mt-6 max-w-2xl mx-auto">
          Enter your monthly business spend and our AI builds your optimized card strategy in under 30 seconds.
        </p>

        <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto mt-10">
          <div className="bg-[#112240] border border-[#C9A84C]/40 rounded-xl p-6 text-left">
            <div className="font-display text-3xl font-bold text-[#E2C172]">$14,400</div>
            <div className="text-sm text-[#8892A4] mt-1">Avg annual savings found</div>
          </div>
          <div className="bg-[#112240] border border-[#C9A84C]/40 rounded-xl p-6 text-left">
            <div className="font-display text-3xl font-bold text-[#E2C172]">3 min</div>
            <div className="text-sm text-[#8892A4] mt-1">To complete your audit</div>
          </div>
        </div>

        <button onClick={startCheckout} className="btn-gold mt-10 text-lg px-10 py-5">
          Get My Business Card Audit — $147 →
        </button>
        <p className="text-xs text-[#8892A4] mt-4">
          One-time payment · Instant delivery · No refunds
        </p>
      </Reveal>
    </section>
  );
}

function SocialProof() {
  const quotes = [
    { q: "Switched cards based on the report. Earning $1,400/month now instead of $400. Paid for itself in 3 days.", n: "Mike T., General Contractor" },
    { q: "I had no idea my dental supply spend qualified for 4X points. This audit changed how I think about every purchase.", n: "Dr. Sarah K., Dentist" },
    { q: "Simple, fast, and the recommendations were spot on. Best $147 I've spent on my business this year.", n: "James R., Restaurant Owner" },
  ];
  return (
    <section className="bg-[#F5F0E8] py-20 px-5">
      <Reveal className="max-w-6xl mx-auto">
        <h2 className="font-display text-4xl md:text-5xl font-bold text-center text-[#0A1628] mb-12">
          What Business Owners Are Saying
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {quotes.map((q) => (
            <div key={q.n} className="bg-white rounded-xl p-7 shadow-[0_10px_30px_-15px_rgba(10,22,40,0.18)] border-l-4 border-[#C9A84C]">
              <p className="text-[#0A1628] text-lg leading-relaxed">"{q.q}"</p>
              <p className="mt-5 text-sm font-semibold text-[#8892A4]">— {q.n}</p>
            </div>
          ))}
        </div>
      </Reveal>
      <Reveal>
        <h2 className="font-display text-4xl md:text-5xl font-bold mt-16">See How It Works</h2>
        <p className="text-[#8892A4] mt-3 mb-10">Watch a full software demo — see exactly what you get for $147</p>
        <div className="mx-auto rounded-2xl overflow-hidden border-2 border-[#C9A84C]/70 shadow-2xl" style={{ maxWidth: 860 }}>
          <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
            <iframe
              className="absolute inset-0 w-full h-full"
              src="https://www.youtube.com/embed/fUizaHzSIO4"
              title="My Card Audit Software Demo"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function DemoVideo() {
  return (
    <section className="bg-[#0A1628] py-20 px-5 text-white">
      <Reveal className="max-w-5xl mx-auto text-center">
        <h2 className="font-display text-4xl md:text-5xl font-bold">See It In Action</h2>
        <p className="text-[#8892A4] mt-3 mb-10">Watch a real audit completed in under 3 minutes</p>
        <div className="mx-auto rounded-2xl overflow-hidden border-2 border-[#C9A84C]/70 shadow-2xl" style={{ maxWidth: 860 }}>
          <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
            <iframe
              className="absolute inset-0 w-full h-full"
              src="https://www.youtube.com/embed/hp2oMPUeK1A"
              title="My Card Audit Demo"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function IndustryGrid() {
  return (
    <section className="bg-white py-20 px-5">
      <Reveal className="max-w-6xl mx-auto">
        <h2 className="font-display text-4xl md:text-5xl font-bold text-center text-[#0A1628]">
          Built for Operators, Not Tourists
        </h2>
        <p className="text-[#8892A4] text-center mt-4 max-w-2xl mx-auto">
          If you're spending $10K+/month on a business card, you're leaving money on the table. Period.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {INDUSTRIES.map((i) => (
            <IndustryCard key={i.label} {...i} />
          ))}
        </div>
      </Reveal>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: "01", t: "Enter Your Monthly Spend", d: "Categorize where your business spends each month — takes under 2 minutes" },
    { n: "02", t: "AI Analyzes Your Card Strategy", d: "Our engine matches your spend profile against the entire US business card market" },
    { n: "03", t: "Get Your Custom Report Instantly", d: "Real card recommendations, projected rewards, and a 3-step action plan" },
  ];
  return (
    <section className="bg-[#F5F0E8] py-20 px-5">
      <Reveal className="max-w-6xl mx-auto">
        <h2 className="font-display text-4xl md:text-5xl font-bold text-center text-[#0A1628] mb-16">How It Works</h2>
        <div className="relative grid md:grid-cols-3 gap-10">
          <div className="hidden md:block absolute top-8 left-[16%] right-[16%] h-px bg-[#C9A84C]/40" />
          {steps.map((s) => (
            <div key={s.n} className="text-center relative">
              <div className="mx-auto h-16 w-16 rounded-full bg-[#C9A84C] text-[#0A1628] font-display font-bold text-xl flex items-center justify-center shadow-lg relative">
                {s.n}
              </div>
              <h3 className="font-display text-2xl font-bold text-[#0A1628] mt-6">{s.t}</h3>
              <p className="text-[#8892A4] mt-3 leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

function WhatYouGet() {
  const items = [
    "Personalized 2-3 card stack recommendation",
    "Projected annual rewards vs your current earnings",
    "Side-by-side comparison with real card data",
    "Step-by-step action plan to deploy this week",
  ];
  return (
    <section className="bg-[#0A1628] py-20 px-5 text-white">
      <Reveal className="max-w-5xl mx-auto">
        <h2 className="font-display text-4xl md:text-5xl font-bold text-center mb-12">What You Get</h2>
        <div className="grid sm:grid-cols-2 gap-5">
          {items.map((it) => (
            <div key={it} className="bg-[#112240] border border-[#C9A84C]/25 rounded-xl p-6 flex items-start gap-4">
              <span className="shrink-0 h-9 w-9 rounded-full bg-[#C9A84C] text-[#0A1628] flex items-center justify-center font-bold">
                ✓
              </span>
              <span className="text-lg pt-1">{it}</span>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

function PriceBlock() {
  return (
    <section
      className="py-24 px-5 text-center"
      style={{ background: "linear-gradient(135deg,#C9A84C 0%,#A8862A 100%)" }}
    >
      <Reveal className="max-w-3xl mx-auto text-[#0A1628]">
        <div className="text-xs tracking-[0.3em] font-semibold">ONE-TIME PAYMENT</div>
        <div className="font-display font-black mt-4" style={{ fontSize: 96, lineHeight: 1 }}>
          $147
        </div>
        <p className="mt-4 text-lg font-medium">Instant delivery. All sales final. No refunds.</p>
        <button
          onClick={startCheckout}
          className="mt-8 inline-flex items-center justify-center bg-[#0A1628] text-white font-semibold px-10 py-5 rounded-full text-lg shadow-xl hover:bg-[#112240] transition-colors"
        >
          Start My Audit Now →
        </button>
        <p className="text-sm mt-4 text-[#0A1628]/80">
          Join hundreds of business owners already optimizing their card rewards
        </p>
      </Reveal>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-[#0A1628] border-t border-[#C9A84C]/25 text-[#8892A4] py-10 px-5">
      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-6 items-center text-center md:text-left">
        <div className="flex md:justify-start justify-center">
          <LogoSVG />
        </div>
        <div className="text-sm">
          © 2026 Diamond Media Publishing LLC | All Sales Final | No Refunds
        </div>
        <div className="md:text-right text-sm">mycardaudit.com</div>
      </div>
    </footer>
  );
}

// ---------- Route ----------
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "My Card Audit — Stop Leaving Thousands on the Table" },
      {
        name: "description",
        content:
          "AI-powered business credit card audit. Enter your monthly spend and get an optimized card stack in under 30 seconds. $147 one-time.",
      },
      { property: "og:title", content: "My Card Audit — AI Business Card Strategy" },
      {
        property: "og:description",
        content: "Find out exactly how much you're losing on the wrong business card. Custom AI audit in 3 minutes.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Page,
});

function Page() {
  const [showAudit, setShowAudit] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("payment") === "success") {
      setShowAudit(true);
      setTimeout(() => {
        document.getElementById("audit-tool")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
    document.documentElement.style.scrollBehavior = "smooth";
  }, []);

  return (
    <div className="bg-white text-[#0A1628] font-sans antialiased">
      <Navbar />
      {showAudit && (
        <div id="audit-tool">
          <AuditTool />
        </div>
      )}
      <Hero />
      <SocialProof />
      <DemoVideo />
      <IndustryGrid />
      <HowItWorks />
      <WhatYouGet />
      <PriceBlock />
      <Footer />

      <style>{`
        .input {
          width: 100%;
          background: #112240;
          color: white;
          border: 1px solid rgba(201,168,76,0.2);
          border-radius: 10px;
          padding: 12px 14px;
          font-size: 15px;
          outline: none;
          transition: border-color .15s, box-shadow .15s;
        }
        .input::placeholder { color: #5d6a82; }
        .input:focus { border-color: #C9A84C; box-shadow: 0 0 0 3px rgba(201,168,76,0.18); }
        select.input { appearance: none; background-image: linear-gradient(45deg, transparent 50%, #C9A84C 50%), linear-gradient(135deg, #C9A84C 50%, transparent 50%); background-position: calc(100% - 18px) 50%, calc(100% - 12px) 50%; background-size: 6px 6px; background-repeat: no-repeat; padding-right: 36px; }
        select.input option { color: white; background: #0A1628; }
        .btn-gold {
          display: inline-flex; align-items: center; justify-content: center;
          background: linear-gradient(135deg, #C9A84C 0%, #E2C172 100%);
          color: #0A1628; font-weight: 700; padding: 14px 28px; border-radius: 999px;
          font-size: 15px; letter-spacing: 0.01em;
          box-shadow: 0 10px 25px -10px rgba(201,168,76,0.55);
          transition: transform .15s ease, box-shadow .15s ease, filter .15s ease;
        }
        .btn-gold:hover { transform: translateY(-1px); filter: brightness(1.05); box-shadow: 0 14px 30px -10px rgba(201,168,76,0.7); }
        .btn-ghost {
          display: inline-flex; align-items: center; justify-content: center;
          border: 1px solid rgba(201,168,76,0.4); color: #E2C172;
          padding: 14px 22px; border-radius: 999px; font-weight: 600;
          background: transparent;
        }
        .btn-ghost:hover { background: rgba(201,168,76,0.08); }
      `}</style>
    </div>
  );
}
