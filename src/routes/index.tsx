import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { loadStripe } from "@stripe/stripe-js";
import { ArrowRight, Check, CreditCard, Loader2 } from "lucide-react";

const SUPABASE_URL = "https://zbeuyxmldtdghvgqcpar.supabase.co";
const SUPABASE_ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiZXV5eG1sZHRkZ2h2Z3FjcGFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyMjc1NjEsImV4cCI6MjA5NTgwMzU2MX0.owcRoURxatFL4tap48dEPe8CM_e3F47WLkhSzQ9l61M";
const EDGE_FN = `${SUPABASE_URL}/functions/v1/generate-audit`;
const STRIPE_PK =
  "pk_live_51TAqA9LPcYxQfZIIPZ3uZDTBk2ClCmt8gs263meKOmN0DfwnDFoLjKqPCaBGLLcRUObOot8FXD0hWYHFQuIpHS7i00nhLpZAR4";
const PRICE_ID = "price_1TdBm3LPcYxQfZIIiks7iWWX";
const LOGO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_3EU7WtFDVXpmNAKDNpiKw5dTBqH/hf_20260531_141854_eac4a23a-779e-45a3-aa7b-894331fe5b51.png";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);
const stripePromise = loadStripe(STRIPE_PK);

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
        content: "Find out exactly how much you're leaving on the table every month.",
      },
      { property: "og:image", content: LOGO },
    ],
  }),
  component: Page,
});

async function startCheckout() {
  const stripe = await stripePromise;
  if (!stripe) return alert("Stripe failed to load.");
  const { error } = await (stripe as unknown as {
    redirectToCheckout: (opts: {
      lineItems: { price: string; quantity: number }[];
      mode: "payment" | "subscription";
      successUrl: string;
      cancelUrl: string;
    }) => Promise<{ error?: { message: string } }>;
  }).redirectToCheckout({
    lineItems: [{ price: PRICE_ID, quantity: 1 }],
    mode: "payment",
    successUrl: `${window.location.origin}/?payment=success`,
    cancelUrl: window.location.origin + "/",
  });
  if (error) alert(error.message);
}

function CheckoutButton({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const [loading, setLoading] = useState(false);
  return (
    <button
      onClick={async () => {
        setLoading(true);
        try {
          await startCheckout();
        } finally {
          setLoading(false);
        }
      }}
      disabled={loading}
      className={`inline-flex items-center justify-center gap-2 rounded-md bg-gold px-8 py-4 text-base sm:text-lg font-bold text-gold-foreground hover:opacity-90 transition shadow-xl disabled:opacity-60 ${className}`}
    >
      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : children}
    </button>
  );
}

function useFadeIn() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>("[data-fade]");
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("opacity-100", "translate-y-0");
            e.target.classList.remove("opacity-0", "translate-y-4");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.1 },
    );
    els.forEach((el) => {
      el.classList.add("transition-all", "duration-700", "opacity-0", "translate-y-4");
      io.observe(el);
    });
    return () => io.disconnect();
  }, []);
}

function Page() {
  const [showAudit, setShowAudit] = useState(false);
  const auditRef = useRef<HTMLDivElement>(null);
  useFadeIn();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("payment") === "success") {
      setShowAudit(true);
      setTimeout(() => auditRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }, []);

  return (
    <div className="bg-white text-navy scroll-smooth">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 bg-navy border-b border-navy-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <a href="#top" className="flex items-center">
            <img src={LOGO} alt="My Card Audit" style={{ height: 50 }} className="object-contain" />
          </a>
          <CheckoutButton className="!px-4 !py-2 !text-sm sm:!text-base">
            Get My Audit — $147
          </CheckoutButton>
        </div>
      </header>

      {/* HERO */}
      <section id="top" className="bg-navy text-white min-h-[92vh] flex items-center px-4 sm:px-6 py-20">
        <div className="max-w-5xl mx-auto text-center w-full">
          <span className="inline-block text-gold border border-gold/40 bg-gold/10 px-3 py-1 rounded-full text-xs font-bold tracking-[0.2em] uppercase mb-8">
            AI-Powered Audit
          </span>
          <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-black leading-[1.05] mb-6">
            You're Leaving <span className="text-gold">Thousands</span>
            <br />
            on the Table Every Month
          </h1>
          <p className="text-lg sm:text-xl text-white/75 max-w-2xl mx-auto mb-10">
            Enter your monthly business spend and our AI builds your optimized card strategy in under 30 seconds.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto mb-10">
            <div className="border-2 border-gold/60 rounded-md p-6 bg-navy-light/40">
              <div className="font-display text-3xl sm:text-4xl font-black text-gold mb-1">$14,400</div>
              <div className="text-sm text-white/70 uppercase tracking-wider">Avg annual savings found</div>
            </div>
            <div className="border-2 border-gold/60 rounded-md p-6 bg-navy-light/40">
              <div className="font-display text-3xl sm:text-4xl font-black text-gold mb-1">3 min</div>
              <div className="text-sm text-white/70 uppercase tracking-wider">To complete your audit</div>
            </div>
          </div>

          <CheckoutButton>
            Get My Business Card Audit — $147 <ArrowRight className="w-5 h-5" />
          </CheckoutButton>
          <p className="text-sm text-white/50 mt-4">
            One-time payment · Instant delivery · No refunds
          </p>
        </div>
      </section>

      {/* DEMO VIDEO */}
      <section className="bg-navy-light py-20 sm:py-24 px-4 sm:px-6 text-white">
        <div className="max-w-5xl mx-auto text-center" data-fade>
          <h2 className="font-display text-4xl sm:text-5xl font-black mb-3">See It In Action</h2>
          <p className="text-white/70 mb-10">Watch a real audit completed in under 3 minutes</p>
          <div className="max-w-[900px] mx-auto rounded-xl overflow-hidden shadow-2xl border border-gold/30">
            <div className="relative" style={{ paddingBottom: "56.25%" }}>
              <iframe
                className="absolute inset-0 w-full h-full"
                src="https://www.youtube.com/embed/hp2oMPUeK1A"
                title="My Card Audit demo"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </section>

      {/* INDUSTRY GRID */}
      <section className="py-20 sm:py-24 px-4 sm:px-6" style={{ backgroundColor: "#F5F0E8" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14" data-fade>
            <h2 className="font-display text-4xl sm:text-5xl font-black mb-4">
              Built for Operators, Not Tourists
            </h2>
            <p className="text-lg text-navy/70 max-w-2xl mx-auto">
              If you're spending $10K+/month on a business card, you're leaving money on the table. Period.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {[
              ["Contractors", "https://d8j0ntlcm91z4.cloudfront.net/user_3EU7WtFDVXpmNAKDNpiKw5dTBqH/hf_20260531_100507_63e68902-5664-439c-a98b-320c7df43c2d.png"],
              ["Healthcare", "https://d8j0ntlcm91z4.cloudfront.net/user_3EU7WtFDVXpmNAKDNpiKw5dTBqH/hf_20260531_100631_104871e8-13e1-4573-a5da-8fa755776c2e.png"],
              ["Restaurants", "https://d8j0ntlcm91z4.cloudfront.net/user_3EU7WtFDVXpmNAKDNpiKw5dTBqH/hf_20260531_100745_2073121e-b511-4402-a5a7-2c7fa29b9f29.png"],
              ["Retail", "https://d8j0ntlcm91z4.cloudfront.net/user_3EU7WtFDVXpmNAKDNpiKw5dTBqH/hf_20260531_100859_fef2f23b-ff42-4627-86a1-8d8db4a950e0.png"],
              ["Trucking", "https://d8j0ntlcm91z4.cloudfront.net/user_3EU7WtFDVXpmNAKDNpiKw5dTBqH/hf_20260531_101014_5418984c-c022-4531-aef7-c453924e2b94.png"],
              ["Real Estate", "https://d8j0ntlcm91z4.cloudfront.net/user_3EU7WtFDVXpmNAKDNpiKw5dTBqH/hf_20260531_102116_2dd8b3ea-6a33-421f-bd47-852e34fc01ae.png"],
            ].map(([label, src]) => (
              <div
                key={label}
                data-fade
                className="relative aspect-[4/3] rounded-lg overflow-hidden group cursor-pointer"
              >
                <img src={src} alt={label} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3 className="font-display text-white text-2xl font-black">{label}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT YOU GET */}
      <section className="bg-navy text-white py-20 sm:py-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-4xl sm:text-5xl font-black text-center mb-14" data-fade>
            What You Get
          </h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {[
              "Personalized 2-3 card stack recommendation",
              "Projected annual rewards vs your current earnings",
              "Side-by-side comparison with real card data",
              "Step-by-step action plan to deploy this week",
            ].map((t) => (
              <div
                key={t}
                data-fade
                className="flex items-start gap-4 p-6 rounded-lg bg-navy-light border border-white/5"
              >
                <div className="shrink-0 w-8 h-8 rounded-full bg-gold flex items-center justify-center">
                  <Check className="w-5 h-5 text-navy" strokeWidth={3} />
                </div>
                <span className="text-lg font-medium">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICE */}
      <section className="bg-navy text-white py-24 px-4 sm:px-6 border-t border-navy-light">
        <div className="max-w-2xl mx-auto text-center" data-fade>
          <p className="text-gold uppercase tracking-[0.3em] text-xs font-bold mb-4">One-Time Payment</p>
          <div className="font-display font-black text-gold leading-none mb-3" style={{ fontSize: 80 }}>
            $147
          </div>
          <p className="text-white/60 mb-10">Instant delivery. All sales final. No refunds.</p>
          <CheckoutButton>
            Start My Audit Now <ArrowRight className="w-5 h-5" />
          </CheckoutButton>
        </div>
      </section>

      {/* AUDIT TOOL */}
      {showAudit && (
        <section ref={auditRef} id="audit" className="bg-white py-20 px-4 sm:px-6">
          <AuditTool />
        </section>
      )}

      {/* FOOTER */}
      <footer className="bg-navy text-white/60 border-t border-navy-light py-8 px-4 text-center text-sm">
        © 2025 Diamond Media Publishing LLC &nbsp;|&nbsp; All Sales Final &nbsp;|&nbsp; No Refunds
      </footer>
    </div>
  );
}

// ===================== AUDIT TOOL =====================

type BizForm = { businessType: string; businessName: string; email: string };
type SpendForm = {
  materials: string;
  advertising: string;
  travel: string;
  equipment: string;
  utilities: string;
  payroll: string;
  office: string;
  other: string;
  currentCard: string;
  rewardsRate: string;
};

const BIZ_TYPES = [
  "Contractor / Construction",
  "Healthcare / Dental / Medical",
  "Restaurant / Food Service",
  "Retail / E-commerce",
  "Trucking / Logistics",
  "Real Estate",
  "Professional Services",
  "Other",
];

const SPEND_FIELDS: { key: keyof SpendForm; label: string }[] = [
  { key: "materials", label: "Materials / Supplies" },
  { key: "advertising", label: "Advertising / Marketing" },
  { key: "travel", label: "Travel / Gas / Fleet" },
  { key: "equipment", label: "Equipment / Tools" },
  { key: "utilities", label: "Utilities / Telecom" },
  { key: "payroll", label: "Payroll / Contractors" },
  { key: "office", label: "Office / Admin" },
  { key: "other", label: "Other Business" },
];

function AuditTool() {
  const [step, setStep] = useState(0);
  const [biz, setBiz] = useState<BizForm>({ businessType: "", businessName: "", email: "" });
  const [spend, setSpend] = useState<SpendForm>({
    materials: "",
    advertising: "",
    travel: "",
    equipment: "",
    utilities: "",
    payroll: "",
    office: "",
    other: "",
    currentCard: "",
    rewardsRate: "",
  });
  const [report, setReport] = useState<AuditReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    setStep(2);
    try {
      const payload = {
        business_type: biz.businessType,
        business_name: biz.businessName,
        email: biz.email,
        spend: Object.fromEntries(
          SPEND_FIELDS.map(({ key }) => [key, Number(spend[key]) || 0]),
        ),
        current_card: spend.currentCard,
        rewards_rate: Number(spend.rewardsRate) || 0,
      };

      // Best-effort store
      try {
        await supabase.from("audit_submissions").insert({
          business_type: payload.business_type,
          business_name: payload.business_name,
          email: payload.email,
          spend_inputs: payload.spend,
          current_card: payload.current_card,
          rewards_rate: payload.rewards_rate,
          payment_status: "paid",
        });
      } catch {
        // ignore storage failure; continue to AI
      }

      let result: AuditReport;
      try {
        const res = await fetch(EDGE_FN, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${SUPABASE_ANON}`,
          },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Edge function failed");
        result = await res.json();
      } catch {
        result = fallbackReport(payload);
      }
      setReport(result);
      setStep(3);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setStep(1);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress dots */}
      <div className="flex justify-center gap-3 mb-10">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition ${
              i <= step ? "bg-gold" : "bg-navy/20"
            }`}
          />
        ))}
      </div>

      <div className="bg-white border border-navy/10 rounded-xl shadow-xl p-6 sm:p-10">
        {step === 0 && (
          <div className="space-y-5">
            <h2 className="font-display text-3xl font-black text-navy">Your Business</h2>
            <div>
              <label className="block text-sm font-bold mb-2 text-navy">Business Type</label>
              <select
                value={biz.businessType}
                onChange={(e) => setBiz({ ...biz, businessType: e.target.value })}
                className="w-full rounded-md border border-navy/20 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gold"
              >
                <option value="">Select…</option>
                {BIZ_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold mb-2 text-navy">Business Name (optional)</label>
              <input
                type="text"
                value={biz.businessName}
                onChange={(e) => setBiz({ ...biz, businessName: e.target.value })}
                className="w-full rounded-md border border-navy/20 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2 text-navy">Email</label>
              <input
                type="email"
                value={biz.email}
                onChange={(e) => setBiz({ ...biz, email: e.target.value })}
                placeholder="you@business.com"
                className="w-full rounded-md border border-navy/20 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>
            <button
              disabled={!biz.businessType || !biz.email}
              onClick={() => setStep(1)}
              className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-gold px-6 py-3 font-bold text-gold-foreground disabled:opacity-40 hover:opacity-90"
            >
              Next: Monthly Spend <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <h2 className="font-display text-3xl font-black text-navy">Monthly Spend</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {SPEND_FIELDS.map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-xs font-bold mb-1 text-navy uppercase tracking-wide">{label}</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-navy/50">$</span>
                    <input
                      type="number"
                      min={0}
                      value={spend[key]}
                      onChange={(e) => setSpend({ ...spend, [key]: e.target.value })}
                      placeholder="0"
                      className="w-full rounded-md border border-navy/20 pl-7 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gold"
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-navy/10">
              <div>
                <label className="block text-xs font-bold mb-1 text-navy uppercase tracking-wide">Card You Use Most</label>
                <input
                  type="text"
                  value={spend.currentCard}
                  onChange={(e) => setSpend({ ...spend, currentCard: e.target.value })}
                  placeholder="e.g. Chase Ink Unlimited"
                  className="w-full rounded-md border border-navy/20 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1 text-navy uppercase tracking-wide">Est. Rewards Rate %</label>
                <input
                  type="number"
                  step="0.1"
                  value={spend.rewardsRate}
                  onChange={(e) => setSpend({ ...spend, rewardsRate: e.target.value })}
                  placeholder="1.5"
                  className="w-full rounded-md border border-navy/20 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gold"
                />
              </div>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex gap-3">
              <button onClick={() => setStep(0)} className="px-5 py-3 rounded-md border border-navy/20 font-bold text-navy">
                Back
              </button>
              <button
                onClick={submit}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-md bg-gold px-6 py-3 font-bold text-gold-foreground hover:opacity-90 shadow"
              >
                Generate My Report <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="py-20 text-center bg-navy rounded-lg -m-6 sm:-m-10 p-12">
            <div className="w-16 h-16 mx-auto mb-6 border-4 border-gold/30 border-t-gold rounded-full animate-spin" />
            <h3 className="font-display text-2xl sm:text-3xl font-black text-white mb-3">
              Analyzing Your Card Strategy...
            </h3>
            <p className="text-white/60">
              Our AI is reviewing your spend profile against 200+ business cards
            </p>
          </div>
        )}

        {step === 3 && report && <ReportView report={report} biz={biz} />}
      </div>
    </div>
  );
}

// ===================== REPORT =====================

type AuditReport = {
  additional_annual_rewards: number;
  current_monthly_rewards: number;
  optimized_monthly_rewards: number;
  spend_analysis: string;
  recommended_cards: { name: string; reason: string }[];
  action_plan: string[];
};

function fallbackReport(p: {
  spend: Record<string, number>;
  rewards_rate: number;
}): AuditReport {
  const monthly = Object.values(p.spend).reduce((a, b) => a + (Number(b) || 0), 0);
  const currentRate = (p.rewards_rate || 1.5) / 100;
  const currentMonthly = monthly * currentRate;
  const optimizedRate = 0.035; // ~3.5% blended optimized
  const optimizedMonthly = monthly * optimizedRate;
  const additionalAnnual = Math.round((optimizedMonthly - currentMonthly) * 12);
  return {
    additional_annual_rewards: Math.max(0, additionalAnnual),
    current_monthly_rewards: Math.round(currentMonthly),
    optimized_monthly_rewards: Math.round(optimizedMonthly),
    spend_analysis: `Your business runs roughly $${monthly.toLocaleString()}/month through a card earning ~${(currentRate * 100).toFixed(1)}%. The biggest gap is in your top spend categories, where category-bonus business cards routinely return 3-5x.`,
    recommended_cards: [
      { name: "Chase Ink Business Preferred", reason: "3x on advertising, travel, and shipping up to $150K/yr — best base for ad-heavy operators." },
      { name: "American Express Business Gold", reason: "4x on your two highest categories each month — automatically optimizes for shifting spend." },
      { name: "Capital One Spark Cash Plus", reason: "2% flat on everything that doesn't fit a category bonus — clean catch-all." },
    ],
    action_plan: [
      "Apply for the primary card this week to capture the welcome bonus.",
      "Route all category-matching spend through the new card immediately.",
      "Add the supplementary card after 90 days once the first sign-up bonus is earned.",
    ],
  };
}

function ReportView({ report, biz }: { report: AuditReport; biz: BizForm }) {
  const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  return (
    <div className="space-y-8 text-navy">
      <div className="border-b border-navy/10 pb-5">
        <p className="text-xs tracking-[0.3em] uppercase font-bold text-gold mb-2">
          My Card Audit — Confidential Report
        </p>
        <h2 className="font-display text-2xl sm:text-3xl font-black">
          {biz.businessName || biz.businessType}
        </h2>
        <p className="text-sm text-navy/60 mt-1">{date} · {biz.email}</p>
      </div>

      <div className="bg-gold/15 border-2 border-gold rounded-lg p-8 text-center">
        <p className="text-xs tracking-[0.25em] uppercase font-bold text-navy mb-3">
          Estimated Additional Annual Rewards
        </p>
        <div className="font-display font-black text-gold leading-none" style={{ fontSize: 64 }}>
          ${report.additional_annual_rewards.toLocaleString()}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="border border-navy/15 bg-white rounded-lg p-5 text-center">
          <p className="text-xs uppercase tracking-wider text-navy/60 mb-2">Current Monthly</p>
          <p className="font-display text-3xl font-black">
            ${report.current_monthly_rewards.toLocaleString()}
          </p>
        </div>
        <div className="border-2 border-gold rounded-lg p-5 text-center bg-gold/5">
          <p className="text-xs uppercase tracking-wider text-navy/60 mb-2">Optimized Monthly</p>
          <p className="font-display text-3xl font-black text-gold">
            ${report.optimized_monthly_rewards.toLocaleString()}
          </p>
        </div>
      </div>

      <div>
        <h3 className="font-display text-xl font-black mb-3">Spend Analysis</h3>
        <p className="text-navy/80 leading-relaxed">{report.spend_analysis}</p>
      </div>

      <div>
        <h3 className="font-display text-xl font-black mb-4">Recommended Card Stack</h3>
        <div className="space-y-3">
          {report.recommended_cards.map((c, i) => (
            <div key={i} className="flex gap-4 p-5 border border-navy/15 rounded-lg">
              <CreditCard className="w-6 h-6 text-gold shrink-0 mt-1" />
              <div>
                <p className="font-bold text-lg">{c.name}</p>
                <p className="text-navy/70 text-sm mt-1">{c.reason}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-display text-xl font-black mb-4">3-Step Action Plan</h3>
        <div className="space-y-3">
          {report.action_plan.map((s, i) => (
            <div key={i} className="flex gap-4 items-start">
              <div className="shrink-0 w-9 h-9 rounded-full bg-gold flex items-center justify-center font-display font-black text-navy">
                {i + 1}
              </div>
              <p className="text-navy/85 pt-1.5">{s}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-navy/55 leading-relaxed border-t border-navy/10 pt-5">
        This report is generated by AI based on publicly available card data. Always verify card terms directly with issuers. My Card Audit is not a financial advisor. © 2025 Diamond Media Publishing LLC — All Sales Final · No Refunds
      </p>
    </div>
  );
}