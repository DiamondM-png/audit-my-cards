import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { submitAudit } from "@/lib/audit.functions";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Loader2, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/audit")({
  head: () => ({
    meta: [
      { title: "Your Audit — My Card Audit" },
      { name: "description", content: "Tell us about your business spend. Your custom card strategy report is 3 minutes away." },
    ],
  }),
  component: AuditPage,
});

const CATEGORIES: { key: keyof SpendShape; label: string; hint: string }[] = [
  { key: "materials", label: "Materials / Supplies", hint: "Inventory, raw materials, products you resell" },
  { key: "payroll", label: "Payroll / Contractors", hint: "Wages, 1099s, payroll services" },
  { key: "travel", label: "Travel", hint: "Flights, hotels, rideshare, fuel" },
  { key: "advertising", label: "Advertising / Marketing", hint: "Meta, Google, agencies, print" },
  { key: "utilities", label: "Utilities / Software", hint: "Phone, internet, SaaS subscriptions" },
  { key: "other", label: "Other Business Spend", hint: "Anything not listed above" },
];

type SpendShape = {
  materials: number;
  payroll: number;
  travel: number;
  advertising: number;
  utilities: number;
  other: number;
};

const EMPTY: SpendShape = { materials: 0, payroll: 0, travel: 0, advertising: 0, utilities: 0, other: 0 };

function AuditPage() {
  const navigate = useNavigate();
  const submit = useServerFn(submitAudit);
  const [step, setStep] = useState(0);
  const [businessType, setBusinessType] = useState("");
  const [email, setEmail] = useState("");
  const [spend, setSpend] = useState<SpendShape>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = Object.values(spend).reduce((a, b) => a + Number(b || 0), 0);

  const next = () => setStep((s) => s + 1);
  const back = () => setStep((s) => Math.max(0, s - 1));

  const finalize = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await submit({ data: { email, businessType, spend } });
      navigate({ to: "/report/$id", params: { id: res.id } });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted">
      <SiteHeader />
      <main className="flex-1 px-6 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Progress */}
          <div className="flex gap-2 mb-8">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded ${i <= step ? "bg-gold" : "bg-border"}`}
              />
            ))}
          </div>

          <div className="bg-card border border-border rounded-md p-8 sm:p-10 shadow-sm">
            {step === 0 && (
              <div className="space-y-6">
                <div>
                  <h1 className="font-display text-3xl font-black mb-2">Tell us about your business</h1>
                  <p className="text-muted-foreground">Quick context so our AI matches the right cards.</p>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@business.com"
                    className="w-full rounded-md border border-input bg-background px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gold"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Business type</label>
                  <input
                    type="text"
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    placeholder="e.g. General Contractor, Dental Practice, Restaurant"
                    className="w-full rounded-md border border-input bg-background px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gold"
                  />
                </div>
                <button
                  disabled={!email || !businessType}
                  onClick={next}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-navy px-6 py-3 font-bold text-primary-foreground disabled:opacity-50 hover:opacity-90"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h1 className="font-display text-3xl font-black mb-2">Monthly spend breakdown</h1>
                  <p className="text-muted-foreground">Best estimate is fine. Enter $0 if a category doesn't apply.</p>
                </div>
                <div className="space-y-4">
                  {CATEGORIES.map(({ key, label, hint }) => (
                    <div key={key}>
                      <label className="block text-sm font-bold">{label}</label>
                      <p className="text-xs text-muted-foreground mb-1.5">{hint}</p>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                        <input
                          type="number"
                          min={0}
                          value={spend[key] || ""}
                          onChange={(e) => setSpend({ ...spend, [key]: Number(e.target.value) || 0 })}
                          placeholder="0"
                          className="w-full rounded-md border border-input bg-background pl-8 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-gold"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between border-t border-border pt-4">
                  <span className="text-sm text-muted-foreground">Monthly total</span>
                  <span className="font-display text-2xl font-black text-navy">
                    ${total.toLocaleString()}
                  </span>
                </div>
                <div className="flex gap-3">
                  <button onClick={back} className="px-6 py-3 rounded-md border border-border font-bold">Back</button>
                  <button
                    disabled={total === 0}
                    onClick={next}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-md bg-navy px-6 py-3 font-bold text-primary-foreground disabled:opacity-50 hover:opacity-90"
                  >
                    Review <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h1 className="font-display text-3xl font-black mb-2">Generate my audit</h1>
                  <p className="text-muted-foreground">
                    By continuing, you agree this is a final sale. No refunds.
                  </p>
                </div>
                <div className="rounded-md bg-muted border border-border p-5 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Business</span><span className="font-bold">{businessType}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span className="font-bold">{email}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Annual spend</span><span className="font-bold">${(total * 12).toLocaleString()}</span></div>
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <div className="flex gap-3">
                  <button onClick={back} disabled={loading} className="px-6 py-3 rounded-md border border-border font-bold">Back</button>
                  <button
                    onClick={finalize}
                    disabled={loading}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-md bg-gold px-6 py-3 font-bold text-gold-foreground disabled:opacity-50 hover:opacity-90 shadow"
                  >
                    {loading ? (<><Loader2 className="w-4 h-4 animate-spin" /> Generating report…</>) : (<>Generate My Report <ArrowRight className="w-4 h-4" /></>)}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Generation takes 15-30 seconds while our AI runs your numbers.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}